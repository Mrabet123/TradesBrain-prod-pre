// services/documents.ts — Report & Quote draft CRUD, PDF generation, versioning.
// D3 F2 / F3 + BuildGuide M3.
// PDF generation uses expo-print (HTML → PDF) — D4 §1 listed react-pdf which is
// a browser library; expo-print is the Expo equivalent for native and is what
// Claude Code ships in this build (see M3 Build Report deviation note).

import * as Print from 'expo-print';
import { supabase } from './supabase';
import { PAYMENT_METHODS, type PaymentMethod, DEFAULT_REPORT_SECTIONS, DEFAULT_QUOTE_SECTIONS, DEFAULT_VALIDITY_DAYS, DEFAULT_PAYMENT_METHODS } from '../constants/paymentMethods';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ReportSection {
  id: string;
  name: string;
  content: string;
  custom: boolean;
}

export interface QuoteLineItem {
  id: string;
  name: string;
  qty: number;
  unitCost: number;
}

export interface ReportDraft {
  id: string;
  sessionId: string;
  userId: string;
  versionNumber: number;
  sections: ReportSection[];
  // D5 §6.1 — Rex's suggested payment figure (midpoint of the suggested range).
  suggestedAmount: number | null;
  confirmedAmount: number | null;
  includesVat: boolean;
  includesLicense: boolean;
  voiceSummary: string;
  // ISS-H5: follow-up questions Rex surfaced while drafting (Path-B intent).
  aiFollowUps?: string[];
}

export interface QuoteDraft {
  id: string;
  sessionId: string;
  userId: string;
  versionNumber: number;
  lineItems: QuoteLineItem[];
  labourHours: number;
  hourlyRateSnapshot: number;
  paymentTerms: string;
  paymentMethods: PaymentMethod[];
  validityDays: number;
  notes: string;
  confirmedTotal: number | null;
  includesVat: boolean;
  includesLicense: boolean;
  // ISS-H5: follow-up questions Rex surfaced while drafting (Path-B intent).
  aiFollowUps?: string[];
}

export interface UserPrefs {
  sections?: string[];
  defaultIncludeVat?: boolean;
  defaultIncludeLicense?: boolean;
  defaultPaymentTerms?: string;
  paymentMethods?: PaymentMethod[];
}

export interface ProfileBlock {
  fullName: string;
  tradeType: string;
  hourlyRate: number;
  vatNumber: string;
  licenseNumber: string;
  companyName: string | null;
}

// ─── Worker preferences ─────────────────────────────────────────────────────
export async function loadPrefs(
  userId: string,
  documentType: 'report' | 'quote',
): Promise<UserPrefs | null> {
  const { data } = await supabase
    .from('worker_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('document_type', documentType)
    .maybeSingle();
  if (!data) return null;
  return {
    sections: data.sections,
    defaultIncludeVat: data.default_include_vat,
    defaultIncludeLicense: data.default_include_license,
    defaultPaymentTerms: data.default_payment_terms,
    paymentMethods: (data.default_payment_methods as PaymentMethod[]) ?? undefined,
  };
}

export async function savePrefs(
  userId: string,
  documentType: 'report' | 'quote',
  prefs: UserPrefs,
): Promise<void> {
  // Partial upsert — only columns whose pref keys are provided get written, so
  // saving section choices never clobbers saved VAT/license/payment defaults
  // (and vice-versa). Missing columns keep their existing value on conflict.
  const payload: Record<string, unknown> = {
    user_id: userId,
    document_type: documentType,
  };
  if (prefs.sections !== undefined) payload.sections = prefs.sections;
  if (prefs.defaultIncludeVat !== undefined) payload.default_include_vat = prefs.defaultIncludeVat;
  if (prefs.defaultIncludeLicense !== undefined) payload.default_include_license = prefs.defaultIncludeLicense;
  if (prefs.defaultPaymentTerms !== undefined) payload.default_payment_terms = prefs.defaultPaymentTerms;
  if (prefs.paymentMethods !== undefined) payload.default_payment_methods = prefs.paymentMethods;
  await supabase
    .from('worker_preferences')
    .upsert(payload, { onConflict: 'user_id,document_type' });
}

// ─── Versioning ─────────────────────────────────────────────────────────────
async function nextVersion(
  table: 'job_reports' | 'quotes',
  sessionId: string,
): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select('version_number')
    .eq('session_id', sessionId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.version_number ?? 0) + 1;
}

// ─── ISS-H5: AI draft generation (Rex drafts document content) ──────────────
// Rex drafts report-section content / quote line items from the worker's spoken
// summary using Haiku via the claude-proxy Edge Function. Every call is
// best-effort: any failure returns empty content so the worker can still fill
// the form manually — generation never blocks document creation.

async function callClaudeJson(
  system: string,
  userText: string,
  maxTokens: number,
): Promise<any | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/claude-proxy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          system,
          messages: [{ role: 'user', content: userText }],
          max_tokens: maxTokens,
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? '';
    if (!text) return null;
    // Claude may wrap JSON in prose or ```json fences — extract the JSON span.
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = (fenced ? fenced[1] : text).trim();
    const startBrace = candidate.search(/[[{]/);
    const slice = startBrace >= 0 ? candidate.slice(startBrace) : candidate;
    try { return JSON.parse(slice); } catch { /* fall through */ }
    try { return JSON.parse(candidate); } catch { /* give up */ }
    return null;
  } catch {
    return null;
  }
}

export async function generateReportContent(
  voiceSummary: string,
  sectionNames: string[],
  tradeType: string,
  sessionContext = '',
): Promise<{ sectionContent: Record<string, string>; followUps: string[] }> {
  const empty = { sectionContent: {} as Record<string, string>, followUps: [] as string[] };
  if (!voiceSummary.trim() && !sessionContext.trim()) return empty;
  const system =
    `You are Rex, a master ${tradeType}, drafting a professional job report from a worker's spoken job summary. ` +
    `Write concise, professional content for each named report section, using ONLY facts the summary and any prior session context support — never invent measurements, materials, or outcomes. ` +
    `If the inputs do not cover a section, use an empty string for that section. ` +
    `Also list up to 3 short follow-up questions for important details that are still missing. ` +
    `Respond with ONLY a JSON object, no prose, no code fences: ` +
    `{"sections":{"<exact section name>":"<drafted text>"},"followUps":["<question>"]}.`;
  // ISS-M12 (RQ-3): Path A passes the prior Rex session transcript so the draft
  // reflects the actual diagnosis / work done, not just the voice summary.
  const user =
    `REPORT SECTIONS: ${JSON.stringify(sectionNames)}\n\n` +
    (sessionContext.trim() ? `PRIOR REX SESSION CONTEXT:\n${sessionContext}\n\n` : '') +
    `WORKER SUMMARY:\n${voiceSummary}`;
  const parsed = await callClaudeJson(system, user, 1400);
  if (!parsed || typeof parsed !== 'object') return empty;
  const sectionContent: Record<string, string> = {};
  const src = parsed.sections && typeof parsed.sections === 'object' ? parsed.sections : {};
  for (const name of sectionNames) {
    if (typeof src[name] === 'string') sectionContent[name] = src[name];
  }
  const followUps = Array.isArray(parsed.followUps)
    ? parsed.followUps.filter((q: any) => typeof q === 'string').slice(0, 3)
    : [];
  return { sectionContent, followUps };
}

export async function generateQuoteContent(
  description: string,
  tradeType: string,
  sessionContext = '',
): Promise<{ lineItems: QuoteLineItem[]; labourHours: number; followUps: string[] }> {
  const empty = { lineItems: [] as QuoteLineItem[], labourHours: 0, followUps: [] as string[] };
  if (!description.trim() && !sessionContext.trim()) return empty;
  const system =
    `You are Rex, a master ${tradeType}, drafting a customer quote from a worker's spoken job description. ` +
    `Extract the material/parts line items and estimate labour hours, using ONLY what the description and any prior session context support. ` +
    `Leave unitCost as 0 whenever the inputs give no price — the worker fills pricing in. ` +
    `Also list up to 3 short follow-up questions for pricing or scope details the worker did not give. ` +
    `Respond with ONLY a JSON object, no prose, no code fences: ` +
    `{"lineItems":[{"name":"<item>","qty":<number>,"unitCost":<number>}],"labourHours":<number>,"followUps":["<question>"]}.`;
  // ISS-9: Path A passes the prior Rex session transcript so the quote reflects
  // the actual diagnosis and work done, not just the typed description — the
  // report builder already does this (ISS-M12 RQ-3).
  const userText =
    (sessionContext.trim() ? `PRIOR REX SESSION CONTEXT:\n${sessionContext}\n\n` : '') +
    `WORKER JOB DESCRIPTION:\n${description || '(none — draft from the session context above)'}`;
  const parsed = await callClaudeJson(system, userText, 900);
  if (!parsed || typeof parsed !== 'object') return empty;
  const rawItems = Array.isArray(parsed.lineItems) ? parsed.lineItems : [];
  const lineItems: QuoteLineItem[] = rawItems
    .filter((i: any) => i && typeof i.name === 'string' && i.name.trim())
    .slice(0, 20)
    .map((i: any, idx: number) => ({
      id: `ai-${Date.now()}-${idx}`,
      name: String(i.name).trim(),
      qty: Number(i.qty) > 0 ? Number(i.qty) : 1,
      unitCost: Number(i.unitCost) >= 0 ? Number(i.unitCost) : 0,
    }));
  const labourHours = Number(parsed.labourHours) >= 0 ? Number(parsed.labourHours) : 0;
  const followUps = Array.isArray(parsed.followUps)
    ? parsed.followUps.filter((q: any) => typeof q === 'string').slice(0, 3)
    : [];
  return { lineItems, labourHours, followUps };
}

// ─── Report CRUD ────────────────────────────────────────────────────────────
export async function createReportDraft(
  sessionId: string,
  userId: string,
  initialText: string,
  prefs: UserPrefs | null,
  tradeType = 'plumber',
  sessionContext = '',
): Promise<ReportDraft> {
  const versionNumber = await nextVersion('job_reports', sessionId);
  const sectionsList = (
    prefs?.sections?.length ? prefs.sections : (DEFAULT_REPORT_SECTIONS as readonly string[])
  ) as string[];

  // ISS-H5: Rex drafts each section from the worker's voice summary (and, on
  // Path A, the prior session context — ISS-M12 RQ-3). Best-effort — on failure
  // section 0 keeps the raw summary and the rest stay empty.
  const ai = await generateReportContent(initialText, sectionsList, tradeType, sessionContext);
  const sections: ReportSection[] = sectionsList.map((name, i) => ({
    id: `s${i}`,
    name,
    content: ai.sectionContent[name] ?? (i === 0 ? initialText : ''),
    custom: false,
  }));
  const reportText = sections.map((s) => `## ${s.name}\n${s.content}`).join('\n\n');

  const { data, error } = await supabase
    .from('job_reports')
    .insert({
      session_id: sessionId,
      user_id: userId,
      version_number: versionNumber,
      status: 'draft',
      report_text: reportText || initialText,
      sections_config: { sections },
      includes_vat: prefs?.defaultIncludeVat ?? false,
      includes_license: prefs?.defaultIncludeLicense ?? false,
    })
    .select()
    .single();
  if (error || !data) throw error;

  return {
    id: data.id,
    sessionId,
    userId,
    versionNumber,
    sections,
    suggestedAmount: null,
    confirmedAmount: null,
    includesVat: data.includes_vat,
    includesLicense: data.includes_license,
    voiceSummary: initialText,
    aiFollowUps: ai.followUps,
  };
}

export async function saveReportDraft(draft: ReportDraft): Promise<void> {
  await supabase
    .from('job_reports')
    .update({
      report_text: draft.sections.map((s) => `## ${s.name}\n${s.content}`).join('\n\n'),
      sections_config: { sections: draft.sections },
      suggested_amount: draft.suggestedAmount,
      confirmed_amount: draft.confirmedAmount,
      includes_vat: draft.includesVat,
      includes_license: draft.includesLicense,
    })
    .eq('id', draft.id);
}

export async function discardReportDraft(reportId: string): Promise<void> {
  // D3 F2 DISCARD RULE — drafts never reach archive
  await supabase.from('job_reports').delete().eq('id', reportId).eq('status', 'draft');
}

export async function confirmReport(
  draft: ReportDraft,
  profile: ProfileBlock,
): Promise<{ pdfUri: string; pdfStoragePath: string }> {
  const html = renderReportHtml(draft, profile);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const storagePath = `${draft.userId}/reports/${draft.id}-v${draft.versionNumber}.pdf`;

  const blob = await (await fetch(uri)).blob();
  const { error: upErr } = await supabase.storage
    .from('job-documents')
    .upload(storagePath, blob, { contentType: 'application/pdf', upsert: false });
  if (upErr) throw upErr;

  await saveReportDraft(draft); // ensure latest content is persisted

  // Finalise — trigger prevent_finalised_update locks the row from here.
  const { error: finalErr } = await supabase
    .from('job_reports')
    .update({
      status: 'finalised',
      pdf_url: storagePath,
      report_text: draft.sections.map((s) => `## ${s.name}\n${s.content}`).join('\n\n'),
      sections_config: { sections: draft.sections },
      // D5 §6.1 — persist Rex's suggested amount alongside the confirmed one.
      suggested_amount: draft.suggestedAmount,
      confirmed_amount: draft.confirmedAmount,
      includes_vat: draft.includesVat,
      includes_license: draft.includesLicense,
    })
    .eq('id', draft.id);
  if (finalErr) throw finalErr;

  return { pdfUri: uri, pdfStoragePath: storagePath };
}

// ─── Quote CRUD ─────────────────────────────────────────────────────────────
export async function createQuoteDraft(
  sessionId: string,
  userId: string,
  hourlyRateSnapshot: number,
  prefs: UserPrefs | null,
  seedLineItems: QuoteLineItem[] = [],
  tradeType = 'plumber',
  description = '',
  sessionContext = '',
): Promise<QuoteDraft> {
  const versionNumber = await nextVersion('quotes', sessionId);

  // ISS-H5: Rex drafts material line items + a labour-hours estimate from the
  // worker's job description. ISS-9: on Path A the prior Rex session transcript
  // is also fed in. Best-effort — falls back to the seed items only.
  const ai = await generateQuoteContent(description, tradeType, sessionContext);
  const draft: Omit<QuoteDraft, 'id'> = {
    sessionId,
    userId,
    versionNumber,
    lineItems: [...seedLineItems, ...ai.lineItems],
    labourHours: ai.labourHours,
    hourlyRateSnapshot,
    paymentTerms: prefs?.defaultPaymentTerms ?? 'Due on completion',
    paymentMethods: prefs?.paymentMethods ?? DEFAULT_PAYMENT_METHODS,
    validityDays: DEFAULT_VALIDITY_DAYS,
    notes: '',
    confirmedTotal: null,
    includesVat: prefs?.defaultIncludeVat ?? false,
    includesLicense: prefs?.defaultIncludeLicense ?? false,
    aiFollowUps: ai.followUps,
  };

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      session_id: sessionId,
      user_id: userId,
      version_number: versionNumber,
      status: 'draft',
      line_items: draft.lineItems,
      labour_hours: draft.labourHours,
      hourly_rate_snapshot: draft.hourlyRateSnapshot,
      payment_terms: draft.paymentTerms,
      includes_vat: draft.includesVat,
      includes_license: draft.includesLicense,
      sections_config: {
        paymentMethods: draft.paymentMethods,
        validityDays: draft.validityDays,
        notes: draft.notes,
      },
    })
    .select()
    .single();
  if (error || !data) throw error;
  return { ...draft, id: data.id };
}

export async function saveQuoteDraft(draft: QuoteDraft): Promise<void> {
  await supabase
    .from('quotes')
    .update({
      line_items: draft.lineItems,
      labour_hours: draft.labourHours,
      hourly_rate_snapshot: draft.hourlyRateSnapshot,
      payment_terms: draft.paymentTerms,
      confirmed_total: draft.confirmedTotal,
      includes_vat: draft.includesVat,
      includes_license: draft.includesLicense,
      sections_config: {
        paymentMethods: draft.paymentMethods,
        validityDays: draft.validityDays,
        notes: draft.notes,
      },
    })
    .eq('id', draft.id);
}

export async function discardQuoteDraft(quoteId: string): Promise<void> {
  await supabase.from('quotes').delete().eq('id', quoteId).eq('status', 'draft');
}

export async function confirmQuote(
  draft: QuoteDraft,
  profile: ProfileBlock,
): Promise<{ pdfUri: string; pdfStoragePath: string }> {
  const html = renderQuoteHtml(draft, profile);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const storagePath = `${draft.userId}/quotes/${draft.id}-v${draft.versionNumber}.pdf`;

  const blob = await (await fetch(uri)).blob();
  const { error: upErr } = await supabase.storage
    .from('job-documents')
    .upload(storagePath, blob, { contentType: 'application/pdf', upsert: false });
  if (upErr) throw upErr;

  await saveQuoteDraft(draft);

  // D5 §6.2 — Rex's suggested price band: the computed subtotal (line items +
  // labour) as the low end, plus a ~30% materials/contingency band as the high
  // end. Persisted alongside the worker's confirmed_total.
  const sub = quoteSubtotal(draft);
  const suggestedRangeMin = sub > 0 ? Math.round(sub * 100) / 100 : null;
  const suggestedRangeMax = sub > 0 ? Math.round(sub * 1.3 * 100) / 100 : null;

  const { error: finalErr } = await supabase
    .from('quotes')
    .update({
      status: 'finalised',
      pdf_url: storagePath,
      line_items: draft.lineItems,
      labour_hours: draft.labourHours,
      hourly_rate_snapshot: draft.hourlyRateSnapshot,
      payment_terms: draft.paymentTerms,
      suggested_range_min: suggestedRangeMin,
      suggested_range_max: suggestedRangeMax,
      confirmed_total: draft.confirmedTotal,
      includes_vat: draft.includesVat,
      includes_license: draft.includesLicense,
      sections_config: {
        paymentMethods: draft.paymentMethods,
        validityDays: draft.validityDays,
        notes: draft.notes,
      },
    })
    .eq('id', draft.id);
  if (finalErr) throw finalErr;

  return { pdfUri: uri, pdfStoragePath: storagePath };
}

export function quoteSubtotal(draft: QuoteDraft): number {
  const lineItemSubtotal = draft.lineItems.reduce(
    (sum, li) => sum + li.qty * li.unitCost,
    0,
  );
  const labourCost = draft.labourHours * draft.hourlyRateSnapshot;
  return lineItemSubtotal + labourCost;
}

// ISS-8 (D2 F4 step 5 / D3 F3): a suggested customer-facing total RANGE for the
// quote — the report builder already shows one (ISS-M12 RQ-4). Low end is the
// cost subtotal; high end adds a ~30% markup band, matching the screen's
// "15–30% markup is typical" guidance.
export function quoteSuggestedRange(
  draft: QuoteDraft,
): { min: number; max: number } | null {
  const subtotal = quoteSubtotal(draft);
  if (subtotal <= 0) return null;
  return {
    min: Math.round(subtotal * 100) / 100,
    max: Math.round(subtotal * 1.3 * 100) / 100,
  };
}

// ─── HTML renderers (printable to PDF) ──────────────────────────────────────
function renderReportHtml(draft: ReportDraft, profile: ProfileBlock): string {
  const sectionsHtml = draft.sections
    .map(
      (s) =>
        `<h2 style="font-size:14px;margin:18px 0 6px;color:#1E3A5F">${escapeHtml(s.name)}</h2><div style="white-space:pre-wrap;font-size:12px;line-height:1.5">${escapeHtml(s.content)}</div>`,
    )
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #222; padding: 32px; }
    h1 { font-size: 22px; margin: 0; color: #1E3A5F; }
    .meta { font-size: 11px; color: #666; margin-top: 4px; }
    .footer { margin-top: 28px; font-size: 11px; color: #666; }
    .amount { margin-top: 18px; font-size: 14px; font-weight: 600; }
  </style></head><body>
    <h1>Job Report — Version ${draft.versionNumber}</h1>
    <div class="meta">${escapeHtml(profile.fullName)} · ${escapeHtml(profile.tradeType)}${profile.companyName ? ' · ' + escapeHtml(profile.companyName) : ''}</div>
    <div class="meta">Date: ${new Date().toLocaleDateString()}</div>
    ${sectionsHtml}
    ${draft.confirmedAmount != null ? `<div class="amount">Confirmed amount: $${draft.confirmedAmount.toFixed(2)}</div>` : ''}
    <div class="footer">
      ${draft.includesVat ? `VAT: ${escapeHtml(profile.vatNumber)}<br/>` : ''}
      ${draft.includesLicense ? `License: ${escapeHtml(profile.licenseNumber)}` : ''}
    </div>
  </body></html>`;
}

function renderQuoteHtml(draft: QuoteDraft, profile: ProfileBlock): string {
  const rows = draft.lineItems
    .map(
      (li) =>
        `<tr><td>${escapeHtml(li.name)}</td><td style="text-align:right">${li.qty}</td><td style="text-align:right">$${li.unitCost.toFixed(2)}</td><td style="text-align:right">$${(li.qty * li.unitCost).toFixed(2)}</td></tr>`,
    )
    .join('');
  const subtotal = quoteSubtotal(draft);

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #222; padding: 32px; }
    h1 { font-size: 22px; margin: 0; color: #1E3A5F; }
    .meta { font-size: 11px; color: #666; margin-top: 4px; }
    table { border-collapse: collapse; width: 100%; margin-top: 12px; font-size: 12px; }
    th, td { border-bottom: 1px solid #eee; padding: 6px 4px; }
    th { background: #f7f7f7; text-align: left; }
    .right { text-align: right; }
    .footer { margin-top: 18px; font-size: 11px; color: #666; }
    .total { margin-top: 12px; font-size: 14px; font-weight: 600; text-align: right; }
  </style></head><body>
    <h1>Quote — Version ${draft.versionNumber}</h1>
    <div class="meta">${escapeHtml(profile.fullName)} · ${escapeHtml(profile.tradeType)}${profile.companyName ? ' · ' + escapeHtml(profile.companyName) : ''}</div>
    <div class="meta">Date: ${new Date().toLocaleDateString()} · Valid for ${draft.validityDays} days</div>
    <table>
      <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Unit cost</th><th class="right">Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:12px;margin-top:10px">Labour: ${draft.labourHours} h × $${draft.hourlyRateSnapshot.toFixed(2)} = $${(draft.labourHours * draft.hourlyRateSnapshot).toFixed(2)}</p>
    <div class="total">${draft.confirmedTotal != null ? `Confirmed total: $${draft.confirmedTotal.toFixed(2)}` : `Subtotal: $${subtotal.toFixed(2)}`}</div>
    <p style="font-size:12px">Payment terms: ${escapeHtml(draft.paymentTerms)}</p>
    <p style="font-size:12px">Payment methods: ${draft.paymentMethods.map(escapeHtml).join(', ')}</p>
    ${draft.notes ? `<p style="font-size:12px">Notes: ${escapeHtml(draft.notes)}</p>` : ''}
    <div class="footer">
      ${draft.includesVat ? `VAT: ${escapeHtml(profile.vatNumber)}<br/>` : ''}
      ${draft.includesLicense ? `License: ${escapeHtml(profile.licenseNumber)}` : ''}
    </div>
  </body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export { PAYMENT_METHODS };
export type { PaymentMethod };
