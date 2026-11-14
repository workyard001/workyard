import {
  authenticateUser,
  corsHeaders,
  jsonResponse,
  createAdminClient,
  verifyPaystackTransaction,
  finalizeOrRecordPaystackResult,
  validPaystackReference,
} from "../_shared/paystack.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const { client, userId } = await authenticateUser(req);
    const body = await req.json().catch(() => null);
    const reference = body?.reference;

    if (!validPaystackReference(reference)) {
      return jsonResponse({ error: "A valid payment reference is required." }, 400);
    }

    // RLS allows only the payer or payee to read this payment record.
    const { data: payment, error: paymentError } = await client
      .from("workyard_payments")
      .select("id,payer_id,payee_id,provider_reference")
      .eq("provider_reference", reference)
      .maybeSingle();

    if (paymentError) throw new Error(paymentError.message);
    if (!payment || (payment.payer_id !== userId && payment.payee_id !== userId)) {
      return jsonResponse({ error: "Payment not found or access denied." }, 404);
    }

    const verified = await verifyPaystackTransaction(reference);
    const admin = createAdminClient();
    const result = await finalizeOrRecordPaystackResult(admin, reference, verified);

    return jsonResponse({
      reference,
      status: result.status,
      message: result.status === "success"
        ? "Payment verified successfully."
        : `Paystack reports this transaction as ${result.status}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify payment.";
    if (message.startsWith("AUTH:")) return jsonResponse({ error: message.slice(6).trim() }, 401);
    console.error("verify-workyard-payment:", message);
    return jsonResponse({ error: message }, 400);
  }
});
