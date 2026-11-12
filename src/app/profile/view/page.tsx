
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  BadgeCheck,
  UserPlus,
  UserCheck,
  Clock3,
  X,
  BriefcaseBusiness,
  GraduationCap,
  Wrench,
  Award,
  Languages,
  MessageCircle,
  UserRound,
  Flag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProfileReviews from "@/components/ProfileReviews";

type ConnectionStatus =
  | "self"
  | "accepted"
  | "outgoing"
  | "incoming"
  | "none";

type MemberProfile = {
  user_id: string;
  full_name: string;
  avatar_path: string | null;
  account_type: string | null;
  verification_status: string | null;
  headline: string | null;
  about: string | null;
  education: string | null;
  experience: string | null;
  skills: string | null;
  certifications: string | null;
  languages: string | null;
  phone: string | null;
  location: string | null;
  is_connection: boolean;
  connection_status: ConnectionStatus;
  connection_id: string | null;
  created_at: string;
};

type ProfilePost = {
  id: string;
  post_type: string;
  content: string;
  created_at: string;
};

function displayAccountType(value: string | null) {
  if (!value) return "WORKYARD member";
  if (value === "hirer" || value === "client" || value === "recruiter") {
    return "HIRER";
  }
  if (value === "job_seeker") return "Job Seeker";
  if (value === "skill_owner") return "Skill Owner";
  return value.replaceAll("_", " ");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function PublicMemberProfilePage() {
  const [profileId, setProfileId] = useState("");
  const [viewerId, setViewerId] = useState("");
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) setProfileId(id);
  }, []);

  const loadProfile = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    setMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        window.location.href = "/login/";
        return;
      }

      setViewerId(authData.user.id);

      const { data, error } = await supabase.rpc(
        "get_member_profile_v2",
        { p_profile_id: profileId }
      );

      if (error) throw error;

      const rows = (data || []) as MemberProfile[];
      const member = rows[0];

      if (!member) {
        setProfile(null);
        setMessage("This WORKYARD profile could not be found.");
        return;
      }

      setProfile(member);

      if (member.avatar_path) {
        const { data: signed, error: signedError } =
          await supabase.storage
            .from("profile-photos")
            .createSignedUrl(member.avatar_path, 3600);

        if (signedError) {
          setAvatarUrl("");
        } else {
          setAvatarUrl(signed.signedUrl);
        }
      } else {
        setAvatarUrl("");
      }

      const { data: postData } = await supabase
        .from("yard_posts")
        .select("id, post_type, content, created_at")
        .eq("author_id", profileId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(10);

      setPosts((postData || []) as ProfilePost[]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load this profile."
      );
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (profileId) void loadProfile();
  }, [profileId, loadProfile]);

  async function handleConnectionAction(action: "connect" | "accept" | "decline" | "cancel" | "remove") {
    if (!profile) return;

    setActionLoading(true);
    setMessage("");

    try {
      if (action === "connect") {
        const { error } = await supabase
          .from("workyard_connections")
          .insert({
            requester_id: viewerId,
            recipient_id: profile.user_id,
            status: "pending",
          });

        if (error) throw error;
      }

      if (action === "accept" || action === "decline") {
        if (!profile.connection_id) {
          throw new Error("Connection request could not be found.");
        }

        const { data, error } = await supabase.rpc(
          "respond_workyard_connection",
          {
            p_connection_id: profile.connection_id,
            p_accept: action === "accept",
          }
        );

        if (error) throw error;
        if (data !== true) {
          throw new Error("This connection request is no longer pending.");
        }
      }

      if (action === "cancel" || action === "remove") {
        if (!profile.connection_id) {
          throw new Error("Connection could not be found.");
        }

        if (
          action === "remove" &&
          !window.confirm("Remove this WORKYARD connection?")
        ) {
          setActionLoading(false);
          return;
        }

        const { error } = await supabase
          .from("workyard_connections")
          .delete()
          .eq("id", profile.connection_id);

        if (error) throw error;
      }

      await loadProfile();
      setMessage(
        action === "connect"
          ? "Connection request sent."
          : action === "accept"
            ? "Connection accepted."
            : action === "decline"
              ? "Connection request declined."
              : action === "cancel"
                ? "Connection request cancelled."
                : "Connection removed."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The connection action could not be completed."
      );
    } finally {
      setActionLoading(false);
    }
  }


  async function reportProfile() {
    if (!profile || isReportingSelf() || reportSubmitting) return;

    const reasons = [
      "spam",
      "harassment",
      "scam",
      "impersonation",
      "inappropriate_content",
      "unsafe_work",
      "other",
    ];

    const selected = window.prompt(
      "Why are you reporting this profile?\\n" +
      reasons.map((reason, index) => `${index + 1}. ${reason.replaceAll("_", " ")}`).join("\\n")
    );

    if (!selected) return;

    const index = Number(selected.trim()) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= reasons.length) {
      setMessage("Invalid report reason. Please try again.");
      return;
    }

    const details = window.prompt("Additional details (optional):");

    setReportSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.rpc("submit_content_report", {
        p_target_type: "profile",
        p_target_id: profile.user_id,
        p_reason: reasons[index],
        p_details: details?.trim() || null,
      });

      if (error) {
        if (error.message.toLowerCase().includes("duplicate") ||
            error.code === "23505") {
          throw new Error("You have already submitted an active report for this profile.");
        }
        throw error;
      }

      setMessage("Profile report submitted successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not submit this profile report."
      );
    } finally {
      setReportSubmitting(false);
    }
  }

  function isReportingSelf() {
    return viewerId === profile?.user_id;
  }

  if (loading) {
    return (
      <main className="wy-public-profile-loading">
        Loading member profile...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="wy-public-profile-page">
        <div className="wy-public-profile-card">
          <Link href="/" className="wy-profile-back">
            <ArrowLeft size={16} /> Home feed
          </Link>
          <h1>Profile unavailable</h1>
          <p>{message || "This member profile is not available."}</p>
        </div>
      </main>
    );
  }

  const isSelf = viewerId === profile.user_id;

  return (
    <main className="wy-public-profile-page">
      <header className="wy-profile-editor-top">
        <Link href="/" className="wy-profile-back">
          <ArrowLeft size={17} /> Home feed
        </Link>
        {isSelf && (
          <Link href="/profile/" className="wy-profile-preview-link">
            Edit my profile
          </Link>
        )}
      </header>

      {message && (
        <div className="wy-profile-alert success" role="status">
          {message}
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="wy-public-profile-layout">
        <section className="wy-public-profile-main">
          <div className="wy-public-identity-card">
            <div className="wy-public-cover" />
            <div className="wy-public-identity-body">
              {avatarUrl ? (
                <img
                  className="wy-public-avatar"
                  src={avatarUrl}
                  alt={profile.full_name}
                />
              ) : (
                <div className="wy-public-avatar wy-public-avatar-empty">
                  <UserRound size={43} />
                </div>
              )}

              <div className="wy-public-identity-content">
                <div className="wy-public-name-row">
                  <h1>{profile.full_name}</h1>
                  {profile.verification_status === "approved" && (
                    <span className="wy-public-verified">
                      <BadgeCheck size={17} /> Verified
                    </span>
                  )}
                </div>

                {profile.headline && (
                  <p className="wy-public-headline">{profile.headline}</p>
                )}

                <div className="wy-public-meta">
                  <span>{displayAccountType(profile.account_type)}</span>
                  {profile.location && (
                    <span><MapPin size={14} /> {profile.location}</span>
                  )}
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>

                {!isSelf && (
                  <div className="wy-connection-actions">
                    {profile.connection_status === "none" && (
                      <button
                        type="button"
                        className="wy-profile-save"
                        onClick={() => void handleConnectionAction("connect")}
                        disabled={actionLoading}
                      >
                        <UserPlus size={17} />
                        {actionLoading ? "Sending..." : "Connect"}
                      </button>
                    )}

                    {profile.connection_status === "outgoing" && (
                      <button
                        type="button"
                        className="wy-connection-secondary"
                        onClick={() => void handleConnectionAction("cancel")}
                        disabled={actionLoading}
                      >
                        <Clock3 size={17} /> Request sent · Cancel
                      </button>
                    )}

                    {profile.connection_status === "incoming" && (
                      <>
                        <button
                          type="button"
                          className="wy-profile-save"
                          onClick={() => void handleConnectionAction("accept")}
                          disabled={actionLoading}
                        >
                          <UserCheck size={17} /> Accept connection
                        </button>
                        <button
                          type="button"
                          className="wy-connection-secondary"
                          onClick={() => void handleConnectionAction("decline")}
                          disabled={actionLoading}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {profile.connection_status === "accepted" && (
                      <>
                        <span className="wy-connected-label">
                          <UserCheck size={16} /> Connected
                        </span>
                        <button
                          type="button"
                          className="wy-connection-secondary"
                          onClick={() => void handleConnectionAction("remove")}
                          disabled={actionLoading}
                        >
                          Remove connection
                        </button>
                      </>
                    )}
                  </div>
                )}

                {isSelf && (
                  <Link href="/profile/" className="wy-profile-save">
                    Edit profile
                  </Link>
                )}

                {!isSelf && (
                  <button
                    type="button"
                    className="wy-connection-secondary"
                    onClick={() => void reportProfile()}
                    disabled={reportSubmitting}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      marginTop: "12px",
                    }}
                  >
                    <Flag size={16} />
                    {reportSubmitting ? "Reporting..." : "Report profile"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <ProfileReviews profileId={profile.user_id} />

          {profile.about && (
            <section className="wy-public-section">
              <h2>About</h2>
              <p className="wy-public-long-text">{profile.about}</p>
            </section>
          )}

          {profile.experience && (
            <section className="wy-public-section">
              <h2><BriefcaseBusiness size={19} /> Experience</h2>
              <p className="wy-public-long-text">{profile.experience}</p>
            </section>
          )}

          {profile.education && (
            <section className="wy-public-section">
              <h2><GraduationCap size={20} /> Education</h2>
              <p className="wy-public-long-text">{profile.education}</p>
            </section>
          )}

          {profile.skills && (
            <section className="wy-public-section">
              <h2><Wrench size={19} /> Skills</h2>
              <div className="wy-public-tags">
                {profile.skills
                  .split(/[,;\n]+/)
                  .map((skill) => skill.trim())
                  .filter(Boolean)
                  .map((skill, index) => (
                    <span key={`${skill}-${index}`}>{skill}</span>
                  ))}
              </div>
            </section>
          )}

          {profile.certifications && (
            <section className="wy-public-section">
              <h2><Award size={19} /> Certifications and training</h2>
              <p className="wy-public-long-text">{profile.certifications}</p>
            </section>
          )}

          {profile.languages && (
            <section className="wy-public-section">
              <h2><Languages size={19} /> Languages</h2>
              <p className="wy-public-long-text">{profile.languages}</p>
            </section>
          )}

          {posts.length > 0 && (
            <section className="wy-public-section">
              <h2>Recent community posts</h2>
              <div className="wy-public-posts">
                {posts.map((post) => (
                  <article key={post.id} className="wy-public-post">
                    <div className="wy-public-post-meta">
                      {post.post_type.replaceAll("_", " ")}
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <p>{post.content}</p>
                    <Link href={`/?post=${post.id}#post-${post.id}`}>
                      View in home feed
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>

        <aside className="wy-public-profile-aside">
          <div className="wy-public-section">
            <h2>Contact</h2>
            {profile.phone ? (
              <p>{profile.phone}</p>
            ) : (
              <p className="wy-public-muted">
                This member has not made their phone number visible to you.
              </p>
            )}
            <Link href="/messages/" className="wy-public-message-link">
              <MessageCircle size={16} /> Open messages
            </Link>
          </div>

          <div className="wy-public-section">
            <h2>WORKYARD trust</h2>
            <p>
              {profile.verification_status === "approved"
                ? "This member's identity has been verified."
                : profile.verification_status === "pending"
                  ? "This member's verification is under review."
                  : profile.verification_status
                    ? "This member has not completed identity verification."
                    : "Verification information is not publicly available."}
            </p>
          </div>

          <div className="wy-public-section">
            <h2>Privacy</h2>
            <p className="wy-public-muted">
              This profile displays only the information its owner has
              permitted you to see.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
