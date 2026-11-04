
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
} from "lucide-react";

type AccountType = "skill_owner" | "job_seeker" | "client" | "recruiter";

const dashboardContent: Record<
  AccountType,
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
    description: "Showcase your skills and connect with people who need your services.",
    actions: [
      { label: "My Services", detail: "Manage the services you offer.", icon: Wrench, href: "/services/" },
      { label: "Job Requests", detail: "Review requests from your community.", icon: ClipboardList, href: "/requests/" },
      { label: "Messages", detail: "Chat with clients.", icon: MessageCircle, href: "/messages/" },
      { label: "Verify My Identity", detail: "Submit an official ID for review.", icon: ShieldCheck, href: "/verification/" },
    ],
  },
  job_seeker: {
    title: "Your Job Seeker Dashboard",
    description: "Find local opportunities and keep track of your applications.",
    actions: [
      { label: "Find Work", detail: "Explore jobs in your area.", icon: Search, href: "/jobs/" },
      { label: "My Applications", detail: "Track the jobs you applied for.", icon: ClipboardList, href: "/applications/" },
      { label: "Messages", detail: "Chat with employers.", icon: MessageCircle, href: "/messages/" },
      { label: "Verify My Identity", detail: "Submit an official ID for review.", icon: ShieldCheck, href: "/verification/" },
    ],
  },
  client: {
    title: "Your Client Dashboard",
    description: "Post a job and find trusted workers in your community.",
    actions: [
      { label: "Post a Job", detail: "Tell your community what work you need done.", icon: BriefcaseBusiness, href: "/jobs/new/" },
      { label: "Find Workers", detail: "Discover workers near you.", icon: Search, href: "/workers/" },
      { label: "Manage Job Posts", detail: "Review and manage your listings.", icon: ClipboardList, href: "/my-jobs/" },
      { label: "Messages", detail: "Chat with workers and applicants.", icon: MessageCircle, href: "/messages/" },
    ],
  },
  recruiter: {
    title: "Your Recruiter Dashboard",
    description: "Manage opportunities and connect with suitable candidates.",
    actions: [
      { label: "Post an Opportunity", detail: "Create a job listing.", icon: BriefcaseBusiness, href: "/jobs/new/" },
      { label: "Manage Listings", detail: "Review your published opportunities.", icon: ClipboardList, href: "/my-jobs/" },
      { label: "Find Candidates", detail: "Explore local job seekers.", icon: Search, href: "/candidates/" },
      { label: "Messages", detail: "Chat with candidates.", icon: MessageCircle, href: "/messages/" },
    ],
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("Member");
  const [accountType, setAccountType] = useState<AccountType>("job_seeker");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState("unverified");

  useEffect(() => {
    async function loadDashboard() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login/");
        return;
      }

      const user = data.user;
      const metadata = user.user_metadata;

      // Use metadata as a fallback if the profile row is not available.
      setFullName(metadata?.full_name || "Member");

      const metadataType = metadata?.account_type as AccountType | undefined;
      if (metadataType && metadataType in dashboardContent) {
        setAccountType(metadataType);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, account_type, avatar_url, verification_status")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.full_name) setFullName(profile.full_name);

        if (profile.account_type in dashboardContent) {
          setAccountType(profile.account_type as AccountType);
        }

        setAvatarUrl(profile.avatar_url);
        setVerificationStatus(profile.verification_status || "unverified");
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login/");
    router.refresh();
  }

  if (loading) {
    return <main className="dashboard-loading">Loading your WORKYARD dashboard...</main>;
  }

  const content = dashboardContent[accountType];

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
          <a href="/profile/" className="profile-edit-link">Edit profile</a>
          <p>{content.description}</p>
          <p className="dashboard-verification">
            {verificationStatus === "approved"
              ? "✓ Identity verified"
              : verificationStatus === "pending"
                ? "Identity verification pending"
                : "Identity not yet verified"}
          </p>
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
              <a className="dashboard-action-card" href={action.href} key={action.label}>
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
