"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <div className="auth-top">
        <Link href="/" className="brand">
          <span className="brand-mark">W</span>
          <span>WORK<span>YARD</span></span>
        </Link>
        <span>New to WORKYARD? <Link className="auth-link" href="/signup/">Sign up</Link></span>
      </div>

      <section className="auth-card auth-card-small">
        <div className="eyebrow"><span className="pulse" /> WELCOME BACK</div>
        <h1>Log in to WORKYARD</h1>
        <p className="auth-intro">Continue building trust and finding opportunities in your community.</p>

        <form onSubmit={handleLogin} className="auth-form">
          <label>Email address
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label>Password
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-8px" }}>
            <Link className="auth-link" href="/forgot-password/">
              Forgot password?
            </Link>
          </div>

          {message && <p className="auth-message" role="status">{message}</p>}

          <button className="btn auth-submit" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
          <p className="auth-terms">Don't have an account? <Link className="auth-link" href="/signup/">Create one</Link></p>
        </form>
      </section>
    </main>
  );
}
