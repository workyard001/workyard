"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ShieldCheck,
  Upload,
  FileText,
  Video,
  Clock3,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type VerificationStatus = "unverified" | "pending" | "approved" | "rejected";

type LatestSubmission = {
  id: string;
  status: VerificationStatus;
  submitted_at: string;
};

const DOCUMENT_TYPES = [
  "NIN Slip",
  "Voter's Card",
  "Driver's Licence",
  "International Passport",
];

const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;

function safeExtension(fileName: string, fallback: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]{1,8}$/.test(extension)
    ? extension
    : fallback;
}

export default function VerificationPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState<VerificationStatus>("unverified");
  const [submittedAt, setSubmittedAt] = useState("");
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoConsent, setVideoConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMemberStatus = useCallback(async () => {
    setError("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.replace("/login/");
      return;
    }

    const currentUserId = authData.user.id;
    setUserId(currentUserId);

    const [{ data: profile, error: profileError }, { data: submissions, error: submissionError }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("verification_status")
          .eq("id", currentUserId)
          .maybeSingle(),
        supabase
          .from("verification_submissions")
          .select("id, status, submitted_at")
          .eq("user_id", currentUserId)
          .order("submitted_at", { ascending: false })
          .limit(1),
      ]);

    if (profileError) {
      setError(`Could not load your verification status: ${profileError.message}`);
      setLoading(false);
      return;
    }

    if (submissionError) {
      setError(`Could not load your submission status: ${submissionError.message}`);
      setLoading(false);
      return;
    }

    const latest = (submissions?.[0] || null) as LatestSubmission | null;
    const profileStatus = profile?.verification_status as VerificationStatus | null;

    const validStatuses: VerificationStatus[] = [
      "pending",
      "approved",
      "rejected",
      "unverified",
    ];

    const nextStatus = latest?.status && validStatuses.includes(latest.status)
      ? latest.status
      : profileStatus && validStatuses.includes(profileStatus)
        ? profileStatus
        : "unverified";

    setStatus(nextStatus);
    setSubmittedAt(latest?.submitted_at || "");
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadMemberStatus();
  }, [loadMemberStatus]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("Your session could not be confirmed. Please sign in again.");
      return;
    }

    if (!documentFile) {
      setError("Please choose an identity document.");
      return;
    }

    if (!videoFile) {
      setError("Please choose a face video.");
      return;
    }

    if (!videoConsent) {
      setError("Please confirm the video consent before submitting.");
      return;
    }

    const allowedDocumentTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedDocumentTypes.includes(documentFile.type)) {
      setError("Your identity document must be a JPG, PNG, WebP or PDF file.");
      return;
    }

    if (documentFile.size > MAX_DOCUMENT_SIZE) {
      setError("Your identity document must not exceed 5 MB.");
      return;
    }

    const allowedVideoTypes = ["video/mp4", "video/webm"];

    if (!allowedVideoTypes.includes(videoFile.type)) {
      setError("Your face video must be an MP4 or WebM file.");
      return;
    }

    if (videoFile.size > MAX_VIDEO_SIZE) {
      setError("Your face video must not exceed 25 MB.");
      return;
    }

    setSubmitting(true);

    const timestamp = Date.now();
    const documentExtension = safeExtension(
      documentFile.name,
      documentFile.type === "application/pdf" ? "pdf" : "jpg"
    );
    const videoExtension = safeExtension(videoFile.name, "mp4");

    const documentPath =
      `${userId}/${timestamp}-identity-document.${documentExtension}`;
    const videoPath =
      `${userId}/${timestamp}-face-video.${videoExtension}`;

    const { error: documentUploadError } = await supabase.storage
      .from("identity-documents")
      .upload(documentPath, documentFile, {
        cacheControl: "0",
        upsert: false,
        contentType: documentFile.type,
      });

    if (documentUploadError) {
      setSubmitting(false);
      setError(`Could not upload your identity document: ${documentUploadError.message}`);
      return;
    }

    const { error: videoUploadError } = await supabase.storage
      .from("identity-videos")
      .upload(videoPath, videoFile, {
        cacheControl: "0",
        upsert: false,
        contentType: videoFile.type,
      });

    if (videoUploadError) {
      await supabase.storage
        .from("identity-documents")
        .remove([documentPath]);

      setSubmitting(false);
      setError(`Could not upload your face video: ${videoUploadError.message}`);
      return;
    }

    const { data: insertedSubmission, error: insertError } = await supabase
      .from("verification_submissions")
      .insert({
        user_id: userId,
        document_type: documentType,
        document_path: documentPath,
        video_path: videoPath,
        video_consent_at: new Date().toISOString(),
        status: "pending",
      })
      .select("id, status, submitted_at")
      .single();

    if (insertError) {
      await Promise.all([
        supabase.storage.from("identity-documents").remove([documentPath]),
        supabase.storage.from("identity-videos").remove([videoPath]),
      ]);

      setSubmitting(false);
      setError(`Could not submit your verification: ${insertError.message}`);
      return;
    }

    setStatus("pending");
    setSubmittedAt(insertedSubmission?.submitted_at || new Date().toISOString());
    setDocumentFile(null);
    setVideoFile(null);
    setVideoConsent(false);
    setSuccess("Your verification details have been submitted for review.");
    setSubmitting(false);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <p style={styles.muted}>Loading your verification status...</p>
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
          <h1 style={styles.heading}>Identity Verification</h1>
          <p style={styles.muted}>
            Verify your identity to build trust with people in your WORKYARD community.
          </p>
        </header>

        {error && (
          <div style={styles.error} role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {status === "pending" && (
          <section style={styles.statusCard}>
            <Clock3 size={42} color="#9A6700" />
            <h2 style={styles.statusHeading}>Verification under review</h2>
            <p style={styles.statusText}>
              Your identity details have been submitted successfully and are being
              reviewed by WORKYARD. You do not need to submit anything else while
              this review is in progress.
            </p>
            {submittedAt && (
              <p style={styles.dateText}>
                Submitted: {new Date(submittedAt).toLocaleString()}
              </p>
            )}
            <Link href="/" style={styles.primaryLink}>
              Return to Dashboard
            </Link>
          </section>
        )}

        {status === "approved" && (
          <section style={styles.statusCard}>
            <CheckCircle size={44} color="#0B7A42" />
            <h2 style={styles.statusHeading}>Your identity is verified</h2>
            <p style={styles.statusText}>
              Your WORKYARD identity verification has been approved.
            </p>
            <Link href="/" style={styles.primaryLink}>
              Return to Dashboard
            </Link>
          </section>
        )}

        {status === "rejected" && (
          <section style={styles.notice}>
            <AlertCircle size={22} color="#B42318" />
            <div>
              <strong>Verification not approved</strong>
              <p style={styles.statusText}>
                Your previous submission was not approved. Please check that your
                new document and video meet the requirements before submitting again.
              </p>
            </div>
          </section>
        )}

        {(status === "unverified" || status === "rejected") && (
          <section style={styles.card}>
            <h2 style={styles.subheading}>
              {status === "rejected" ? "Submit a new verification" : "Submit your details"}
            </h2>
            <p style={styles.bodyText}>
              Submit one identity document and a short face video. Your files are
              stored privately and are available only to you and authorized
              WORKYARD verification reviewers.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label} htmlFor="documentType">
                Identity document type
              </label>
              <select
                id="documentType"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                style={styles.input}
                required
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <label style={styles.label} htmlFor="identityDocument">
                Upload identity document
              </label>
              <div style={styles.fileBox}>
                <FileText size={22} color="#0B7A42" />
                <input
                  id="identityDocument"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(event) =>
                    setDocumentFile(event.target.files?.[0] || null)
                  }
                  required
                />
                <small>JPG, PNG, WebP or PDF. Maximum 5 MB.</small>
                {documentFile && (
                  <small style={styles.selectedFile}>
                    Selected: {documentFile.name}
                  </small>
                )}
              </div>

              <label style={styles.label} htmlFor="faceVideo">
                Upload face video
              </label>
              <div style={styles.fileBox}>
                <Video size={22} color="#0B7A42" />
                <input
                  id="faceVideo"
                  type="file"
                  accept=".mp4,.webm,video/mp4,video/webm"
                  onChange={(event) =>
                    setVideoFile(event.target.files?.[0] || null)
                  }
                  required
                />
                <small>MP4 or WebM. Maximum 25 MB.</small>
                {videoFile && (
                  <small style={styles.selectedFile}>
                    Selected: {videoFile.name}
                  </small>
                )}
              </div>

              <label style={styles.consent}>
                <input
                  type="checkbox"
                  checked={videoConsent}
                  onChange={(event) => setVideoConsent(event.target.checked)}
                  required
                />
                <span>
                  I consent to WORKYARD securely storing and reviewing this video
                  together with my identity document for identity-verification purposes.
                </span>
              </label>

              <p style={styles.privacyText}>
                Your submission is private. Other members cannot view your identity
                files or the administrator review area. A face video alone does not
                prove liveness or physical identity.
              </p>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitButton,
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                <Upload size={18} />
                {submitting ? "Submitting..." : "Submit for Verification"}
              </button>
            </form>
          </section>
        )}

        {success && (
          <p style={styles.success} role="status">
            {success}
          </p>
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
    maxWidth: "720px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    margin: "24px 0 28px",
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
  subheading: {
    fontSize: "20px",
    margin: "0 0 10px",
  },
  muted: {
    color: "#687468",
    lineHeight: 1.6,
  },
  bodyText: {
    color: "#536153",
    fontSize: "14px",
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
  card: {
    background: "#fff",
    border: "1px solid #e1e7e1",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
  },
  statusCard: {
    background: "#fff",
    border: "1px solid #e1e7e1",
    borderRadius: "14px",
    padding: "30px 24px",
    margin: "20px 0",
    textAlign: "center",
  },
  statusHeading: {
    fontSize: "21px",
    margin: "14px 0 8px",
  },
  statusText: {
    color: "#536153",
    lineHeight: 1.6,
    fontSize: "14px",
  },
  dateText: {
    color: "#687468",
    fontSize: "12px",
    marginTop: "14px",
  },
  primaryLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "16px",
    padding: "11px 16px",
    borderRadius: "8px",
    background: "#0B7A42",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    background: "#fff7f5",
    border: "1px solid #f1d4d0",
    borderRadius: "10px",
    margin: "20px 0",
  },
  form: {
    display: "grid",
    gap: "12px",
    marginTop: "18px",
  },
  label: {
    display: "block",
    fontWeight: 700,
    fontSize: "14px",
    marginTop: "8px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #ccd5cc",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "14px",
  },
  fileBox: {
    display: "grid",
    gap: "9px",
    padding: "16px",
    border: "1px dashed #b9d9c4",
    borderRadius: "9px",
    background: "#fbfdfb",
    overflowWrap: "anywhere",
  },
  selectedFile: {
    color: "#0B7A42",
    fontWeight: 600,
  },
  consent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "13px",
    lineHeight: 1.5,
    marginTop: "8px",
  },
  privacyText: {
    color: "#687468",
    fontSize: "12px",
    lineHeight: 1.6,
  },
  submitButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    padding: "13px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#0B7A42",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
  },
  error: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    padding: "12px",
    background: "#fff0ef",
    color: "#B42318",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: 1.5,
    marginBottom: "16px",
  },
  success: {
    padding: "12px",
    background: "#e8f6ed",
    color: "#0B7A42",
    borderRadius: "8px",
    fontSize: "13px",
  },
};

