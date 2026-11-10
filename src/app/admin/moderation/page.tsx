"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  History,
  UserRound,
} from "lucide-react";

type Report = {
  report_id: string;
  reporter_id: string;
  reported_user_id: string | null;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  evidence_snapshot: string | null;
  status: string;
  created_at: string;
};

type ModerationAction = {
  id: string;
  user_id: string;
  action_type: "warning" | "suspension";
  reason: string;
  details: string | null;
  report_id: string | null;
  issued_by: string;
  starts_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  created_at: string;
};

const statuses = [
  "pending",
  "under_review",
  "action_taken",
  "dismissed",
  "all",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ModerationPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [filter, setFilter] = useState("pending");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Member moderation controls
  const [memberId, setMemberId] = useState("");
  const [actionType, setActionType] = useState<"warning" | "suspension">(
    "warning"
  );
  const [actionReason, setActionReason] = useState("");
  const [actionDetails, setActionDetails] = useState("");
  const [durationHours, setDurationHours] = useState("24");
  const [actionBusy, setActionBusy] = useState(false);

  // Member moderation history
  const [memberHistory, setMemberHistory] = useState<ModerationAction[]>([]);
  const [historyUserId, setHistoryUserId] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setAuthorized(false);
      setLoading(false);
      setError("Please sign in to access moderation.");
      return;
    }

    const { data: adminResult, error: adminError } =
      await supabase.rpc("is_moderation_admin");

    if (adminError || adminResult !== true) {
      setAuthorized(false);
      setLoading(false);
      setError("This account is not authorized to access moderation.");
      return;
    }

    setAuthorized(true);

    const { data, error: queueError } = await supabase.rpc(
      "get_moderation_queue",
      { p_status: filter }
    );

    if (queueError) {
      setError(queueError.message);
      setReports([]);
    } else {
      setReports((data || []) as Report[]);
    }

    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function reviewReport(decision: string) {
    if (!selected || busy) return;

    if (
      (decision === "action_taken" || decision === "dismissed") &&
      !notes.trim()
    ) {
      setError("Please enter moderator notes before completing this decision.");
      return;
    }

    if (
      !window.confirm(
        `Confirm this moderation decision: ${decision.replace("_", " ")}?`
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const { error: reviewError } = await supabase.rpc(
      "review_content_report",
      {
        p_report_id: selected.report_id,
        p_decision: decision,
        p_notes: notes.trim() || null,
      }
    );

    if (reviewError) {
      setError(reviewError.message);
    } else {
      setMessage("Moderation decision saved and recorded in the audit log.");
      setSelected(null);
      setNotes("");
      setMemberId("");
      setMemberHistory([]);
      setHistoryUserId("");
      await loadReports();
    }

    setBusy(false);
  }

  async function loadMemberHistory(userId: string) {
    const normalizedId = userId.trim();

    if (!UUID_REGEX.test(normalizedId)) {
      setError("Enter a valid member account UUID.");
      return;
    }

    setHistoryLoading(true);
    setError("");

    const { data, error: historyError } = await supabase.rpc(
      "get_member_moderation_history",
      { p_user_id: normalizedId }
    );

    if (historyError) {
      setMemberHistory([]);
      setHistoryUserId("");
      setError(historyError.message);
    } else {
      setMemberHistory((data || []) as ModerationAction[]);
      setHistoryUserId(normalizedId);
      setMessage("Member moderation history loaded.");
    }

    setHistoryLoading(false);
  }

  async function issueModerationAction() {
    const targetId = memberId.trim();

    if (!UUID_REGEX.test(targetId)) {
      setError("Enter a valid member account UUID.");
      return;
    }

    if (!actionReason.trim()) {
      setError("Enter a reason for this warning or suspension.");
      return;
    }

    if (actionReason.trim().length > 500) {
      setError("The reason cannot exceed 500 characters.");
      return;
    }

    if (actionDetails.length > 2000) {
      setError("Additional details cannot exceed 2,000 characters.");
      return;
    }

    const hours = Number(durationHours);

    if (
      actionType === "suspension" &&
      (!Number.isInteger(hours) || hours < 1 || hours > 720)
    ) {
      setError("Suspension duration must be between 1 and 720 hours.");
      return;
    }

    const confirmation =
      actionType === "warning"
        ? `Issue a formal warning to ${targetId}?`
        : `Suspend ${targetId} for ${hours} hour(s)?`;

    if (!window.confirm(confirmation)) return;

    setActionBusy(true);
    setError("");
    setMessage("");

    const { error: actionError } = await supabase.rpc(
      "issue_member_moderation_action",
      {
        p_user_id: targetId,
        p_action_type: actionType,
        p_reason: actionReason.trim(),
        p_details: actionDetails.trim() || null,
        p_report_id: selected?.report_id || null,
        p_duration_hours: actionType === "suspension" ? hours : null,
      }
    );

    if (actionError) {
      setError(actionError.message);
    } else {
      setMessage(
        actionType === "warning"
          ? "Formal warning issued and recorded in the audit log."
          : "Member suspension issued and recorded in the audit log."
      );

      setActionReason("");
      setActionDetails("");

      await loadMemberHistory(targetId);
    }

    setActionBusy(false);
  }

  async function revokeSuspension(action: ModerationAction) {
    if (action.action_type !== "suspension" || !action.expires_at) return;

    const adminNotes = window.prompt(
      "Enter the reason for revoking this suspension:"
    );

    if (adminNotes === null) return;

    if (!adminNotes.trim()) {
      setError("A reason is required to revoke a suspension.");
      return;
    }

    if (!window.confirm("Confirm revocation of this suspension?")) return;

    setActionBusy(true);
    setError("");
    setMessage("");

    const { error: revokeError } = await supabase.rpc(
      "revoke_member_suspension",
      {
        p_action_id: action.id,
        p_notes: adminNotes.trim(),
      }
    );

    if (revokeError) {
      setError(revokeError.message);
    } else {
      setMessage("Suspension revoked and recorded in the audit log.");
      await loadMemberHistory(action.user_id);
    }

    setActionBusy(false);
  }

  function getActionStatus(action: ModerationAction) {
    if (action.action_type === "warning") return "Warning recorded";
    if (action.revoked_at) return "Revoked";
    if (!action.expires_at) return "No expiry recorded";

    const now = Date.now();
    const start = new Date(action.starts_at).getTime();
    const expiry = new Date(action.expires_at).getTime();

    if (start > now) return "Scheduled";
    if (expiry <= now) return "Expired";
    return "Active";
  }

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
  } as const;

  const buttonStyle = {
    border: "1px solid #d1d5db",
    background: "#fff",
    borderRadius: 8,
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 600,
  } as const;

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: 11,
    font: "inherit",
  };

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
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ShieldCheck size={32} color="#0B7A42" />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
              WORKYARD Moderation
            </h1>
            <p style={{ color: "#647067", margin: "5px 0 0" }}>
              Review reports, issue warnings and manage suspensions.
            </p>
          </div>
        </div>

        <button onClick={loadReports} disabled={loading} style={buttonStyle}>
          <RefreshCw
            size={15}
            style={{ verticalAlign: "middle", marginRight: 6 }}
          />
          Refresh
        </button>

        <a
          href="/admin/appeals/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 12px",
            border: "1px solid #0B7A42",
            borderRadius: 8,
            color: "#0B7A42",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Appeals queue
        </a>
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
          <h2 style={{ marginTop: 0 }}>Access restricted</h2>
          <p>
            The moderation dashboard is available only to accounts approved
            as WORKYARD moderators.
          </p>
        </section>
      )}

      {authorized && (
        <>
          <section style={{ ...cardStyle, marginBottom: 18 }}>
            <label
              htmlFor="report-filter"
              style={{ display: "block", fontWeight: 700, marginBottom: 8 }}
            >
              Report status
            </label>
            <select
              id="report-filter"
              value={filter}
              onChange={(event) => {
                setSelected(null);
                setFilter(event.target.value);
                setMemberHistory([]);
                setHistoryUserId("");
              }}
              style={{ ...buttonStyle, minWidth: 210 }}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
            <span style={{ marginLeft: 12, color: "#647067" }}>
              {reports.length} report{reports.length === 1 ? "" : "s"}
            </span>
          </section>

          {loading ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <section style={cardStyle}>
              <CheckCircle
                size={22}
                color="#0B7A42"
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              No reports found for this filter.
            </section>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {reports.map((report) => (
                <article key={report.report_id} style={cardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <strong style={{ textTransform: "capitalize" }}>
                      {report.target_type} report
                    </strong>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#0B7A42",
                      }}
                    >
                      {report.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <p style={{ margin: "6px 0" }}>
                    <strong>Reason:</strong>{" "}
                    {report.reason.replaceAll("_", " ")}
                  </p>
                  <p style={{ color: "#647067", fontSize: 13 }}>
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                  <p
                    style={{
                      color: "#647067",
                      fontSize: 12,
                      overflowWrap: "anywhere",
                    }}
                  >
                    Report ID: {report.report_id}
                  </p>

                  <button
                    onClick={() => {
                      setSelected(report);
                      setNotes("");
                      setMemberId(report.reported_user_id || "");
                      setActionReason("");
                      setActionDetails("");
                      setMemberHistory([]);
                      setHistoryUserId("");
                      setError("");
                      setMessage("");
                    }}
                    style={{
                      ...buttonStyle,
                      color: "#0B7A42",
                      borderColor: "#0B7A42",
                      width: "100%",
                      marginTop: 8,
                    }}
                  >
                    <Eye
                      size={15}
                      style={{ verticalAlign: "middle", marginRight: 6 }}
                    />
                    Review report
                  </button>
                </article>
              ))}
            </div>
          )}

          {selected && (
            <section
              style={{
                ...cardStyle,
                marginTop: 24,
                border: "2px solid #0B7A42",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h2 style={{ marginTop: 0 }}>Report details</h2>
                <button
                  style={buttonStyle}
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>

              <p>
                <strong>Content type:</strong> {selected.target_type}
              </p>
              <p>
                <strong>Reason:</strong>{" "}
                {selected.reason.replaceAll("_", " ")}
              </p>
              <p>
                <strong>Reporter ID:</strong> {selected.reporter_id}
              </p>
              <p>
                <strong>Reported account ID:</strong>{" "}
                {selected.reported_user_id || "Not available"}
              </p>
              <p>
                <strong>Target ID:</strong> {selected.target_id}
              </p>
              <p>
                <strong>Additional report details:</strong>
              </p>
              <div
                style={{
                  background: "#f8faf9",
                  borderRadius: 8,
                  padding: 12,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {selected.details || "No additional details supplied."}
              </div>

              <h3 style={{ marginBottom: 8 }}>Submitted evidence</h3>
              {selected.target_type === "message" && (
                <p style={{ color: "#9a3412", fontSize: 13 }}>
                  <AlertTriangle
                    size={15}
                    style={{ verticalAlign: "middle", marginRight: 5 }}
                  />
                  This is private message content supplied as evidence for
                  this specific report. It is not access to the user's inbox
                  or entire conversation.
                </p>
              )}
              <div
                style={{
                  background: "#f8faf9",
                  borderRadius: 8,
                  padding: 12,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  maxHeight: 260,
                  overflowY: "auto",
                }}
              >
                {selected.evidence_snapshot || "No evidence snapshot available."}
              </div>

              <label
                htmlFor="moderator-notes"
                style={{
                  display: "block",
                  fontWeight: 700,
                  margin: "18px 0 8px",
                }}
              >
                Moderator notes
              </label>
              <textarea
                id="moderator-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Record the reason for your decision. Required when taking action or dismissing a report."
                style={{ ...fieldStyle, resize: "vertical" }}
              />

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                {selected.status === "pending" && (
                  <button
                    disabled={busy}
                    onClick={() => reviewReport("under_review")}
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

                {(selected.status === "pending" ||
                  selected.status === "under_review") && (
                  <>
                    <button
                      disabled={busy}
                      onClick={() => reviewReport("action_taken")}
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
                      Record action taken
                    </button>

                    <button
                      disabled={busy}
                      onClick={() => reviewReport("dismissed")}
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
                      Dismiss report
                    </button>
                  </>
                )}
              </div>

              {busy && <p>Saving moderation decision...</p>}

              <section
                style={{
                  marginTop: 28,
                  paddingTop: 22,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <h2 style={{ marginTop: 0 }}>
                  <ShieldCheck
                    size={21}
                    style={{ verticalAlign: "middle", marginRight: 7 }}
                  />
                  Member enforcement
                </h2>
                <p style={{ color: "#647067", fontSize: 14 }}>
                  A report decision and an account warning or suspension are
                  separate actions. Issue enforcement only after reviewing the
                  evidence.
                </p>

                <label
                  htmlFor="moderation-member-id"
                  style={{ display: "block", fontWeight: 700, margin: "14px 0 6px" }}
                >
                  Member account UUID
                </label>
                <input
                  id="moderation-member-id"
                  value={memberId}
                  onChange={(event) => setMemberId(event.target.value)}
                  placeholder="Paste the reported member's account UUID"
                  style={fieldStyle}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: 12,
                    marginTop: 14,
                  }}
                >
                  <div>
                    <label
                      htmlFor="moderation-action-type"
                      style={{ display: "block", fontWeight: 700, marginBottom: 6 }}
                    >
                      Action
                    </label>
                    <select
                      id="moderation-action-type"
                      value={actionType}
                      onChange={(event) =>
                        setActionType(event.target.value as "warning" | "suspension")
                      }
                      style={fieldStyle}
                    >
                      <option value="warning">Formal warning</option>
                      <option value="suspension">Temporary suspension</option>
                    </select>
                  </div>

                  {actionType === "suspension" && (
                    <div>
                      <label
                        htmlFor="suspension-duration"
                        style={{ display: "block", fontWeight: 700, marginBottom: 6 }}
                      >
                        Suspension duration
                      </label>
                      <select
                        id="suspension-duration"
                        value={durationHours}
                        onChange={(event) => setDurationHours(event.target.value)}
                        style={fieldStyle}
                      >
                        <option value="1">1 hour</option>
                        <option value="24">24 hours</option>
                        <option value="72">3 days</option>
                        <option value="168">7 days</option>
                        <option value="336">14 days</option>
                        <option value="720">30 days</option>
                      </select>
                    </div>
                  )}
                </div>

                <label
                  htmlFor="enforcement-reason"
                  style={{ display: "block", fontWeight: 700, margin: "14px 0 6px" }}
                >
                  Reason
                </label>
                <input
                  id="enforcement-reason"
                  value={actionReason}
                  onChange={(event) => setActionReason(event.target.value)}
                  maxLength={500}
                  placeholder="Explain why this action is being issued"
                  style={fieldStyle}
                />

                <label
                  htmlFor="enforcement-details"
                  style={{ display: "block", fontWeight: 700, margin: "14px 0 6px" }}
                >
                  Additional details (optional)
                </label>
                <textarea
                  id="enforcement-details"
                  value={actionDetails}
                  onChange={(event) => setActionDetails(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Add context or instructions for the member"
                  style={{ ...fieldStyle, resize: "vertical" }}
                />

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginTop: 14,
                  }}
                >
                  <button
                    disabled={actionBusy}
                    onClick={issueModerationAction}
                    style={{
                      ...buttonStyle,
                      background: actionType === "suspension" ? "#fff1f2" : "#ecfdf3",
                      borderColor: actionType === "suspension" ? "#fda4af" : "#86d5a5",
                      color: actionType === "suspension" ? "#9f1239" : "#176b3a",
                    }}
                  >
                    {actionType === "suspension" ? (
                      <Ban
                        size={15}
                        style={{ verticalAlign: "middle", marginRight: 6 }}
                      />
                    ) : (
                      <ShieldCheck
                        size={15}
                        style={{ verticalAlign: "middle", marginRight: 6 }}
                      />
                    )}
                    {actionType === "suspension" ? "Issue suspension" : "Issue warning"}
                  </button>

                  <button
                    disabled={historyLoading || actionBusy}
                    onClick={() => loadMemberHistory(memberId)}
                    style={buttonStyle}
                  >
                    <History
                      size={15}
                      style={{ verticalAlign: "middle", marginRight: 6 }}
                    />
                    View member history
                  </button>
                </div>

                {actionBusy && <p>Saving member moderation action...</p>}

                {historyLoading && <p>Loading member history...</p>}

                {historyUserId && (
                  <div style={{ marginTop: 22 }}>
                    <h3>
                      <UserRound
                        size={18}
                        style={{ verticalAlign: "middle", marginRight: 6 }}
                      />
                      Moderation history
                    </h3>
                    <p
                      style={{
                        color: "#647067",
                        fontSize: 12,
                        overflowWrap: "anywhere",
                      }}
                    >
                      Member: {historyUserId}
                    </p>

                    {memberHistory.length === 0 ? (
                      <p>No moderation actions recorded for this member.</p>
                    ) : (
                      <div style={{ display: "grid", gap: 12 }}>
                        {memberHistory.map((action) => {
                          const actionStatus = getActionStatus(action);
                          const isActiveSuspension =
                            action.action_type === "suspension" &&
                            actionStatus === "Active";

                          return (
                            <article
                              key={action.id}
                              style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 10,
                                padding: 14,
                                background: "#fafcfb",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 10,
                                  flexWrap: "wrap",
                                }}
                              >
                                <strong style={{ textTransform: "capitalize" }}>
                                  {action.action_type}
                                </strong>
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: isActiveSuspension ? "#9f1239" : "#176b3a",
                                  }}
                                >
                                  {actionStatus}
                                </span>
                              </div>

                              <p>
                                <strong>Reason:</strong> {action.reason}
                              </p>

                              {action.details && (
                                <p style={{ whiteSpace: "pre-wrap" }}>
                                  <strong>Details:</strong> {action.details}
                                </p>
                              )}

                              <p style={{ fontSize: 13, color: "#647067" }}>
                                Issued: {new Date(action.created_at).toLocaleString()}
                              </p>

                              {action.expires_at && (
                                <p style={{ fontSize: 13, color: "#647067" }}>
                                  Expires: {new Date(action.expires_at).toLocaleString()}
                                </p>
                              )}

                              {action.revoked_at && (
                                <p style={{ fontSize: 13, color: "#647067" }}>
                                  Revoked: {new Date(action.revoked_at).toLocaleString()}
                                </p>
                              )}

                              <p
                                style={{
                                  fontSize: 12,
                                  color: "#647067",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                Action ID: {action.id}
                              </p>

                              {isActiveSuspension && (
                                <button
                                  disabled={actionBusy}
                                  onClick={() => revokeSuspension(action)}
                                  style={{
                                    ...buttonStyle,
                                    color: "#9f1239",
                                    borderColor: "#fda4af",
                                  }}
                                >
                                  Revoke suspension
                                </button>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </section>
          )}
        </>
      )}
    </main>
  );
}
