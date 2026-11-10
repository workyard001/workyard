"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  BriefcaseBusiness,
  MapPin,
  Plus,
  Users,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
};

export default function MyJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMyJobs() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      setUserId(authData.user.id);

      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, description, location, status, created_at")
        .eq("owner_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`Could not load your jobs: ${error.message}`);
      } else {
        setJobs((data || []) as Job[]);
      }

      setLoading(false);
    }

    loadMyJobs();
  }, [router]);

  async function changeJobStatus(job: Job) {
    const nextStatus = job.status === "open" ? "closed" : "open";

    const confirmed = window.confirm(
      nextStatus === "closed"
        ? `Close "${job.title}"? Workers will no longer be able to apply.`
        : `Reopen "${job.title}"? Workers will be able to apply again.`
    );

    if (!confirmed) return;

    setUpdatingId(job.id);
    setMessage("");

    const { data, error } = await supabase
      .from("jobs")
      .update({ status: nextStatus })
      .eq("id", job.id)
      .eq("owner_id", userId)
      .select("id")
      .maybeSingle();

    setUpdatingId("");

    if (error) {
      setMessage(`Could not update this job: ${error.message}`);
      return;
    }

    if (!data) {
      setMessage("The job was not updated. Please check that you own this job.");
      return;
    }

    setJobs((current) =>
      current.map((item) =>
        item.id === job.id ? { ...item, status: nextStatus } : item
      )
    );

    setMessage(
      nextStatus === "closed"
        ? "Job closed successfully. New applications are no longer accepted."
        : "Job reopened successfully."
    );
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        Loading your job posts...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: "850px" }}>
        <Link href="/" className="profile-back">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginTop: "22px"
        }}>
          <div>
            <h1 style={{ margin: "0 0 8px" }}>Manage Job Posts</h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Manage your jobs and review people who have applied.
            </p>
          </div>

          <Link href="/jobs/new/" className="btn">
            <Plus size={17} /> Post a Job
          </Link>
        </div>

        {message && (
          <p className="auth-message" role="status" style={{ marginTop: "20px" }}>
            {message}
          </p>
        )}

        {jobs.length === 0 && !message && (
          <div style={{ textAlign: "center", padding: "45px 10px" }}>
            <BriefcaseBusiness size={42} color="#0B7A42" />
            <h2>You haven't posted any jobs yet</h2>
            <p style={{ color: "#64748b" }}>
              When you post a job, it will appear here.
            </p>
            <Link href="/jobs/new/" className="btn">
              Post your first job
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gap: "18px", marginTop: "25px" }}>
          {jobs.map((job) => {
            const isOpen = job.status?.toLowerCase() === "open";
            const isUpdating = updatingId === job.id;

            return (
              <article
                key={job.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap"
                }}>
                  <h2 style={{ margin: 0 }}>{job.title}</h2>

                  <span style={{
                    padding: "7px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 800,
                    background: isOpen ? "#e6f5eb" : "#f1f5f9",
                    color: isOpen ? "#0B7A42" : "#64748b",
                  }}>
                    {job.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>

                <p style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  color: "#64748b"
                }}>
                  <MapPin size={16} /> {job.location}
                </p>

                <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {job.description}
                </p>

                <small style={{ color: "#64748b" }}>
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </small>

                <div style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "20px"
                }}>
                  <Link
                    href={`/my-jobs/applicants/?id=${encodeURIComponent(job.id)}`}
                    className="btn"
                  >
                    <Users size={17} /> View Applicants
                  </Link>

                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={isUpdating}
                    onClick={() => changeJobStatus(job)}
                  >
                    {isUpdating
                      ? "Updating..."
                      : isOpen
                        ? "Close Job"
                        : "Reopen Job"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
