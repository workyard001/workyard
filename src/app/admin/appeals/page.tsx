"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

type Appeal = {
  appeal_id: string;
  action_id: string;
  user_id: string;
  action_type: "warning" | "suspension";
  action_reason: string;
  appeal_text: string;
  status: "pending" | "under_review" | "upheld" | "accepted";
  submitted_at: string;
  issued_by: string;
  action_starts_at: string;
  action_expires_at: string | null;
  action_revoked_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  decision_notes: string | null;
};

const filters = [
  "pending",
  "under_review",
  "upheld",
  "accepted",
  "all",
];

export default function AdminAppealsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAppeals = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setAuthorized(false);
      setAppeals([]);
      setError("Please sign in to access the appeals queue.");
      setLoading(false);
      return;
    }

    const { data: adminResult, error: adminError } =
      await supabase.rpc("is_moderation_admin");

    if (adminError || adminResult !== true) {
      setAuthorized(false);
      setAppeals([]);
      setError("This account is not authorized to review appeals.");
      setLoading(false);
      return;
    }

    setAuthorized(true);

    const { data, error: queueError } = await supabase.rpc(
      "get_moderation_appeals",
      { p_status: filter }
    );

    if (queueError) {
      setAppeals([]);
      setError(queueError.message);
    } else {
      setAppeals((data || []) as Appeal[]);
    }

    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void loadAppeals();
  }, [loadAppeals]);

  async function reviewAppeal(
    appeal: Appeal,
    decision: "under_review" | "upheld" | "accepted"
  ) {
    if (busyId) return;

    let notes: string | null = null;

    if (decision === "upheld" || decision === "accepted") {
      const enteredNotes = window.prompt(
        decision === "accepted"
          ? "Explain why this appeal is accepted. This will overturn the original moderation action:"
          : "Explain why the original moderation action is being upheld:"
      );

      if (enteredNotes === null) return;

      notes = enteredNotes.trim();

      if (notes.length < 1 || notes.length > 2000) {
        setError("Final decisions require notes between 1 and 2,000 characters.");
        return;
      }
    }

    const confirmation =
      decision === "under_review"
        ? "Move this appeal into the review queue?"
        : decision === "accepted"
          ? "Accept this appeal and overturn the original warning or suspension?"
          : "Uphold the original moderation action and decline this appeal?";

    if (!window.confirm(confirmation)) return;

    setBusyId(appeal.appeal_id);
    setError("");
    setMessage("");

    const { error: reviewError } = await supabase.rpc(
      "review_moderation_appeal",
      {
        p_appeal_id: appeal.appeal_id,
        p_decision: decision,
        p_notes: notes,
      }
    );

    if (reviewError) {
      setError(reviewError.message);
    } else {
      setMessage(
        decision === "accepted"
          ? "Appeal accepted. The original moderation action has been overturned."
          : decision === "upheld"
            ? "Appeal declined. The original moderation action remains in place."
            : "Appeal moved under review."
      );

      await loadAppeals();
    }

    setBusyId(null);
  }

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 18,
  } as const;

  const buttonStyle = {
    border: "1px solid #d1d5db",
    background: "#fff",
    borderRadius: 8,
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 700,
  } as const;

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "28px 16px 60px",
        color: "#17231c",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <a
            href="/admin/moderation/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#0B7A42",
              textDecoration: "none",
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <ArrowLeft size={16} />
            Back to report moderation
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <ShieldCheck size={32} color="#0B7A42" />
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
                WORKYARD Appeals
              </h1>
              <p style={{ color: "#647067", margin: "5px 0 0" }}>
                Review member appeals against warnings and suspensions.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => void loadAppeals()}
          disabled={loading}
          style={buttonStyle}
        >
          <RefreshCw
            size={15}
            style={{ verticalAlign: "middle", marginRight: 6 }}
          />
          Refresh
        </button>
      </header>

      {message && (
        <div
          role="status"
          style={{
            ...cardStyle,
            background: "#ecfdf3",
            borderColor: "#a7e5bd",
            color: "#176b3a",
            marginBottom: 16,
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            ...cardStyle,
            background: "#fff7ed",
            borderColor: "#fed7aa",
            color: "#9a3412",
            marginBottom: 16,
          }}
        >
          <AlertTriangle
            size={17}
            style={{ verticalAlign: "middle", marginRight: 7 }}
          />
          {error}
        </div>
      )}

      {!authorized && !loading && (
        <section style={cardStyle}>
          <h2>Access restricted</h2>
          <p>
            Only authorized WORKYARD moderators can access this appeals queue.
          </p>
        </section>
      )}

      {authorized && (
        <>
          <section style={{ ...cardStyle, marginBottom: 18 }}>
            <label
              htmlFor="appeal-filter"
              style={{ display: "block", fontWeight: 700, marginBottom: 8 }}
            >
              Appeal status
            </label>

            <select
              id="appeal-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              style={{ ...buttonStyle, minWidth: 210 }}
            >
              {filters.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>

            <span style={{ marginLeft: 12, color: "#647067" }}>
              {appeals.length} appeal{appeals.length === 1 ? "" : "s"}
            </span>
          </section>

          {loading ? (
            <p>Loading appeals...</p>
          ) : appeals.length === 0 ? (
            <section style={cardStyle}>
              <CheckCircle
                size={23}
                color="#0B7A42"
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              No appeals found for this filter.
            </section>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {appeals.map((appeal) => {
                const finalDecision =
                  appeal.status === "upheld" || appeal.status === "accepted";
                const isBusy = busyId === appeal.appeal_id;

                return (
                  <article key={appeal.appeal_id} style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <h2 style={{ fontSize: 18, margin: 0 }}>
                        {appeal.action_type === "suspension"
                          ? "Suspension appeal"
                          : "Warning appeal"}
                      </h2>

                      <strong
                        style={{
                          fontSize: 12,
                          color:
                            appeal.status === "accepted"
                              ? "#176b3a"
                              : appeal.status === "upheld"
                                ? "#9f1239"
                                : "#92400e",
                        }}
                      >
                        {appeal.status.replace("_", " ").toUpperCase()}
                      </strong>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <p style={{ overflowWrap: "anywhere" }}>
                        <strong>Member account ID:</strong> {appeal.user_id}
                      </p>
                      <p>
                        <strong>Original action:</strong>{" "}
                        {appeal.action_type}
                      </p>
                      <p>
                        <strong>Original reason:</strong>{" "}
                        {appeal.action_reason}
                      </p>
                      <p style={{ fontSize: 13, color: "#647067" }}>
                        Action issued:{" "}
                        {new Date(appeal.action_starts_at).toLocaleString()}
                      </p>

                      {appeal.action_expires_at && (
                        <p style={{ fontSize: 13, color: "#647067" }}>
                          Original suspension expiry:{" "}
                          {new Date(appeal.action_expires_at).toLocaleString()}
                        </p>
                      )}

                      {appeal.action_revoked_at && (
                        <p style={{ fontSize: 13, color: "#176b3a" }}>
                          Original action already overturned or revoked.
                        </p>
                      )}

                      <p style={{ fontSize: 13, color: "#647067" }}>
                        Appeal submitted:{" "}
                        {new Date(appeal.submitted_at).toLocaleString()}
                      </p>

                      <h3 style={{ marginBottom: 7 }}>Member's explanation</h3>
                      <div
                        style={{
                          background: "#f8faf9",
                          borderRadius: 9,
                          padding: 14,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {appeal.appeal_text}
                      </div>

                      <p
                        style={{
                          marginTop: 12,
                          fontSize: 12,
                          color: "#647067",
                          overflowWrap: "anywhere",
                        }}
                      >
                        Appeal ID: {appeal.appeal_id}
                      </p>

                      {appeal.reviewed_at && (
                        <p style={{ fontSize: 13, color: "#647067" }}>
                          Reviewed:{" "}
                          {new Date(appeal.reviewed_at).toLocaleString()}
                        </p>
                      )}

                      {appeal.decision_notes && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: 12,
                            borderRadius: 8,
                            background: "#f8faf9",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          <strong>Moderator decision notes:</strong>
                          <p style={{ marginBottom: 0 }}>
                            {appeal.decision_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {!finalDecision && (
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          marginTop: 18,
                        }}
                      >
                        {appeal.status === "pending" && (
                          <button
                            disabled={isBusy || !!busyId}
                            onClick={() =>
                              void reviewAppeal(appeal, "under_review")
                            }
                            style={{
                              ...buttonStyle,
                              background: "#fffbeb",
                              borderColor: "#facc15",
                            }}
                          >
                            <Clock
                              size={15}
                              style={{ verticalAlign: "middle", marginRight: 5 }}
                            />
                            Mark under review
                          </button>
                        )}

                        <button
                          disabled={isBusy || !!busyId}
                          onClick={() => void reviewAppeal(appeal, "accepted")}
                          style={{
                            ...buttonStyle,
                            background: "#ecfdf3",
                            borderColor: "#86d5a5",
                            color: "#176b3a",
                          }}
                        >
                          <CheckCircle
                            size={15}
                            style={{ verticalAlign: "middle", marginRight: 5 }}
                          />
                          Accept appeal
                        </button>

                        <button
                          disabled={isBusy || !!busyId}
                          onClick={() => void reviewAppeal(appeal, "upheld")}
                          style={{
                            ...buttonStyle,
                            background: "#fff1f2",
                            borderColor: "#fda4af",
                            color: "#9f1239",
                          }}
                        >
                          <XCircle
                            size={15}
                            style={{ verticalAlign: "middle", marginRight: 5 }}
                          />
                          Uphold original action
                        </button>
                      </div>
                    )}

                    {isBusy && <p>Saving appeal decision...</p>}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
