"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Wallet, RefreshCw, ReceiptText } from "lucide-react";

type Payment = {
  id: string;
  work_order_id: string;
  payer_id: string;
  payee_id: string;
  provider_reference: string;
  amount_kobo: number | string;
  currency: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  verified_at: string | null;
  failure_reason: string | null;
};

type WorkOrder = {
  id: string;
  title: string;
  description: string;
  status: string;
};

function formatAmount(amountKobo: number | string, currency: string) {
  return `${currency || "NGN"} ${(
    Number(amountKobo) / 100
  ).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusStyle(status: string): React.CSSProperties {
  if (status === "success") {
    return { color: "#0B7A42", background: "#e6f5eb" };
  }
  if (status === "failed" || status === "reversed" || status === "refunded") {
    return { color: "#b42318", background: "#fff0ef" };
  }
  return { color: "#925f05", background: "#fff7df" };
}

export default function PaymentsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Record<string, WorkOrder>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async (currentUserId: string) => {
    setError("");

    const { data, error: paymentError } = await supabase
      .from("workyard_payments")
      .select(
        "id,work_order_id,payer_id,payee_id,provider_reference,amount_kobo,currency,status,created_at,paid_at,verified_at,failure_reason"
      )
      .order("created_at", { ascending: false });

    if (paymentError) {
      setError(`Could not load payment history: ${paymentError.message}`);
      return;
    }

    const rows = (data || []) as Payment[];
    setPayments(rows);

    const orderIds = [...new Set(rows.map((item) => item.work_order_id))];

    if (orderIds.length === 0) {
      setOrders({});
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from("work_orders")
      .select("id,title,description,status")
      .in("id", orderIds);

    if (orderError) {
      setError(`Payments loaded, but agreement details could not be loaded: ${orderError.message}`);
      return;
    }

    const lookup: Record<string, WorkOrder> = {};
    for (const order of (orderData || []) as WorkOrder[]) {
      lookup[order.id] = order;
    }
    setOrders(lookup);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data.user) {
        router.replace("/login/");
        return;
      }

      if (!active) return;
      setUserId(data.user.id);
      await loadPayments(data.user.id);

      if (active) setLoading(false);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [router, loadPayments]);

  async function refresh() {
    if (!userId) return;
    setLoading(true);
    await loadPayments(userId);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        Loading your payment history...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: 900 }}>
        <Link href="/dashboard/" className="profile-back">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 22,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#e6f5eb",
              color: "#0B7A42",
              display: "grid",
              placeItems: "center",
            }}>
              <Wallet size={25} />
            </div>
            <div>
              <h1 style={{ margin: 0 }}>Payment History</h1>
              <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 13 }}>
                Payments connected to your WORKYARD agreements.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void refresh()}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {error && (
          <p className="auth-message" role="alert" style={{ marginTop: 18 }}>
            {error}
          </p>
        )}

        {payments.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "55px 14px",
            marginTop: 20,
            border: "1px dashed #cbded1",
            borderRadius: 14,
            background: "#fbfdfb",
          }}>
            <ReceiptText size={42} color="#0B7A42" />
            <h2 style={{ margin: "15px 0 7px" }}>No payments recorded yet</h2>
            <p style={{
              color: "#64748b",
              lineHeight: 1.7,
              maxWidth: 510,
              margin: "0 auto",
            }}>
              Your accepted work agreements are not payment transactions.
              Once Paystack checkout is connected and a payment is verified,
              the transaction will appear here.
            </p>
            <Link href="/messages/" className="btn" style={{
              display: "inline-flex",
              marginTop: 20,
            }}>
              Go to Messages
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 13, marginTop: 24 }}>
            {payments.map((payment) => {
              const order = orders[payment.work_order_id];
              const isPayer = payment.payer_id === userId;

              return (
                <article
                  key={payment.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 13,
                    padding: 16,
                    background: "#fff",
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>
                        {order?.title || "WORKYARD work agreement"}
                      </strong>
                      <p style={{
                        margin: "6px 0",
                        fontSize: 13,
                        color: "#64748b",
                      }}>
                        {isPayer ? "Payment made" : "Payment received"}
                      </p>
                    </div>

                    <span style={{
                      ...statusStyle(payment.status),
                      padding: "6px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}>
                      {payment.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <h2 style={{
                    color: "#0B7A42",
                    fontSize: 22,
                    margin: "12px 0",
                  }}>
                    {formatAmount(payment.amount_kobo, payment.currency)}
                  </h2>

                  <div style={{
                    display: "grid",
                    gap: 6,
                    fontSize: 12,
                    color: "#64748b",
                  }}>
                    <span>Reference: {payment.provider_reference}</span>
                    <span>
                      Created: {new Date(payment.created_at).toLocaleString()}
                    </span>
                    {payment.verified_at && (
                      <span>
                        Verified: {new Date(payment.verified_at).toLocaleString()}
                      </span>
                    )}
                    {payment.failure_reason && (
                      <span style={{ color: "#b42318" }}>
                        Reason: {payment.failure_reason}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p style={{
          marginTop: 22,
          color: "#64748b",
          fontSize: 12,
          lineHeight: 1.6,
        }}>
          Payment records are read-only here. Only the verified payment
          backend can record or update transaction outcomes.
        </p>
      </div>
    </main>
  );
}
