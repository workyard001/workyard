"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password/`,
      }
    );

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "If an account exists for that email, a password reset link has been sent. Please check your inbox and spam folder."
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-top">
        <Link href="/" className="brand">
          <span className="brand-mark">W</span>
          <span>WORK<span>YARD</span></span>
        </Link>
        <Link className="auth-link" href="/login/">Log in</Link>
      </div>

      <section className="auth-card auth-card-small">
        <div className="eyebrow">
          <span className="pulse" /> ACCOUNT RECOVERY
        </div>

        <h1>Forgot your password?</h1>
        <p className="auth-intro">
          Enter the email address connected to your WORKYARD account.
          We'll send you a link to choose a new password.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          {message && (
            <p className="auth-message" role="status">{message}</p>
          )}

          <button className="btn auth-submit" type="submit" disabled={loading}>
            {loading ? "Sending link..." : "Send password reset link"}
          </button>

          <p className="auth-terms">
            <Link className="auth-link" href="/login/">Back to login</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
