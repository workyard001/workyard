"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MapPin, Users } from "lucide-react";

type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "accepted"
  | "rejected";

type Applicant = {
  application_id: string;
  applicant_id: string;
  message: string;
  status: ApplicationStatus;
  applied_at: string;
  full_name: string | null;
  avatar_path: string | null;
  avatar_url: string | null;
  account_type: string | null;
  location: string | null;
  verification_status: string | null;
};

type Job = {
  id: string;
  title: string;
  location: string;
  status: string;
};

function ApplicantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [openingId, setOpeningId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApplicants() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      if (!jobId) {
        if (active) {
          setMessage("No job was selected. Return to Manage Job Posts and choose a job.");
          setLoading(false);
        }
        return;
      }

      // Confirm that this job belongs to the signed-in user.
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("id, title, location, status")
        .eq("id", jobId)
        .eq("owner_id", authData.user.id)
        .maybeSingle();

      if (!active) return;

      if (jobError || !jobData) {
        setMessage("This job could not be found, or you do not have permission to view it.");
        setLoading(false);
        return;
      }

      setJob(jobData as Job);

      // The database function checks job ownership again and returns
      // only the applicant details approved for the employer to see.
      const { data, error } = await supabase.rpc("get_job_applicants_v2", {
        p_job_id: jobId,
      });

      if (!active) return;

      if (error) {
        setMessage(`Could not load applicants: ${error.message}`);
      } else {
        const rows = (data || []) as Applicant[];

        const applicantsWithPhotos = await Promise.all(
          rows.map(async (applicant) => {
            if (!applicant.avatar_path) {
              return { ...applicant, avatar_url: null };
            }

            const { data: photo } = await supabase.storage
              .from("profile-photos")
              .createSignedUrl(applicant.avatar_path, 3600);

            return {
              ...applicant,
              avatar_url: photo?.signedUrl || null,
            };
          })
        );

        setApplicants(applicantsWithPhotos);
      }

      setLoading(false);
    }

    void loadApplicants();

    return () => {
      active = false;
    };
  }, [router, jobId]);

  async function updateStatus(
    applicationId: string,
    nextStatus: ApplicationStatus
  ) {
    setUpdatingId(applicationId);
    setMessage("");

    const { error } = await supabase.rpc("update_application_status", {
      p_application_id: applicationId,
      p_status: nextStatus,
    });

    setUpdatingId("");

    if (error) {
      setMessage(`Could not update application: ${error.message}`);
      return;
    }

    setApplicants((current) =>
      current.map((applicant) =>
        applicant.application_id === applicationId
          ? { ...applicant, status: nextStatus }
          : applicant
      )
    );
  }


  async function startConversation(applicationId: string) {
    setOpeningId(applicationId);
    setMessage("");

    const { data, error } = await supabase.rpc(
      "create_or_get_conversation",
      { p_application_id: applicationId }
    );

    setOpeningId("");

    if (error || !data) {
      setMessage(error?.message || "Could not start this conversation.");
      return;
    }

    router.push(
      `/messages/chat/?id=${encodeURIComponent(data)}`
    );
  }


  if (loading) {
    return (
      <main className="dashboard-loading">
        Loading applicants...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: "850px" }}>
        <Link href="/my-jobs/" className="profile-back">
          <ArrowLeft size={16} /> Back to Manage Job Posts
        </Link>

        {job ? (
          <>
            <h1 style={{ marginTop: "22px" }}>Applicants</h1>

            <h2 style={{ marginBottom: "8px" }}>{job.title}</h2>

            <p style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              color: "#64748b"
            }}>
              <MapPin size={16} /> {job.location}
            </p>

            <p style={{ color: "#64748b" }}>
              Job status: <strong>{job.status.toUpperCase()}</strong>
            </p>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              margin: "24px 0"
            }}>
              <Users size={22} color="#0B7A42" />
              <strong>
                {applicants.length} {applicants.length === 1 ? "application" : "applications"}
              </strong>
            </div>

            {message && (
              <p className="auth-message" role="status">{message}</p>
            )}

            {applicants.length === 0 && !message && (
              <div style={{ textAlign: "center", padding: "40px 10px" }}>
                <Users size={40} color="#0B7A42" />
                <h2>No applicants yet</h2>
                <p style={{ color: "#64748b" }}>
                  When someone applies for this job, their application will appear here.
                </p>
              </div>
            )}

            <div style={{ display: "grid", gap: "18px" }}>
              {applicants.map((applicant) => (
                <article
                  key={applicant.application_id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "20px",
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap"
                  }}>
                    {applicant.avatar_url ? (
                      <img
                        src={applicant.avatar_url}
                        alt=""
                        style={{
                          width: "54px",
                          height: "54px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "50%",
                        background: "#e6f5eb",
                        color: "#0B7A42",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                        fontSize: "18px"
                      }}>
                        {(applicant.full_name || "W").trim().charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 5px" }}>
                        {applicant.full_name || "WORKYARD member"}
                      </h3>

                      <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                        {applicant.account_type?.replaceAll("_", " ") || "Member"}
                      </p>
                    </div>

                    {applicant.verification_status === "verified" && (
                      <span style={{
                        background: "#e6f5eb",
                        color: "#0B7A42",
                        borderRadius: "20px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        fontWeight: 700
                      }}>
                        Verified
                      </span>
                    )}
                  </div>

                  {applicant.location && (
                    <p style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      color: "#64748b",
                      fontSize: "13px"
                    }}>
                      <MapPin size={15} /> {applicant.location}
                    </p>
                  )}

                  <div style={{
                    background: "#f8faf9",
                    padding: "15px",
                    borderRadius: "9px",
                    marginTop: "15px"
                  }}>
                    <strong>Application message</strong>
                    <p style={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.7,
                      marginBottom: 0
                    }}>
                      {applicant.message}
                    </p>
                  </div>

                  <p style={{ color: "#64748b", fontSize: "12px" }}>
                    Applied on {new Date(applicant.applied_at).toLocaleDateString()}
                  </p>

                  <button
                    type="button"
                    className="btn"
                    style={{ marginTop: "10px" }}
                    disabled={openingId === applicant.application_id}
                    onClick={() =>
                      startConversation(applicant.application_id)
                    }
                  >
                    {openingId === applicant.application_id
                      ? "Opening chat..."
                      : "Message Applicant"}
                  </button>

                  <label style={{
                    display: "grid",
                    gap: "8px",
                    marginTop: "14px",
                    fontWeight: 700,
                    fontSize: "13px"
                  }}>
                    Application status
                    <select
                      value={applicant.status}
                      disabled={updatingId === applicant.application_id}
                      onChange={(event) =>
                        updateStatus(
                          applicant.application_id,
                          event.target.value as ApplicationStatus
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #dce8df",
                        borderRadius: "9px",
                        background: "#fff",
                        font: "inherit"
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>

                  {updatingId === applicant.application_id && (
                    <small>Saving status...</small>
                  )}
                </article>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1>Applicants unavailable</h1>
            <p>{message}</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function ApplicantsPage() {
  return (
    <Suspense
      fallback={
        <main className="dashboard-loading">Loading applicants...</main>
      }
    >
      <ApplicantsContent />
    </Suspense>
  );
}
