
"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MapPin, ArrowLeft, BriefcaseBusiness } from "lucide-react";

type Job = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
};

function JobViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");

  const [job, setJob] = useState<Job | null>(null);
  const [userId, setUserId] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      setUserId(authData.user.id);

      if (!jobId) {
        setMessage("Job not found. Please return to the job board.");
        setLoading(false);
        return;
      }

      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("id, owner_id, title, description, location, status, created_at")
        .eq("id", jobId)
        .eq("status", "open")
        .maybeSingle();

      if (jobError || !jobData) {
        setMessage("This job is unavailable or has been closed.");
        setLoading(false);
        return;
      }

      setJob(jobData as Job);

      const { data: application } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("applicant_id", authData.user.id)
        .maybeSingle();

      if (application) {
        setAlreadyApplied(true);
      }

      setLoading(false);
    }

    loadJob();
  }, [router, jobId]);

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!job || !userId) return;

    if (job.owner_id === userId) {
      setMessage("You cannot apply for your own job.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const { error } = await supabase.from("job_applications").insert({
      job_id: job.id,
      applicant_id: userId,
      message: applicationMessage.trim(),
      status: "pending",
    });

    if (error) {
      setMessage(`Application failed: ${error.message}`);
      setSubmitting(false);
      return;
    }

    setAlreadyApplied(true);
    setMessage("Your application has been submitted successfully!");
    setApplicationMessage("");
    setSubmitting(false);
  }

  if (loading) {
    return <main className="dashboard-loading">Loading job details...</main>;
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: "750px" }}>
        <a href="/jobs/" className="profile-back">
          <ArrowLeft size={16} /> Back to jobs
        </a>

        {job ? (
          <>
            <div style={{ marginTop: "20px" }}>
              <BriefcaseBusiness size={36} />
              <h1>{job.title}</h1>

              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <MapPin size={18} />
                {job.location}
              </p>

              <p style={{ color: "#64748b", fontSize: "14px" }}>
                Posted {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>

            <hr style={{ margin: "24px 0", borderColor: "#e5e7eb" }} />

            <h2>Job description</h2>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {job.description}
            </p>

            <hr style={{ margin: "24px 0", borderColor: "#e5e7eb" }} />

            {job.owner_id === userId ? (
              <p>You posted this job. You cannot apply to your own listing.</p>
            ) : alreadyApplied ? (
              <div>
                <h2>Application submitted</h2>
                <p>You have already applied for this job.</p>
              </div>
            ) : (
              <>
                <h2>Apply for this job</h2>
                <p>Tell the client why you are suitable for this work.</p>

                <form onSubmit={handleApply} className="profile-form">
                  <label>
                    Application message
                    <textarea
                      value={applicationMessage}
                      onChange={(event) =>
                        setApplicationMessage(event.target.value)
                      }
                      placeholder="Introduce yourself and explain how you can do this job..."
                      rows={5}
                      required
                    />
                  </label>

                  <button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              </>
            )}

            {message && <p className="profile-message">{message}</p>}
          </>
        ) : (
          <div>
            <h1>Job unavailable</h1>
            <p>{message}</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ViewJobPage() {
  return (
    <Suspense
      fallback={<main className="dashboard-loading">Loading job details...</main>}
    >
      <JobViewContent />
    </Suspense>
  );
}
