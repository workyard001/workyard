"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MapPin, ArrowLeft, BriefcaseBusiness, MessageCircle } from "lucide-react";

type Job = {
  id: string;
  title: string;
  location: string;
  description: string;
  status: string;
};

type Application = {
  id: string;
  job_id: string;
  message: string;
  status: string;
  applied_at: string;
  job: Job | null;
};

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [openingId, setOpeningId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      // First retrieve the signed-in user's applications only.
      const { data: applicationData, error: applicationError } =
        await supabase
          .from("job_applications")
          .select("id, job_id, message, status, applied_at")
          .eq("applicant_id", authData.user.id)
          .order("applied_at", { ascending: false });

      if (!active) return;

      if (applicationError) {
        setErrorMessage(
          `Could not load applications: ${applicationError.message}`
        );
        setLoading(false);
        return;
      }

      const rows = applicationData || [];

      if (rows.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Retrieve the related jobs separately by their IDs.
      // This avoids relying on Supabase's nested relationship shape.
      const jobIds = [...new Set(rows.map((item) => item.job_id))];

      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("id, title, location, description, status")
        .in("id", jobIds);

      if (!active) return;

      if (jobError) {
        setErrorMessage(
          `Your applications loaded, but job details could not be retrieved: ${jobError.message}`
        );
      }

      const jobsById = new Map<string, Job>(
        ((jobData || []) as Job[]).map((job) => [job.id, job])
      );

      const combined: Application[] = rows.map((application) => ({
        id: application.id,
        job_id: application.job_id,
        message: application.message,
        status: application.status,
        applied_at: application.applied_at,
        job: jobsById.get(application.job_id) || null,
      }));

      setApplications(combined);
      setLoading(false);
    }

    void loadApplications();

    return () => {
      active = false;
    };
  }, [router]);

  async function startConversation(applicationId: string) {
    setOpeningId(applicationId);
    setErrorMessage("");

    const { data, error } = await supabase.rpc(
      "create_or_get_conversation",
      { p_application_id: applicationId }
    );

    setOpeningId("");

    if (error || !data) {
      setErrorMessage(
        error?.message || "Could not start this conversation."
      );
      return;
    }

    router.push(`/messages/chat/?id=${encodeURIComponent(data)}`);
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        Loading your applications...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card">
        <a href="/" className="profile-back">
          <ArrowLeft size={16} /> Back to Home
        </a>

        <h1>My Applications</h1>
        <p>Track the jobs you have applied for in your community.</p>

        {errorMessage && (
          <p className="profile-message" role="status">
            {errorMessage}
          </p>
        )}

        {applications.length === 0 && !errorMessage && (
          <div>
            <BriefcaseBusiness size={40} />
            <h3>No applications yet</h3>
            <p>When you apply for a job, it will appear here.</p>
            <button onClick={() => router.push("/jobs/")}>
              Find Work
            </button>
          </div>
        )}

        <div>
          {applications.map((application) => (
            <article
              key={application.id}
              className="profile-form"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "18px",
                marginTop: "16px",
              }}
            >
              <h2>
                {application.job?.title || "Job details unavailable"}
              </h2>

              {application.job && (
                <>
                  <p>
                    <MapPin size={15} /> {application.job.location}
                  </p>
                  <p>{application.job.description}</p>
                  <small>
                    Job status: {application.job.status.toUpperCase()}
                  </small>
                </>
              )}

              <p><strong>Your application message:</strong></p>
              <p>{application.message}</p>

              <p>
                <strong>Status: </strong>
                {application.status.toUpperCase()}
              </p>

              <button
                type="button"
                className="btn"
                style={{ marginTop: "8px" }}
                disabled={openingId === application.id}
                onClick={() => startConversation(application.id)}
              >
                <MessageCircle size={16} />
                {openingId === application.id
                  ? "Opening chat..."
                  : "Message Employer"}
              </button>

              <small>
                Applied on{" "}
                {new Date(application.applied_at).toLocaleDateString()}
              </small>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
