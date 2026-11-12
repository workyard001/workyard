"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  BriefcaseBusiness,
  ClipboardList,
  MessageCircle,
  ShieldCheck,
  UserRound,
  Wrench,
  Search,
  LogOut,
  Bell,
  LockKeyhole,
  Flag,
  PlusCircle,
  Home,
  Wallet,
} from "lucide-react";

type DashboardAccountType = "skill_owner" | "job_seeker" | "hirer";

function normalizeAccountType(value: unknown): DashboardAccountType | null {
  if (value === "skill_owner" || value === "job_seeker" || value === "hirer") {
    return value;
  }

  if (value === "client" || value === "recruiter") {
    return "hirer";
  }

  return null;
}

const dashboardContent: Record<
  DashboardAccountType,
  {
    title: string;
    description: string;
    actions: {
      label: string;
      detail: string;
      icon: typeof BriefcaseBusiness;
      href: string;
    }[];
  }
> = {
  skill_owner: {
    title: "Your Skill Owner Dashboard",
    description:
      "Showcase your skills and connect with people who need your services.",
    actions: [
      {
        label: "My Services",
        detail: "Manage the services you offer.",
        icon: Wrench,
        href: "/services/",
      },
      {
        label: "Create a Service",
        detail: "Publish a new service for your community.",
        icon: PlusCircle,
        href: "/services/new/",
      },
      {
        label: "Find Work",
        detail: "Explore job opportunities in your area.",
        icon: Search,
        href: "/jobs/",
      },
      {
        label: "Messages",
        detail: "Chat with clients.",
        icon: MessageCircle,
        href: "/messages/",
      },
      {
        label: "Notifications",
        detail: "See updates about your jobs, applications and messages.",
        icon: Bell,
        href: "/notifications/",
      },
      {
        label: "Payment History",
        detail: "View your WORKYARD payment records.",
        icon: Wallet,
        href: "/payments/",
      },
    ],
  },
  job_seeker: {
    title: "Your Job Seeker Dashboard",
    description:
      "Find local opportunities and keep track of your applications.",
    actions: [
      {
        label: "Find Work",
        detail: "Explore jobs in your area.",
        icon: Search,
        href: "/jobs/",
      },
      {
        label: "My Applications",
        detail: "Track the jobs you applied for.",
        icon: ClipboardList,
        href: "/applications/",
      },
      {
        label: "Messages",
        detail: "Chat with employers.",
        icon: MessageCircle,
        href: "/messages/",
      },
      {
        label: "Notifications",
        detail: "See updates about your jobs, applications and messages.",
        icon: Bell,
        href: "/notifications/",
      },
      {
        label: "Payment History",
        detail: "View your WORKYARD payment records.",
        icon: Wallet,
        href: "/payments/",
      },
    ],
  },
  hirer: {
    title: "Your HIRER Dashboard",
    description:
      "Hire trusted service providers and recruit staff through one WORKYARD account.",
    actions: [
      {
        label: "Find a Worker",
        detail: "Discover skilled service providers in your community.",
        icon: Search,
        href: "/workers/",
      },
      {
        label: "Post a Job or Staff Opportunity",
        detail: "Create a local service request or a staff vacancy.",
        icon: BriefcaseBusiness,
        href: "/jobs/new/",
      },
      {
        label: "Manage Job Posts",
        detail: "Review and manage your jobs and opportunities.",
        icon: ClipboardList,
        href: "/my-jobs/",
      },
      {
        label: "Messages",
        detail: "Chat with workers and applicants.",
        icon: MessageCircle,
        href: "/messages/",
      },
      {
        label: "Notifications",
        detail: "See updates about your jobs, applications and messages.",
        icon: Bell,
        href: "/notifications/",
      },
      {
        label: "Payment History",
        detail: "View your WORKYARD payment records.",
        icon: Wallet,
        href: "/payments/",
      },
    ],
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("Member");
  const [accountType, setAccountType] =
    useState<DashboardAccountType>("job_seeker");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState("unverified");
  const [isVerificationAdmin, setIsVerificationAdmin] = useState(false);
  const [isModerationAdmin, setIsModerationAdmin] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login/");
        return;
      }

      const user = data.user;
      const metadata = user.user_metadata;

      setFullName(metadata?.full_name || "Member");

      const metadataType = normalizeAccountType(metadata?.account_type);
      if (metadataType) {
        setAccountType(metadataType);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, account_type, avatar_path, verification_status")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.full_name) setFullName(profile.full_name);

        const profileType = normalizeAccountType(profile.account_type);
        if (profileType) {
          setAccountType(profileType);
        }

        if (profile.avatar_path) {
          const { data: photo } = await supabase.storage
            .from("profile-photos")
            .createSignedUrl(profile.avatar_path, 3600);

          setAvatarUrl(photo?.signedUrl || null);
        } else {
          setAvatarUrl(null);
        }
        setVerificationStatus(profile.verification_status || "unverified");
      }

      const { data: adminResult, error: adminError } =
        await supabase.rpc("is_verification_admin");

      setIsVerificationAdmin(!adminError && adminResult === true);

      const { data: moderationResult, error: moderationError } =
        await supabase.rpc("is_moderation_admin");

      setIsModerationAdmin(!moderationError && moderationResult === true);
      setLoading(false);
    }

    void loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        Loading your WORKYARD dashboard...
      </main>
    );
  }

  const content = dashboardContent[accountType];

  const verificationMessage =
    verificationStatus === "approved"
      ? "✓ Identity verified"
      : verificationStatus === "pending"
        ? "Your identity verification is under review. We will update you when the review is complete."
        : verificationStatus === "rejected"
          ? "Your previous verification was not approved. You can submit a new application."
          : "Identity not yet verified. Submit your details for review.";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/">
          <span className="dashboard-brand-mark">W</span>
          WORKYARD
        </a>

        <button className="dashboard-logout" onClick={handleLogout}>
          <LogOut size={17} />
          Log out
        </button>
      </header>

      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">YOUR WORKYARD</p>
          <h1>Welcome, {fullName}!</h1>
          <a href="/profile/" className="profile-edit-link">
            Edit profile
          </a>
          <p>{content.description}</p>

          <p className="dashboard-verification">{verificationMessage}</p>

          <a
            href="/"
            aria-label="Go to WORKYARD Home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginTop: "14px",
              padding: "13px 20px",
              borderRadius: "10px",
              background: "#0B7A42",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "15px",
              boxShadow: "0 3px 10px rgba(11, 122, 66, 0.18)",
            }}
          >
            <Home size={19} />
            GO TO HOME
          </a>


          {(verificationStatus === "unverified" ||
            verificationStatus === "rejected") && (
            <a
              href="/verification/"
              className="dashboard-verification-link"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#0B7A42",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={18} />
              {verificationStatus === "rejected"
                ? "Submit Verification Again"
                : "Get Verified"}
            </a>
          )}

          {isVerificationAdmin && (
            <div style={{ marginTop: "14px" }}>
              <a
                href="/admin/verification/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 12px",
                  border: "1px solid #0B7A42",
                  borderRadius: "8px",
                  color: "#0B7A42",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <LockKeyhole size={16} />
                Administrator review
              </a>
            </div>
          )}

          {isModerationAdmin && (
            <div style={{ marginTop: "8px" }}>
              <a
                href="/admin/moderation/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 12px",
                  border: "1px solid #0B7A42",
                  borderRadius: "8px",
                  color: "#0B7A42",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <Flag size={16} />
                Moderation review
              </a>
            </div>
          )}
        </div>

        <div className="dashboard-profile-icon">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${fullName}'s profile`}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <UserRound size={30} />
          )}
        </div>
      </section>

      <section className="dashboard-actions">
        <h2>{content.title}</h2>
        <div className="dashboard-grid">
          {content.actions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                className="dashboard-action-card"
                href={action.href}
                key={action.label}
              >
                <span className="dashboard-action-icon">
                  <Icon size={23} />
                </span>
                <span className="dashboard-action-copy">
                  <strong>{action.label}</strong>
                  <span>{action.detail}</span>
                </span>
                <span className="dashboard-action-arrow">→</span>
              </a>
            );
          })}
        </div>
      </section>

      <footer className="dashboard-footer">
        From finding work to finding everything in your yard.
      </footer>
    </main>
  );
}
