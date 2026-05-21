#!/usr/bin/env node
/*
 * scripts/ingest-code-document.js — Upload a code document for Code Lookup.
 *
 * Step 2 of the BD-1 ingestion pipeline (D4 Section 4.3 / D10). It reads the
 * plain-text file produced by extract-pdf-text.py and POSTs it to the
 * ingest-code-document Edge Function, which chunks the text, generates
 * embeddings (batched — CC-3), and inserts rows into code_documents +
 * code_chunks.
 *
 * The Edge Function is protected by a service-role auth gate (CC-3): the value
 * passed to --key is sent as `Authorization: Bearer <key>` and must be the
 * project's SERVICE_ROLE_KEY (Supabase -> Project Settings -> API ->
 * service_role secret). Never commit that key or paste it into shared logs.
 *
 * Requires Node 18+ (uses the built-in global fetch / AbortController).
 *
 * Usage:
 *   node scripts/ingest-code-document.js \
 *     --text    scripts/code-documents/ipc_2021.txt \
 *     --name    'International Plumbing Code' \
 *     --short   'IPC 2021' \
 *     --version 2021 \
 *     --trade   plumber \
 *     --url     https://<project-ref>.supabase.co/functions/v1/ingest-code-document \
 *     --key     <SERVICE_ROLE_KEY>
 *
 * Optional:
 *   --source-url  <url>     stored on the code_documents row
 *   --ingested-by <label>   defaults to "admin"
 */

'use strict';

const fs = require('fs');

const VALID_TRADES = ['plumber', 'electrician', 'hvac', 'roofer', 'other'];
const REQUEST_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes — large docs take a while

function fail(msg) {
  console.error(`\n  x  ${msg}\n`);
  process.exit(1);
}

// Minimal --flag value parser. A flag with no following value (or followed by
// another --flag) is treated as a boolean true.
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

async function main() {
  if (typeof fetch !== 'function') {
    fail('This script needs Node 18 or newer (global fetch is missing).');
  }

  const args = parseArgs(process.argv.slice(2));

  const textPath = args.text;
  const documentName = args.name;
  const tradeType = args.trade;
  const url = args.url;
  const key = args.key;
  const shortName = args.short;
  const version = args.version;
  const sourceUrl = args['source-url'];
  const ingestedBy = args['ingested-by'] || 'admin';

  // ── Validate ──────────────────────────────────────────────────────────────
  const missing = [];
  if (!textPath) missing.push('--text');
  if (!documentName) missing.push('--name');
  if (!tradeType) missing.push('--trade');
  if (!url) missing.push('--url');
  if (!key) missing.push('--key');
  if (missing.length) {
    fail(
      `Missing required argument(s): ${missing.join(', ')}\n` +
        '     See the usage block at the top of this script.',
    );
  }

  if (!VALID_TRADES.includes(tradeType)) {
    fail(`--trade must be one of: ${VALID_TRADES.join(', ')} (got "${tradeType}")`);
  }
  if (!fs.existsSync(textPath)) fail(`Text file not found: ${textPath}`);

  const content = fs.readFileSync(textPath, 'utf8');
  if (!content.trim()) fail(`Text file is empty: ${textPath}`);

  const sizeKB = Math.round(Buffer.byteLength(content, 'utf8') / 1024);
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  console.log('');
  console.log('  TradesBrain — Code Document Ingestion');
  console.log('  -------------------------------------');
  console.log(`  Document : ${documentName}${shortName ? ` (${shortName})` : ''}`);
  console.log(`  Version  : ${version || '1.0'}`);
  console.log(`  Trade    : ${tradeType}`);
  console.log(`  Source   : ${textPath}`);
  console.log(`  Size     : ${sizeKB} KB - approx ${wordCount.toLocaleString()} words`);
  console.log(`  Endpoint : ${url}`);
  console.log('');

  if (sizeKB < 500) {
    console.warn(`  !  Text is only ${sizeKB} KB. A full code document is usually`);
    console.warn('     larger than 500 KB — confirm the PDF extraction was complete.');
    console.warn('');
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  console.log('  Uploading. The function chunks the text, embeds it (batched),');
  console.log('  and inserts the rows. This can take a few minutes for a large');
  console.log('  document — keep this terminal open until it finishes.');
  console.log('');

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        document_name: documentName,
        short_name: shortName || documentName,
        version: version || '1.0',
        trade_type: tradeType,
        source_url: sourceUrl || null,
        ingested_by: ingestedBy,
        content,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err && err.name === 'AbortError') {
      fail(`Request timed out after ${REQUEST_TIMEOUT_MS / 60000} minutes.`);
    }
    fail(`Network error: ${err && err.message ? err.message : String(err)}`);
  }
  clearTimeout(timer);

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const bodyText = await res.text();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = bodyText;
  }

  if (!res.ok) {
    if (res.status === 401) {
      fail(
        '401 Unauthorized — the --key is not the project service-role key.\n' +
          '     Get it from Supabase -> Project Settings -> API -> service_role secret.',
      );
    }
    fail(`HTTP ${res.status} after ${elapsed}s: ${JSON.stringify(body)}`);
  }

  console.log(`  OK  Ingestion complete in ${elapsed}s`);
  if (body && typeof body === 'object') {
    console.log(`      document_id    : ${body.document_id}`);
    console.log(`      chunks_created : ${body.chunks_created}`);
  }
  console.log('');
  console.log('  Verify in Supabase:');
  console.log('    - code_documents : 1 new row');
  console.log(`    - code_chunks    : chunks_created rows, trade_type = ${tradeType}`);
  console.log('');
}

main().catch((e) => fail(e && e.message ? e.message : String(e)));
