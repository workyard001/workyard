"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  RefreshCw,
  CheckCircle,
  Ban,
} from "lucide-react";

type ModerationAction = {
  id: string;
  action_type: "warning" | "suspension";
  reason: string;
  details: string | null;
  starts_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

type Appeal = {
  id: string;
  action_id: string;
  appeal_text: string;
  status: "pending" | "under_review" | "upheld" | "accepted";
  submitted_at: string;
  reviewed_at: string | null;
  decision_notes: string | null;
  action_type: "warning" | "suspension";
  action_reason: string;
  action_starts_at: string;
  action_expires_at: string | null;
  action_revoked_at: string | null;
};

function getActionStatus(action: ModerationAction) {
  if (action.revoked_at) return "Overturned or revoked";

  if (action.action_type === "warning") return "Warning recorded";

  const now = Date.now();
  const starts = new Date(action.starts_at).getTime();
  const expires = action.expires_at
    ? new Date(action.expires_at).getTime()
    : null;

  if (starts > now) return "Scheduled";
  if (expires !== null && expires <= now) return "Expired";
  if (expires !== null) return "Active";

  return "Suspension status unavailable";
}

function getAppealStatus(status: Appeal["status"]) {
  switch (status) {
    case "pending":
      return "Awaiting moderator review";
    case "under_review":
      return "Under review";
    case "upheld":
      return "Appeal not accepted";
    case "accepted":
      return "Appeal accepted";
    default:
      return status;
  }
}

export default function MemberModerationPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [appealText, setAppealText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.replace("/login/");
      return;
    }

    const [actionsResult, appealsResult] = await Promise.all([
      supabase.rpc("get_my_moderation_actions"),
      supabase.rpc("get_my_moderation_appeals"),
    ]);

    if (actionsResult.error) {
      setError(actionsResult.error.message);
      setActions([]);
      setAppeals([]);
    } else if (appealsResult.error) {
      setError(appealsResult.error.message);
      setActions((actionsResult.data || []) as ModerationAction[]);
      setAppeals([]);
    } else {
      setActions((actionsResult.data || []) as ModerationAction[]);
      setAppeals((appealsResult.data || []) as Appeal[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function submitAppeal(actionId: string) {
    if (busy) return;

    if (appealText.trim().length < 10) {
      setError("Please explain your appeal in at least 10 characters.");
      return;
    }

    if (appealText.trim().length > 3000) {
      setError("Your appeal cannot exceed 3,000 characters.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const { error: submitError } = await supabase.rpc(
      "submit_moderation_appeal",
      {
        p_action_id: actionId,
        p_appeal_text: appealText.trim(),
      }
    );

    if (submitError) {
      setError(submitError.message);
    } else {
      setMessage("Your appeal has been submitted successfully.");
      setAppealText("");
      setSelectedAction(null);
      await loadData();
    }

    setBusy(false);
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
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  } as const;

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: 12,
    font: "inherit",
  };

  const appealsByAction = new Map(
    appeals.map((appeal) => [appeal.action_id, appeal])
  );

  return (
    <main
      style={{
        maxWidth: 850,
        margin: "0 auto",
        padding: "28px 16px 60px",
        color: "#17231c",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <a
            href="/dashboard/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#0B7A42",
              textDecoration: "none",
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </a>
          <h1 style={{ margin: 0, fontSize: 27, fontWeight: 800 }}>
            My moderation &amp; appeals
          </h1>
          <p style={{ color: "#647067", marginTop: 7 }}>
            View account warnings and suspensions, and appeal a moderation
            action you believe should be reconsidered.
          </p>
        </div>

        <button
          onClick={() => void loadData()}
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
          <CheckCircle
            size={17}
            style={{ verticalAlign: "middle", marginRight: 7 }}
          />
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

      {loading ? (
        <p>Loading your moderation records...</p>
      ) : actions.length === 0 ? (
        <section style={cardStyle}>
          <ShieldCheck
            size={28}
            color="#0B7A42"
            style={{ marginBottom: 8 }}
          />
          <h2 style={{ margin: "0 0 8px" }}>No moderation actions</h2>
          <p style={{ margin: 0, color: "#647067" }}>
            There are currently no warnings or suspensions recorded for your
            WORKYARD account.
          </p>
        </section>
      ) : (
        <section>
          <h2 style={{ fontSize: 20 }}>Your moderation history</h2>

          <div style={{ display: "grid", gap: 14 }}>
            {actions.map((action) => {
              const appeal = appealsByAction.get(action.id);
              const status = getActionStatus(action);
              const canAppeal = !appeal && !action.revoked_at;
              const isSelected = selectedAction === action.id;

              return (
                <article key={action.id} style={cardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        textTransform: "capitalize",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {action.action_type === "suspension" ? (
                        <Ban size={19} color="#9f1239" />
                      ) : (
                        <AlertTriangle size={19} color="#b45309" />
                      )}
                      {action.action_type}
                    </h3>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: status === "Active" ? "#9f1239" : "#176b3a",
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  <p>
                    <strong>Reason:</strong> {action.reason}
                  </p>

                  {action.details && (
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      <strong>Additional details:</strong> {action.details}
                    </p>
                  )}

                  <p style={{ color: "#647067", fontSize: 13 }}>
                    Issued: {new Date(action.created_at).toLocaleString()}
                  </p>

                  {action.action_type === "suspension" && (
                    <>
                      <p style={{ color: "#647067", fontSize: 13 }}>
                        Starts: {new Date(action.starts_at).toLocaleString()}
                      </p>
                      {action.expires_at && (
                        <p style={{ color: "#647067", fontSize: 13 }}>
                          Expires: {new Date(action.expires_at).toLocaleString()}
                        </p>
                      )}
                    </>
                  )}

                  {appeal ? (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 14,
                        borderRadius: 9,
                        background: "#f8faf9",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <strong>Appeal status: {getAppealStatus(appeal.status)}</strong>
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {appeal.appeal_text}
                      </p>
                      <p style={{ color: "#647067", fontSize: 13 }}>
                        Submitted: {new Date(appeal.submitted_at).toLocaleString()}
                      </p>
                      {appeal.reviewed_at && (
                        <p style={{ color: "#647067", fontSize: 13 }}>
                          Reviewed: {new Date(appeal.reviewed_at).toLocaleString()}
                        </p>
                      )}
                      {appeal.decision_notes && (
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          <strong>Moderator decision:</strong>{" "}
                          {appeal.decision_notes}
                        </p>
                      )}
                    </div>
                  ) : canAppeal ? (
                    <div style={{ marginTop: 16 }}>
                      {isSelected ? (
                        <>
                          <label
                            htmlFor={`appeal-${action.id}`}
                            style={{
                              display: "block",
                              fontWeight: 700,
                              marginBottom: 7,
                            }}
                          >
                            Explain why you are appealing
                          </label>
                          <textarea
                            id={`appeal-${action.id}`}
                            value={appealText}
                            onChange={(event) => setAppealText(event.target.value)}
                            maxLength={3000}
                            rows={5}
                            placeholder="Explain what happened, why you believe this decision should be reconsidered, and include any relevant context."
                            style={{ ...fieldStyle, resize: "vertical" }}
                          />
                          <p
                            style={{
                              color: "#647067",
                              fontSize: 12,
                              textAlign: "right",
                            }}
                          >
                            {appealText.length}/3000 characters
                          </p>
                          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                            <button
                              disabled={busy}
                              onClick={() => void submitAppeal(action.id)}
                              style={{
                                ...buttonStyle,
                                background: "#0B7A42",
                                borderColor: "#0B7A42",
                                color: "#fff",
                              }}
                            >
                              <Send
                                size={15}
                                style={{ verticalAlign: "middle", marginRight: 6 }}
                              />
                              Submit appeal
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => {
                                setSelectedAction(null);
                                setAppealText("");
                              }}
                              style={buttonStyle}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAction(action.id);
                            setAppealText("");
                            setError("");
                            setMessage("");
                          }}
                          style={{
                            ...buttonStyle,
                            color: "#0B7A42",
                            borderColor: "#0B7A42",
                          }}
                        >
                          Appeal this decision
                        </button>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: "#647067", fontSize: 13 }}>
                      This moderation action has already been overturned or
                      revoked.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {appeals.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 20 }}>
            <Clock
              size={20}
              style={{ verticalAlign: "middle", marginRight: 7 }}
            />
            Appeal tracking
          </h2>
          <p style={{ color: "#647067", fontSize: 14 }}>
            Your submitted appeals and their latest decisions are shown with
            the related moderation action above.
          </p>
        </section>
      )}

      <footer
        style={{
          marginTop: 35,
          paddingTop: 18,
          borderTop: "1px solid #e5e7eb",
          color: "#647067",
          fontSize: 13,
        }}
      >
        WORKYARD moderation appeals are reviewed by authorized moderators.
        Submitting an appeal does not automatically remove an active
        suspension.
      </footer>
    </main>
  );
}
