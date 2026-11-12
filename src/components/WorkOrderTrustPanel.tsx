"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, ShieldCheck, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

type WorkOrder = {
  id: string;
  conversation_id: string;
  client_id: string;
  provider_id: string;
  title: string;
  description: string;
  amount_kobo: number;
  currency: string;
  status: string;
  created_at: string;
  submitted_at: string | null;
  completed_at: string | null;
};

type ReviewFlags = {
  reviewed_by_me: boolean;
  reviewed_by_other: boolean;
};

type Props = {
  conversationId: string;
  userId: string;
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #dce8df",
  borderRadius: "14px",
  padding: "15px",
  background: "#fff",
};

const actionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  border: "none",
  borderRadius: "9px",
  padding: "10px 13px",
  background: "#0B7A42",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

export default function WorkOrderTrustPanel({ conversationId, userId }: Props) {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [reviewFlags, setReviewFlags] = useState<Record<string, ReviewFlags>>({});
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [reviewFormId, setReviewFormId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadOrders = useCallback(async () => {
    if (!conversationId || !userId) return;

    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("work_orders")
      .select(
        "id, conversation_id, client_id, provider_id, title, description, amount_kobo, currency, status, created_at, submitted_at, completed_at"
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(`Work agreements could not be loaded: ${error.message}`);
      setOrders([]);
      setLoading(false);
      return;
    }

    const rows = (data || []) as WorkOrder[];
    setOrders(rows);

    const completed = rows.filter((order) => order.status === "completed");
    const flagEntries = await Promise.all(
      completed.map(async (order) => {
        const { data: flagData, error: flagError } = await supabase.rpc(
          "get_my_work_order_review_status",
          { p_work_order_id: order.id }
        );

        if (flagError) {
          throw new Error(flagError.message);
        }

        const row = Array.isArray(flagData) ? flagData[0] : flagData;
        return [
          order.id,
          {
            reviewed_by_me: row?.reviewed_by_me === true,
            reviewed_by_other: row?.reviewed_by_other === true,
          } satisfies ReviewFlags,
        ] as const;
      })
    ).catch((loadError: unknown) => {
      setErrorMessage(
        loadError instanceof Error
          ? `Review status could not be checked: ${loadError.message}`
          : "Review status could not be checked."
      );
      return [];
    });

    setReviewFlags(Object.fromEntries(flagEntries));
    setLoading(false);
  }, [conversationId, userId]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function submitCompletion(order: WorkOrder) {
    setBusyOrderId(order.id);
    setNotice("");
    setErrorMessage("");

    const { error } = await supabase.rpc("submit_work_order_completion", {
      p_work_order_id: order.id,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setNotice("Work submitted. The client must confirm completion before reviews can be written.");
      await loadOrders();
    }

    setBusyOrderId(null);
  }

  async function confirmCompletion(order: WorkOrder) {
    setBusyOrderId(order.id);
    setNotice("");
    setErrorMessage("");

    const { error } = await supabase.rpc("confirm_work_order_completion", {
      p_work_order_id: order.id,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setNotice("Completion confirmed. Both participants can now leave a review.");
      await loadOrders();
    }

    setBusyOrderId(null);
  }

  async function submitReview(order: WorkOrder) {
    if (rating < 1 || rating > 5) return;

    setBusyOrderId(order.id);
    setNotice("");
    setErrorMessage("");

    const { error } = await supabase.rpc("submit_work_order_review", {
      p_work_order_id: order.id,
      p_rating: rating,
      p_review_text: reviewText.trim(),
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setNotice("Your review has been submitted.");
      setReviewFormId(null);
      setReviewText("");
      setRating(5);
      await loadOrders();
    }

    setBusyOrderId(null);
  }

  function money(amountKobo: number, currency: string) {
    const amount = Number(amountKobo || 0) / 100;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function statusLabel(status: string) {
    return status.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
  }

  if (loading) {
    return (
      <section style={{ ...cardStyle, margin: "14px 0" }}>
        <p style={{ margin: 0, color: "#64748b" }}>Loading work completion and review details...</p>
      </section>
    );
  }

  return (
    <section
      aria-label="Work completion and reviews"
      style={{
        margin: "14px 0",
        padding: "16px",
        border: "1px solid #dce8df",
        borderRadius: "16px",
        background: "#f8fcf9",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "12px" }}>
        <ShieldCheck size={20} color="#0B7A42" />
        <h3 style={{ margin: 0, color: "#173326", fontSize: "17px" }}>
          Work completion &amp; reviews
        </h3>
        <button
          type="button"
          onClick={() => void loadOrders()}
          title="Refresh work status"
          aria-label="Refresh work status"
          style={{ marginLeft: "auto", border: 0, background: "transparent", color: "#0B7A42", cursor: "pointer" }}
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {notice && (
        <p role="status" style={{ color: "#0B7A42", background: "#e8f6ed", padding: "10px", borderRadius: "8px" }}>
          {notice}
        </p>
      )}
      {errorMessage && (
        <p role="alert" style={{ color: "#a12622", background: "#fff1f0", padding: "10px", borderRadius: "8px" }}>
          {errorMessage}
        </p>
      )}

      {orders.length === 0 ? (
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          No work agreement has been created in this conversation yet. Agree on the scope and amount first.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {orders.map((order) => {
            const isProvider = order.provider_id === userId;
            const isClient = order.client_id === userId;
            const flags = reviewFlags[order.id];
            const canSubmit = isProvider && ["accepted", "paid", "in_progress"].includes(order.status);
            const canConfirm = isClient && order.status === "awaiting_confirmation";

            return (
              <article key={order.id} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ margin: "0 0 5px", color: "#173326" }}>{order.title}</h4>
                    <p style={{ margin: "0 0 7px", color: "#64748b", fontSize: "13px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {order.description}
                    </p>
                    <strong style={{ color: "#0B7A42" }}>{money(order.amount_kobo, order.currency)}</strong>
                  </div>
                  <span style={{ flexShrink: 0, borderRadius: "20px", background: order.status === "completed" ? "#e8f6ed" : "#fff5d8", color: "#234a35", padding: "5px 9px", fontSize: "11px", fontWeight: 700, textTransform: "capitalize" }}>
                    {statusLabel(order.status)}
                  </span>
                </div>

                {canSubmit && (
                  <div style={{ marginTop: "12px" }}>
                    <button
                      type="button"
                      style={actionStyle}
                      disabled={busyOrderId === order.id}
                      onClick={() => void submitCompletion(order)}
                    >
                      <CheckCircle2 size={16} />
                      {busyOrderId === order.id ? "Submitting..." : "Submit completed work"}
                    </button>
                    <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: "12px" }}>
                      The client will confirm the work before either person can review.
                    </p>
                  </div>
                )}

                {canConfirm && (
                  <div style={{ marginTop: "12px" }}>
                    <p style={{ margin: "0 0 9px", color: "#7a5a00", fontSize: "13px" }}>
                      The provider says this work is complete. Confirm only after checking the agreed work.
                    </p>
                    <button
                      type="button"
                      style={actionStyle}
                      disabled={busyOrderId === order.id}
                      onClick={() => void confirmCompletion(order)}
                    >
                      <CheckCircle2 size={16} />
                      {busyOrderId === order.id ? "Confirming..." : "Confirm work completion"}
                    </button>
                  </div>
                )}

                {order.status === "awaiting_confirmation" && isProvider && (
                  <p style={{ margin: "11px 0 0", color: "#7a5a00", fontSize: "13px" }}>
                    <Clock3 size={14} style={{ verticalAlign: "-2px" }} /> Waiting for the client to confirm.
                  </p>
                )}

                {order.status === "completed" && (
                  <div style={{ marginTop: "12px", borderTop: "1px solid #edf2ee", paddingTop: "12px" }}>
                    <p style={{ margin: "0 0 9px", color: "#0B7A42", fontSize: "13px", fontWeight: 700 }}>
                      <CheckCircle2 size={15} style={{ verticalAlign: "-3px" }} /> Work completion confirmed
                    </p>
                    {flags?.reviewed_by_me ? (
                      <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                        You have submitted your review for this work order.
                      </p>
                    ) : (
                      <>
                        {reviewFormId !== order.id ? (
                          <button
                            type="button"
                            style={{ ...actionStyle, background: "#f0b323", color: "#173326" }}
                            onClick={() => {
                              setReviewFormId(order.id);
                              setRating(5);
                              setReviewText("");
                            }}
                          >
                            <Star size={16} /> Review the other participant
                          </button>
                        ) : (
                          <div style={{ display: "grid", gap: "9px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 700, color: "#173326" }}>
                              Your rating
                              <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setRating(value)}
                                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                                    aria-pressed={rating === value}
                                    style={{ border: 0, padding: "3px", background: "transparent", color: value <= rating ? "#e3a400" : "#cbd5d1", cursor: "pointer" }}
                                  >
                                    <Star size={25} fill={value <= rating ? "currentColor" : "none"} />
                                  </button>
                                ))}
                              </div>
                            </label>
                            <label style={{ display: "grid", gap: "5px", fontSize: "13px", fontWeight: 700, color: "#173326" }}>
                              Written feedback (optional)
                              <textarea
                                value={reviewText}
                                onChange={(event) => setReviewText(event.target.value)}
                                rows={3}
                                maxLength={1000}
                                placeholder="Describe your experience working together..."
                                style={{ width: "100%", boxSizing: "border-box", border: "1px solid #dce8df", borderRadius: "9px", padding: "10px", font: "inherit", fontWeight: 400 }}
                              />
                              <span style={{ color: "#64748b", fontWeight: 400 }}>{reviewText.length}/1000</span>
                            </label>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <button
                                type="button"
                                style={actionStyle}
                                disabled={busyOrderId === order.id}
                                onClick={() => void submitReview(order)}
                              >
                                {busyOrderId === order.id ? "Submitting..." : "Submit review"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setReviewFormId(null)}
                                style={{ border: "1px solid #dce8df", borderRadius: "9px", padding: "10px 13px", background: "white", cursor: "pointer" }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {flags?.reviewed_by_other && !flags.reviewed_by_me && (
                      <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "12px" }}>
                        The other participant has also submitted a review.
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
