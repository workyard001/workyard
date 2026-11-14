import {
  authenticateUser,
  corsHeaders,
  jsonResponse,
  getPaystackSecret,
  createAdminClient,
  validUuid,
} from "../_shared/paystack.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const { client } = await authenticateUser(req);
    const body = await req.json().catch(() => null);
    const workOrderId = body?.work_order_id;

    if (!validUuid(workOrderId)) {
      return jsonResponse({ error: "A valid work_order_id is required." }, 400);
    }

    const { data: preparedRows, error: prepareError } = await client.rpc(
      "prepare_workyard_payment",
      { p_work_order_id: workOrderId },
    );
    if (prepareError) throw new Error(prepareError.message);

    const prepared = Array.isArray(preparedRows) ? preparedRows[0] : preparedRows;
    if (!prepared?.payment_id || !prepared?.provider_reference) {
      throw new Error("WORKYARD did not return a valid payment reference.");
    }

    // An already initialized checkout can be safely reused.
    if (typeof prepared.authorization_url === "string" &&
        prepared.authorization_url.startsWith("https://checkout.paystack.com/")) {
      return jsonResponse({
        payment_id: prepared.payment_id,
        reference: prepared.provider_reference,
        authorization_url: prepared.authorization_url,
        reused: true,
      });
    }

    const { data: claimRows, error: claimError } = await client.rpc(
      "claim_workyard_payment_checkout",
      { p_payment_id: prepared.payment_id },
    );
    if (claimError) throw new Error(claimError.message);

    const claim = Array.isArray(claimRows) ? claimRows[0] : claimRows;
    if (!claim?.claimed) {
      if (typeof claim?.authorization_url === "string" &&
          claim.authorization_url.startsWith("https://checkout.paystack.com/")) {
        return jsonResponse({
          payment_id: prepared.payment_id,
          reference: prepared.provider_reference,
          authorization_url: claim.authorization_url,
          reused: true,
        });
      }
      return jsonResponse({
        error: "Checkout is already being initialized. Please wait briefly and try again.",
        retryable: true,
      }, 409);
    }

    const paystackSecret = getPaystackSecret();
    const siteUrlValue = Deno.env.get("WORKYARD_SITE_URL");
    if (!siteUrlValue) throw new Error("WORKYARD_SITE_URL is not configured.");

    const siteUrl = new URL(siteUrlValue);
    if (siteUrl.protocol !== "https:") {
      throw new Error("WORKYARD_SITE_URL must use HTTPS.");
    }

    const callbackUrl = new URL("/payments/callback/", siteUrl).toString();
    const amount = String(prepared.amount_kobo);

    if (!/^[0-9]+$/.test(amount) || BigInt(amount) <= 0n) {
      throw new Error("The work agreement amount is invalid.");
    }
    if (prepared.currency !== "NGN") throw new Error("Only NGN checkout is supported.");

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: prepared.customer_email,
        amount,
        currency: "NGN",
        reference: prepared.provider_reference,
        callback_url: callbackUrl,
        metadata: JSON.stringify({
          workyard_payment_id: prepared.payment_id,
          work_order_id: workOrderId,
        }),
      }),
    });

    const paystackResult = await paystackResponse.json().catch(() => null);
    const data = paystackResult?.data;
    if (!paystackResponse.ok || paystackResult?.status !== true || !data) {
      const reason = typeof paystackResult?.message === "string"
        ? paystackResult.message
        : "Paystack could not initialize checkout.";
      throw new Error(reason);
    }

    if (data.reference !== prepared.provider_reference ||
        typeof data.authorization_url !== "string" ||
        typeof data.access_code !== "string") {
      throw new Error("Paystack returned incomplete or mismatched checkout details.");
    }

    const checkoutUrl = new URL(data.authorization_url);
    if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.paystack.com") {
      throw new Error("Paystack returned an unexpected checkout destination.");
    }

    // This write is server-only: the RPC is granted to service_role only.
    const admin = createAdminClient();
    const { error: saveError } = await admin.rpc(
      "save_workyard_payment_checkout",
      {
        p_payment_id: prepared.payment_id,
        p_authorization_url: data.authorization_url,
        p_access_code: data.access_code,
      },
    );
    if (saveError) throw new Error(`Checkout was initialized but could not be saved: ${saveError.message}`);

    return jsonResponse({
      payment_id: prepared.payment_id,
      reference: prepared.provider_reference,
      authorization_url: data.authorization_url,
      reused: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not initialize payment.";
    if (message.startsWith("AUTH:")) return jsonResponse({ error: message.slice(6).trim() }, 401);
    console.error("initialize-workyard-payment:", message);
    return jsonResponse({ error: message }, 400);
  }
});
