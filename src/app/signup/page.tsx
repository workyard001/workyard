"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AccountType = "skill_owner" | "job_seeker" | "client" | "recruiter";

export default function SignupPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("skill_owner");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [workInterest, setWorkInterest] = useState("");
  const [hiringNeed, setHiringNeed] = useState("");
  const [organization, setOrganization] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const details = {
      full_name: fullName,
      account_type: accountType,
      phone,
      location,
      skill: accountType === "skill_owner" ? skill : undefined,
      experience: accountType === "skill_owner" || accountType === "job_seeker" ? experience : undefined,
      work_interest: accountType === "job_seeker" ? workInterest : undefined,
      hiring_need: accountType === "client" ? hiringNeed : undefined,
      organization: accountType === "recruiter" ? organization : undefined,
      recruiting_reason: accountType === "recruiter" ? reason : undefined,
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: details },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard/");
      router.refresh();
    } else {
      setMessage("Account created. Check your email for the confirmation link before logging in.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-top">
        <Link href="/" className="brand">
          <span className="brand-mark">W</span>
          <span>WORK<span>YARD</span></span>
        </Link>
        <span>Already a member? <Link className="auth-link" href="/login/">Log in</Link></span>
      </div>

      <section className="auth-card">
        <div className="eyebrow"><span className="pulse" /> JOIN YOUR COMMUNITY</div>
        <h1>Create your WORKYARD account</h1>
        <p className="auth-intro">Choose the account that matches what you want to do.</p>

        <form onSubmit={handleSignup} className="auth-form">
          <label>I'm joining as
            <select value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)}>
              <option value="skill_owner">Skill owner — I offer services</option>
              <option value="job_seeker">Job seeker — I’m looking for work</option>
              <option value="client">Client — I want to hire</option>
              <option value="recruiter">Recruiter — I hire for an organization</option>
            </select>
          </label>

          <div className="auth-two">
            <label>Full name
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            </label>
            <label>Phone number
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+234..." />
            </label>
          </div>

          <label>Email address
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>

          <label>Community / LGA / State
            <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Akungba, Ondo State" />
          </label>

          {accountType === "skill_owner" && <>
            <label>Your skill or service
              <input required value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="e.g. Plumbing, tailoring, electrical work" />
            </label>
            <label>Experience
              <textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Describe your experience (optional)" rows={3} />
            </label>
          </>}

          {accountType === "job_seeker" && <>
            <label>What kind of work are you looking for?
              <input required value={workInterest} onChange={(e) => setWorkInterest(e.target.value)} placeholder="e.g. Shop assistant, driver, office work" />
            </label>
            <label>Experience / qualifications
              <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={3} placeholder="Share relevant experience (optional)" />
            </label>
          </>}

          {accountType === "client" && <label>What do you need help with?
            <textarea required value={hiringNeed} onChange={(e) => setHiringNeed(e.target.value)} rows={3} placeholder="Describe the kind of worker or service you need" />
          </label>}

          {accountType === "recruiter" && <>
            <label>Organization / business name
              <input required value={organization} onChange={(e) => setOrganization(e.target.value)} />
            </label>
            <label>Why are you creating a recruiter account?
              <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Describe your hiring needs and who you recruit for" />
            </label>
          </>}

          <label>Password
            <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <small>Use at least 8 characters.</small>
          </label>

          {message && <p className="auth-message" role="status">{message}</p>}

          <button className="btn auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
          <p className="auth-terms">By creating an account, you agree to use WORKYARD respectfully and honestly.</p>
        </form>
      </section>
    </main>
  );
}
