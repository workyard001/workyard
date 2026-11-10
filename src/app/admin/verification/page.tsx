"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Video,
} from "lucide-react";

type VerificationItem = {
  submission_id: string;
  user_id: string;
  full_name: string | null;
  account_type: string | null;
  location: string | null;
  document_type: string;
  document_path: string;
  video_path: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_notes: string | null;
};

export default function AdminVerificationPage() {
  const router = useRouter();

  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<VerificationItem | null>(null);
  const [documentUrl, setDocumentUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [documentLoading, setDocumentLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [notes, setNotes] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadQueue = useCallback(async () => {
    setError("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.replace("/login/");
      return;
    }

    const { data: adminResult, error: adminError } =
      await supabase.rpc("is_verification_admin");

    if (adminError || adminResult !== true) {
      setAuthorized(false);
      setLoading(false);
      setError(
        "Access denied. This account is not an authorized WORKYARD administrator."
      );
      return;
    }

    setAuthorized(true);

    const { data, error: queueError } =
      await supabase.rpc("get_verification_queue");

    if (queueError) {
      setError(`Could not load verification queue: ${queueError.message}`);
    } else {
      setItems((data || []) as VerificationItem[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  async function viewSubmission(item: VerificationItem) {
    setError("");
    setMessage("");
    setVideoError("");
    setDocumentUrl("");
    setVideoUrl("");
    setSelected(item);
    setDocumentLoading(true);
    setVideoLoading(Boolean(item.video_path));

    const { data: documentData, error: documentSignedUrlError } =
      await supabase.storage
        .from("identity-documents")
        .createSignedUrl(item.document_path, 60);

    if (documentSignedUrlError) {
      setError(
        `Could not open identity document: ${documentSignedUrlError.message}`
      );
    } else {
      setDocumentUrl(documentData.signedUrl);
    }

    setDocumentLoading(false);

    if (item.video_path) {
      const { data: videoData, error: videoSignedUrlError } =
        await supabase.storage
          .from("identity-videos")
          .createSignedUrl(item.video_path, 60);

      if (videoSignedUrlError) {
        setVideoError(
          `Could not open face video: ${videoSignedUrlError.message}`
        );
      } else {
        setVideoUrl(videoData.signedUrl);
      }

      setVideoLoading(false);
    }
  }

  function closeReview() {
    setSelected(null);
    setDocumentUrl("");
    setVideoUrl("");
    setVideoError("");
    setDocumentLoading(false);
    setVideoLoading(false);
    setNotes("");
  }

  async function reviewSubmission(
    item: VerificationItem,
    decision: "approved" | "rejected"
  ) {
    setError("");
    setMessage("");

    if (decision === "rejected" && !notes.trim()) {
      setError("Please provide a reason before rejecting this submission.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${decision} this identity verification?`
    );

    if (!confirmed) return;

    setBusyId(item.submission_id);

    const { error: reviewError } = await supabase.rpc(
      "review_verification_submission",
      {
        p_submission_id: item.submission_id,
        p_status: decision,
        p_notes: notes.trim() || null,
      }
    );

    if (reviewError) {
      setError(`Review failed: ${reviewError.message}`);
    } else {
      setMessage(`Identity verification ${decision} successfully.`);
      closeReview();
      await loadQueue();
    }

    setBusyId("");
  }

  const pendingCount = items.filter(
    (item) => item.status === "pending"
  ).length;

  if (loading) {
    return (
      <main style={styles.page}>
        <p>Checking administrator access...</p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main style={styles.page}>
        <section style={styles.container}>
          <div style={styles.card}>
            <ShieldCheck size={36} color="#B42318" />
            <h1 style={styles.heading}>Administrator access required</h1>
            <p style={styles.muted}>
              {error || "You are not authorized to access this page."}
            </p>
            <Link href="/" style={styles.back}>
              Return to Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/" style={styles.back}>
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <header style={styles.header}>
          <div style={styles.icon}>
            <ShieldCheck size={30} />
          </div>
          <h1 style={styles.heading}>Identity Verification Admin</h1>
          <p style={styles.muted}>
            Review identity documents and submitted face videos securely.
          </p>
        </header>

        <section style={styles.summary}>
          <div>
            <span style={styles.summaryNumber}>{items.length}</span>
            <span style={styles.summaryLabel}>Total submissions</span>
          </div>
          <div>
            <span style={styles.summaryNumber}>{pendingCount}</span>
            <span style={styles.summaryLabel}>Awaiting review</span>
          </div>
          <button
            style={styles.refresh}
            onClick={() => {
              setLoading(true);
              void loadQueue();
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </section>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <section style={styles.card}>
          <h2 style={styles.subheading}>Verification submissions</h2>

          {items.length === 0 ? (
            <p style={styles.muted}>
              No identity verification submissions have been received yet.
            </p>
          ) : (
            <div style={styles.list}>
              {items.map((item) => (
                <article key={item.submission_id} style={styles.item}>
                  <div style={styles.itemTop}>
                    <div>
                      <strong style={styles.name}>
                        {item.full_name || "Name not available"}
                      </strong>
                      <p style={styles.detail}>{item.document_type}</p>
                      <p style={styles.detail}>
                        {item.account_type || "Account type unavailable"}
                        {item.location ? ` · ${item.location}` : ""}
                      </p>
                      <p style={styles.detail}>
                        Submitted: {new Date(item.submitted_at).toLocaleString()}
                      </p>
                      <p style={styles.detail}>
                        Face video: {item.video_path ? "Submitted" : "Not available"}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.status,
                        color:
                          item.status === "approved"
                            ? "#0B7A42"
                            : item.status === "rejected"
                              ? "#B42318"
                              : "#9A6700",
                      }}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <button
                    style={styles.documentButton}
                    onClick={() => void viewSubmission(item)}
                  >
                    <FileText size={17} />
                    Review identity submission
                  </button>

                  {item.reviewed_notes && (
                    <p style={styles.detail}>
                      Review note: {item.reviewed_notes}
                    </p>
                  )}

                  {item.reviewed_at && (
                    <p style={styles.detail}>
                      Reviewed: {new Date(item.reviewed_at).toLocaleString()}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {selected && (
          <section style={styles.card}>
            <div style={styles.previewHeader}>
              <h2 style={styles.subheading}>Identity submission review</h2>
              <button style={styles.closeButton} onClick={closeReview}>
                Close
              </button>
            </div>

            <p style={styles.detail}>
              Applicant: {selected.full_name || selected.user_id}
            </p>
            <p style={styles.detail}>Document: {selected.document_type}</p>

            <h3 style={styles.mediaHeading}>Identity document</h3>
            {documentLoading ? (
              <p style={styles.muted}>Preparing secure document preview...</p>
            ) : documentUrl ? (
              <div style={styles.preview}>
                {selected.document_path.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={documentUrl}
                    title="Identity document preview"
                    style={styles.iframe}
                  />
                ) : (
                  <img
                    src={documentUrl}
                    alt="Submitted identity document"
                    style={styles.image}
                  />
                )}
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.openLink}
                >
                  <ExternalLink size={15} />
                  Open document in new tab
                </a>
                <p style={styles.hint}>
                  This secure document link expires after 60 seconds.
                </p>
              </div>
            ) : (
              <p style={styles.muted}>
                The document preview is unavailable. Check the error above.
              </p>
            )}

            <h3 style={styles.mediaHeading}>Submitted face video</h3>
            {!selected.video_path ? (
              <p style={styles.muted}>
                No face video was attached to this submission.
              </p>
            ) : videoLoading ? (
              <p style={styles.muted}>Preparing secure video preview...</p>
            ) : videoUrl ? (
              <div style={styles.preview}>
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  style={styles.video}
                >
                  Your browser does not support video playback.
                </video>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.openLink}
                >
                  <ExternalLink size={15} />
                  Open video in new tab
                </a>
                <p style={styles.hint}>
                  This secure video link expires after 60 seconds. The video is
                  for manual review; it is not an automated liveness check.
                </p>
              </div>
            ) : (
              <p style={styles.error}>
                {videoError || "The video preview is unavailable."}
              </p>
            )}

            {selected.status === "pending" && (
              <div style={styles.reviewBox}>
                <label htmlFor="reviewNotes" style={styles.label}>
                  Review notes
                </label>
                <textarea
                  id="reviewNotes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Enter a reason for rejection or optional approval notes..."
                  style={styles.textarea}
                />

                <div style={styles.actions}>
                  <button
                    disabled={busyId === selected.submission_id}
                    style={styles.approveButton}
                    onClick={() =>
                      void reviewSubmission(selected, "approved")
                    }
                  >
                    <CheckCircle size={17} />
                    {busyId === selected.submission_id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    disabled={busyId === selected.submission_id}
                    style={styles.rejectButton}
                    onClick={() =>
                      void reviewSubmission(selected, "rejected")
                    }
                  >
                    <XCircle size={17} />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f7f5",
    padding: "32px 16px",
    color: "#202820",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    margin: "20px 0 28px",
  },
  icon: {
    display: "inline-flex",
    padding: "14px",
    borderRadius: "50%",
    background: "#e3f3e9",
    color: "#0B7A42",
  },
  heading: {
    fontSize: "28px",
    margin: "14px 0 8px",
  },
  muted: {
    color: "#687468",
    lineHeight: 1.6,
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#0B7A42",
    textDecoration: "none",
    fontWeight: 600,
  },
  summary: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    padding: "20px",
    background: "#fff",
    border: "1px solid #e1e7e1",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  summaryNumber: {
    display: "block",
    fontSize: "26px",
    fontWeight: 800,
    color: "#0B7A42",
  },
  summaryLabel: {
    fontSize: "13px",
    color: "#687468",
  },
  refresh: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    border: "1px solid #ccd5cc",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    border: "1px solid #e1e7e1",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "20px",
  },
  subheading: {
    fontSize: "20px",
    margin: "0 0 18px",
  },
  mediaHeading: {
    fontSize: "16px",
    margin: "22px 0 10px",
  },
  list: {
    display: "grid",
    gap: "14px",
  },
  item: {
    padding: "16px 0",
    borderBottom: "1px solid #edf0ed",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  name: {
    fontSize: "16px",
  },
  detail: {
    color: "#687468",
    fontSize: "13px",
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },
  status: {
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  documentButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    border: "1px solid #b9d9c4",
    borderRadius: "8px",
    background: "#edf8f0",
    color: "#0B7A42",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  closeButton: {
    padding: "8px 12px",
    border: "1px solid #ccd5cc",
    borderRadius: "7px",
    background: "#fff",
    cursor: "pointer",
  },
  preview: {
    marginTop: "16px",
  },
  image: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "500px",
    objectFit: "contain",
    margin: "0 auto",
    border: "1px solid #e1e7e1",
    borderRadius: "8px",
  },
  video: {
    display: "block",
    width: "100%",
    maxHeight: "520px",
    background: "#111",
    borderRadius: "8px",
    border: "1px solid #e1e7e1",
  },
  iframe: {
    width: "100%",
    height: "500px",
    border: "1px solid #e1e7e1",
    borderRadius: "8px",
  },
  openLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "12px",
    color: "#0B7A42",
    fontWeight: 600,
    textDecoration: "none",
  },
  hint: {
    fontSize: "12px",
    color: "#687468",
    lineHeight: 1.5,
  },
  reviewBox: {
    marginTop: "22px",
    paddingTop: "18px",
    borderTop: "1px solid #e1e7e1",
  },
  label: {
    display: "block",
    fontWeight: 700,
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    border: "1px solid #ccd5cc",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "14px",
  },
  approveButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#0B7A42",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  rejectButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#B42318",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "12px",
    background: "#fff0ef",
    color: "#B42318",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  success: {
    padding: "12px",
    background: "#e8f6ed",
    color: "#0B7A42",
    borderRadius: "8px",
  },
};
