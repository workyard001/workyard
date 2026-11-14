import {
  jsonResponse,
  createAdminClient,
  getPaystackSecret,
  finalizeOrRecordPaystackResult,
  verifyPaystackTransaction,
  validPaystackReference,
} from "../_shared/paystack.ts";

function constantTimeEqualHex(left: string, right: string): boolean {
  if (!/^[0-9a-f]{128}$/i.test(left) || !/^[0-9a-f]{128}$/i.test(right)) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i++) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return mismatch === 0;
}

async function hmacSha512Hex(secret: string, message: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, message);
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function concatBytes(first: Uint8Array, second: Uint8Array): Uint8Array {
  const combined = new Uint8Array(first.length + second.length);
  combined.set(first, 0);
  combined.set(second, first.length);
  return combined;
}

async function verifyModernSignature(
  rawBody: Uint8Array,
  header: string,
  signingSecret: string,
): Promise<boolean> {
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const part of header.split(",")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (key === "t") {
      if (timestamp !== null || !/^[0-9]+$/.test(value)) return false;
      timestamp = value;
    } else if (key === "v1") {
      const colon = value.indexOf(":");
      if (colon >= 0) signatures.push(value.slice(colon + 1));
    }
  }

  if (!timestamp || signatures.length === 0) return false;
  const timestampNumber = Number(timestamp);
  if (!Number.isSafeInteger(timestampNumber) ||
      Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > 300) {
    return false;
  }

  const payload = concatBytes(
    new TextEncoder().encode(`${timestamp}.`),
    rawBody,
  );
  const expected = await hmacSha512Hex(signingSecret, payload);
  return signatures.some((signature) => constantTimeEqualHex(expected, signature));
}

async function verifyLegacySignature(
  rawBody: Uint8Array,
  signature: string,
  secretKey: string,
): Promise<boolean> {
  const expected = await hmacSha512Hex(secretKey, rawBody);
  return constantTimeEqualHex(expected, signature);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    // Read exact raw bytes. Do not parse and re-serialize before signature validation.
    const rawBody = new Uint8Array(await req.arrayBuffer());
    const modernHeader = req.headers.get("paystack-signature");
    const legacyHeader = req.headers.get("x-paystack-signature");

    let validSignature = false;
    const webhookSecret = Deno.env.get("PAYSTACK_WEBHOOK_SECRET");
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (modernHeader && webhookSecret) {
      validSignature = await verifyModernSignature(rawBody, modernHeader, webhookSecret);
    }

    // Compatibility with Paystack's legacy signature while the new whsec_ mode
    // is being enabled on the Paystack dashboard.
    if (!validSignature && legacyHeader && paystackSecret) {
      validSignature = await verifyLegacySignature(rawBody, legacyHeader, paystackSecret);
    }

    if (!validSignature) {
      return jsonResponse({ error: "Invalid Paystack webhook signature." }, 401);
    }

    const event = JSON.parse(new TextDecoder().decode(rawBody));
    if (event?.event !== "charge.success") {
      return jsonResponse({ received: true, ignored: true });
    }

    const reference = event?.data?.reference;
    if (!validPaystackReference(reference)) {
      return jsonResponse({ error: "Webhook transaction reference is invalid." }, 400);
    }

    const admin = createAdminClient();
    const { data: payment, error: paymentError } = await admin
      .from("workyard_payments")
      .select("id")
      .eq("provider_reference", reference)
      .maybeSingle();

    if (paymentError) throw new Error(paymentError.message);

    // A shared Paystack account may have other transactions unrelated to WORKYARD.
    if (!payment) return jsonResponse({ received: true, ignored: true });

    // Never trust only the event payload; independently verify with Paystack.
    const verified = await verifyPaystackTransaction(reference);
    if (verified.status !== "success") {
      return jsonResponse({ error: "Paystack has not yet verified a successful payment." }, 409);
    }

    const result = await finalizeOrRecordPaystackResult(admin, reference, verified);
    return jsonResponse({ received: true, status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    console.error("paystack-webhook:", message);
    return jsonResponse({ error: "Webhook processing failed; Paystack may retry." }, 500);
  }
});
