"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, BriefcaseBusiness } from "lucide-react";

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  created_at: string;
};

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadJobs() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, description, location, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`Could not load jobs: ${error.message}`);
      } else {
        setJobs((data || []) as Job[]);
      }

      setLoading(false);
    }

    loadJobs();
  }, [router]);

  const filteredJobs = jobs.filter((job) => {
    const term = search.toLowerCase();

    return (
      job.title.toLowerCase().includes(term) ||
      job.description.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <main className="dashboard-loading">
        Loading available jobs...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: "850px" }}>
        <a href="/dashboard/" className="profile-back">
          ← Back to dashboard
        </a>

        <h1>Find Work in Your Community</h1>

        <p>
          Explore available jobs posted by people in your community.
        </p>

        <div style={{ margin: "24px 0" }}>
          <label htmlFor="job-search">Search jobs or locations</label>

          <div style={{ position: "relative" }}>
            <Search
              size={19}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />

            <input
              id="job-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plumber, Akungba, electrician..."
              style={{ paddingLeft: "42px", width: "100%" }}
            />
          </div>
        </div>

        {message && (
          <p className="profile-message">{message}</p>
        )}

        <div style={{ marginBottom: "16px" }}>
          <strong>{filteredJobs.length}</strong>{" "}
          {filteredJobs.length === 1 ? "job" : "jobs"} available
        </div>

        {filteredJobs.length === 0 && !message ? (
          <div style={{ textAlign: "center", padding: "35px 10px" }}>
            <BriefcaseBusiness size={38} />
            <h2>No jobs found</h2>
            <p>
              There are no matching open jobs at the moment.
              Check again later or try another search.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "18px" }}>
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <h2 style={{ marginTop: 0 }}>{job.title}</h2>

                <p style={{ whiteSpace: "pre-wrap" }}>
                  {job.description.length > 180
                    ? `${job.description.slice(0, 180)}...`
                    : job.description}
                </p>

                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <MapPin size={17} />
                  {job.location}
                </p>

                <small>
                  Posted{" "}
                  {new Date(job.created_at).toLocaleDateString()}
                </small>

                <div style={{ marginTop: "16px" }}>
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/view/?id=${job.id}`)}
                  >
                    View Job & Apply →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}