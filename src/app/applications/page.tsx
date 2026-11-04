
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MapPin, ArrowLeft, BriefcaseBusiness } from "lucide-react";

type Application = {
  id: string;
  job_id: string;
  message: string;
  status: string;
  applied_at: string;
  jobs: {
    title: string;
    location: string;
    description: string;
  } | null;
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadApplications() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          job_id,
          message,
          status,
          applied_at,
          jobs (
            title,
            location,
            description
          )
        `)
        .eq("applicant_id", authData.user.id)
        .order("applied_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setApplications((data || []) as Application[]);
      }

      setLoading(false);
    }

    loadApplications();
  }, [router]);

  if (loading) {
    return <main className="dashboard-loading">Loading your applications...</main>;
  }

  return (
    <main className="profile-page">
      <div className="profile-card">
        <a href="/dashboard/" className="profile-back">
          <ArrowLeft size={16} /> Back to dashboard
        </a>

        <h1>My Applications</h1>
        <p>Track the jobs you have applied for in your community.</p>

        {errorMessage && (
          <p className="profile-message">
            Could not load applications: {errorMessage}
          </p>
        )}

        {!errorMessage && applications.length === 0 && (
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
              <h2>{application.jobs?.title || "Job no longer available"}</h2>

              {application.jobs && (
                <>
                  <p>
                    <MapPin size={15} /> {application.jobs.location}
                  </p>
                  <p>{application.jobs.description}</p>
                </>
              )}

              <p><strong>Your application message:</strong></p>
              <p>{application.message}</p>

              <p>
                <strong>Status: </strong>
                {application.status.toUpperCase()}
              </p>

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
