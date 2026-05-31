import { supabase } from './supabase';

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function callEdgeFunction(
  functionName: string,
  body: Record<string, any>
): Promise<ServiceResult<any>> {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error ?? `Error ${response.status}` };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function initiateCheckout(planType: string, billingCycle: string) {
  return callEdgeFunction('stripe-create-checkout', { plan_type: planType, billing_cycle: billingCycle });
}

export async function updateSubscription(action: string, params?: Record<string, any>) {
  return callEdgeFunction('stripe-update-subscription', { action, ...params });
}

// Reports KYC status. Pass a document type to (re)start Stripe Identity
// verification for it — the response's `verification_url` is the Stripe-hosted
// page the app opens so the user can capture their documents.
export async function checkKycStatus(verifyDocument?: 'national_id' | 'license') {
  return callEdgeFunction('kyc-status-check', verifyDocument ? { verify_document: verifyDocument } : {});
}

export async function calculateDaysRemaining() {
  return callEdgeFunction('calculate-days-remaining', {});
}

// M6 — Stripe Customer Portal. Returns a short-lived URL the mobile app opens
// in an in-app browser so the user can update card / view Stripe invoices.
export async function createBillingPortalSession() {
  return callEdgeFunction('stripe-portal-session', {});
}
