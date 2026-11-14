import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.49.1";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function readDefaultKey(envName: string): string | null {
  const raw = Deno.env.get(envName);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.default === "string") return parsed.default;
  } catch {
    // Some older projects expose a single key instead of a JSON key map.
  }
  return null;
}

function getPublishableKey(): string {
  const key =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    readDefaultKey("SUPABASE_PUBLISHABLE_KEYS");

  if (!key) throw new Error("Supabase publishable key is not configured.");
  return key;
}

function getServerKey(): string {
  const key =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    readDefaultKey("SUPABASE_SECRET_KEYS");

  if (!key) throw new Error("Supabase server secret key is not configured.");
  return key;
}

export function getSupabaseUrl(): string {
  const url = Deno.env.get("SUPABASE_URL");
  if (!url) throw new Error("SUPABASE_URL is not configured.");
  return url;
}

export function getPaystackSecret(): string {
  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured.");

  const mode = (Deno.env.get("PAYSTACK_MODE") ?? "test").toLowerCase();
  if (mode === "test" && !secret.startsWith("sk_test_")) {
    throw new Error("PAYSTACK_MODE is test, but the configured key is not a Paystack test key.");
  }
  if (mode === "live" && !secret.startsWith("sk_live_")) {
    throw new Error("PAYSTACK_MODE is live, but the configured key is not a Paystack live key.");
  }
  if (mode !== "test" && mode !== "live") {
    throw new Error("PAYSTACK_MODE must be either test or live.");
  }

  return secret;
}

export type AuthenticatedUser = {
  client: SupabaseClient;
  userId: string;
};

export async function authenticateUser(req: Request): Promise<AuthenticatedUser> {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("AUTH: Sign-in required.");
  }

  const jwt = authorization.slice(7);
  const client = createClient(getSupabaseUrl(), getPublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  const { data, error } = await client.auth.getUser(jwt);
  if (error || !data.user) throw new Error("AUTH: Invalid or expired sign-in session.");

  return { client, userId: data.user.id };
}

export function createAdminClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getServerKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function verifyPaystackTransaction(reference: string) {
  const secret = getPaystackSecret();
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}`, Accept: "application/json" },
    },
  );

  const result = await response.json().catch(() => null);
  if (!response.ok || result?.status !== true || !result?.data) {
    const message = typeof result?.message === "string"
      ? result.message
      : "Paystack could not verify this transaction.";
    throw new Error(message);
  }

  const data = result.data;
  if (data.reference !== reference) {
    throw new Error("The Paystack verification reference does not match.");
  }

  return data;
}

export async function finalizeOrRecordPaystackResult(
  admin: SupabaseClient,
  reference: string,
  data: Record<string, unknown>,
) {
  const { data: payment, error: paymentError } = await admin
    .from("workyard_payments")
    .select("id,work_order_id,payer_id,payee_id,provider_reference,amount_kobo,currency,status")
    .eq("provider_reference", reference)
    .maybeSingle();

  if (paymentError) throw new Error(`Could not load WORKYARD payment: ${paymentError.message}`);
  if (!payment) throw new Error("WORKYARD payment reference was not found.");

  const rawAmount = data.amount;
  const amountText = typeof rawAmount === "number" || typeof rawAmount === "string"
    ? String(rawAmount)
    : "";
  if (!/^[0-9]+$/.test(amountText)) {
    throw new Error("Paystack returned an invalid transaction amount.");
  }

  let actualAmount: bigint;
  let expectedAmount: bigint;
  try {
    actualAmount = BigInt(amountText);
    expectedAmount = BigInt(String(payment.amount_kobo));
  } catch {
    throw new Error("Could not compare the verified transaction amount.");
  }

  if (actualAmount !== expectedAmount) {
    throw new Error("The verified Paystack amount does not match the WORKYARD agreement.");
  }
  if (data.currency !== payment.currency || data.currency !== "NGN") {
    throw new Error("The verified Paystack currency does not match the WORKYARD agreement.");
  }

  const providerTransactionId =
    typeof data.id === "number" || typeof data.id === "string"
      ? String(data.id)
      : "";
  if (!providerTransactionId) {
    throw new Error("Paystack did not return a transaction ID.");
  }

  if (data.status === "success") {
    const paidAt = typeof data.paid_at === "string" && !Number.isNaN(Date.parse(data.paid_at))
      ? data.paid_at
      : null;

    const { data: finalized, error: finalizeError } = await admin.rpc(
      "finalize_workyard_payment",
      {
        p_provider_reference: reference,
        p_provider_transaction_id: providerTransactionId,
        p_amount_kobo: amountText,
        p_currency: String(data.currency),
        p_paid_at: paidAt,
      },
    );
    if (finalizeError) throw new Error(`Payment verification succeeded but WORKYARD finalization failed: ${finalizeError.message}`);
    return { status: "success", finalized };
  }

  if (data.status === "failed" || data.status === "abandoned") {
    const reason = typeof data.gateway_response === "string"
      ? data.gateway_response.slice(0, 500)
      : typeof data.message === "string"
        ? data.message.slice(0, 500)
        : `Paystack transaction status: ${String(data.status)}`;

    const { error: recordError } = await admin.rpc(
      "record_workyard_payment_non_success",
      {
        p_provider_reference: reference,
        p_provider_transaction_id: providerTransactionId,
        p_status: String(data.status),
        p_failure_reason: reason,
      },
    );
    if (recordError) throw new Error(`Could not record Paystack result: ${recordError.message}`);
    return { status: String(data.status) };
  }

  return { status: typeof data.status === "string" ? data.status : "pending" };
}

export function validPaystackReference(value: unknown): value is string {
  return typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 100 &&
    /^[A-Za-z0-9.\-=]+$/.test(value);
}

export function validUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
