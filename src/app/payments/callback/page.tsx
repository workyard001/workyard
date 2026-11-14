"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Clock3, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

type VerificationState = "checking" | "success" | "pending" | "error";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";
  const [state, setState] = useState<VerificationState>("checking");
  const [notice, setNotice] = useState("Verifying your payment securely with Paystack...");
  const [checking, setChecking] = useState(false);

  const verifyPayment = useCallback(async () => {
    if (!reference) {
      setState("error");
      setNotice("No Paystack payment reference was returned. Check Payment History or contact WORKYARD support.");
      return;
    }

    setChecking(true);
    setState("checking");
    setNotice("Verifying your payment securely with Paystack...");

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error("Your sign-in session has expired. Sign in again, then open Payment History to verify this transaction.");
      }

      const { data, error } = await supabase.functions.invoke(
        "verify-workyard-payment",
        { body: { reference } },
      );
      if (error) throw error;

      if (data?.status === "success") {
        setState("success");
        setNotice("Paystack confirmed your payment. WORKYARD has securely updated the work agreement.");
      } else if (data?.status === "pending" || data?.status === "ongoing" || data?.status === "processing") {
        setState("pending");
        setNotice("Paystack has not confirmed a successful payment yet. Do not pay again while this transaction is being checked. You can verify again shortly.");
      } else if (data?.status === "failed" || data?.status === "abandoned") {
        setState("error");
        setNotice(`Paystack reports this transaction as ${data.status}. Return to your agreement and retry checkout only after confirming this attempt has ended.`);
      } else {
        throw new Error(data?.error || "WORKYARD could not confirm this payment.");
      }
    } catch (error) {
      setState("error");
      setNotice(error instanceof Error ? error.message : "Payment verification failed. Please check Payment History.");
    } finally {
      setChecking(false);
    }
  }, [reference]);

  useEffect(() => {
    void verifyPayment();
  }, [verifyPayment]);

  const statusIcon = state === "success"
    ? <CheckCircle2 size={48} color="#0B7A42" />
    : state === "pending" || state === "checking"
      ? <Clock3 size={48} color="#925f05" />
      : <AlertCircle size={48} color="#b42318" />;

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: 620, textAlign: "center" }}>
        <Link href="/payments/" className="profile-back" style={{ display: "inline-flex", marginRight: "auto" }}>
          <ArrowLeft size={16} /> Back to Payment History
        </Link>

        <div style={{ display: "grid", justifyItems: "center", gap: 14, padding: "38px 10px 20px" }}>
          {statusIcon}
          <h1 style={{ margin: 0 }}>
            {state === "success"
              ? "Payment confirmed"
              : state === "pending" || state === "checking"
                ? "Checking payment"
                : "Payment not confirmed"}
          </h1>
          <p role="status" aria-live="polite" style={{ color: "#64748b", lineHeight: 1.7, maxWidth: 470, margin: 0 }}>
            {notice}
          </p>
          {reference && (
            <small style={{ color: "#64748b", overflowWrap: "anywhere" }}>
              Reference: {reference}
            </small>
          )}

          {(state === "pending" || state === "error") && (
            <button type="button" className="btn btn-outline" onClick={() => void verifyPayment()} disabled={checking}>
              <RefreshCw size={16} /> {checking ? "Checking..." : "Verify again"}
            </button>
          )}

          <Link href="/payments/" className="btn" style={{ marginTop: 6 }}>
            View Payment History
          </Link>
          <Link href="/messages/" style={{ color: "#0B7A42", fontWeight: 700, fontSize: 14 }}>
            Return to Messages
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<main className="dashboard-loading">Loading payment confirmation...</main>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
