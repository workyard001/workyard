"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ReviewSummary = {
  review_count: number;
  average_rating: number;
};

type ProfileReview = {
  review_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  reviewer_label: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function ProfileReviews({ profileId }: { profileId: string }) {
  const [summary, setSummary] = useState<ReviewSummary>({ review_count: 0, average_rating: 0 });
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setErrorMessage("");

      const [summaryResult, reviewsResult] = await Promise.all([
        supabase.rpc("get_profile_review_summary", { p_profile_id: profileId }),
        supabase.rpc("get_profile_work_reviews", { p_profile_id: profileId }),
      ]);

      if (!active) return;

      if (summaryResult.error || reviewsResult.error) {
        setErrorMessage(
          summaryResult.error?.message || reviewsResult.error?.message ||
          "Work reviews could not be loaded."
        );
        setLoading(false);
        return;
      }

      const summaryRow = Array.isArray(summaryResult.data)
        ? summaryResult.data[0]
        : summaryResult.data;

      setSummary({
        review_count: Number(summaryRow?.review_count || 0),
        average_rating: Number(summaryRow?.average_rating || 0),
      });
      setReviews((reviewsResult.data || []) as ProfileReview[]);
      setLoading(false);
    }

    if (profileId) void loadReviews();
    return () => { active = false; };
  }, [profileId]);

  return (
    <section className="wy-public-section">
      <h2>Work reviews</h2>
      {loading ? (
        <p className="wy-public-muted">Loading confirmed work reviews...</p>
      ) : errorMessage ? (
        <p className="wy-public-muted">{errorMessage}</p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <strong style={{ fontSize: "25px", color: "#173326" }}>
              {summary.review_count ? summary.average_rating.toFixed(1) : "—"}
            </strong>
            <div>
              <div aria-label={`${summary.average_rating.toFixed(1)} out of 5 stars`} style={{ display: "flex", gap: "2px", color: "#e3a400" }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star key={value} size={17} fill={value <= Math.round(summary.average_rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <small style={{ color: "#64748b" }}>
                {summary.review_count} confirmed work review{summary.review_count === 1 ? "" : "s"}
              </small>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="wy-public-muted">No confirmed work reviews yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {reviews.map((review) => (
                <article key={review.review_id} style={{ borderTop: "1px solid #edf2ee", paddingTop: "11px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <strong style={{ color: "#173326", fontSize: "13px" }}>{review.reviewer_label || "WORKYARD member"}</strong>
                    <small style={{ color: "#64748b" }}>{formatDate(review.created_at)}</small>
                  </div>
                  <div style={{ display: "flex", gap: "2px", color: "#e3a400", margin: "5px 0" }} aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star key={value} size={15} fill={value <= review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  {review.review_text && (
                    <p className="wy-public-long-text" style={{ margin: 0 }}>{review.review_text}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
