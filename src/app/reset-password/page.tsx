"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && event === "PASSWORD_RECOVERY" && session) {
        setRecoveryReady(true);
        setChecking(false);
        setMessage("");
      }
    });

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        setRecoveryReady(true);
      } else {
        setMessage(
          error?.message ||
          "This reset link is invalid or expired. Please request a new one."
        );
      }

      setChecking(false);
    }

    void checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Your password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCompleted(true);
    await supabase.auth.signOut();
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
          <span className="pulse" /> SECURE YOUR ACCOUNT
        </div>

        {checking ? (
          <>
            <h1>Checking your link...</h1>
            <p className="auth-intro">Please wait while we verify your link.</p>
          </>
        ) : completed ? (
          <>
            <h1>Password updated!</h1>
            <p className="auth-intro">
              Your WORKYARD password has been changed successfully.
              You can now log in with your new password.
            </p>
            <Link className="btn auth-submit" href="/login/">
              Go to login
            </Link>
          </>
        ) : !recoveryReady ? (
          <>
            <h1>Reset link unavailable</h1>
            <p className="auth-message" role="status">{message}</p>
            <p className="auth-terms" style={{ marginTop: "20px" }}>
              <Link className="auth-link" href="/forgot-password/">
                Request a new reset link
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1>Choose a new password</h1>
            <p className="auth-intro">
              Create a new password for your WORKYARD account.
              Use at least 8 characters.
            </p>

            <form onSubmit={handleUpdatePassword} className="auth-form">
              <label>
                New password
                <input
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>

              <label>
                Confirm new password
                <input
                  required
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>

              {message && (
                <p className="auth-message" role="status">{message}</p>
              )}

              <button className="btn auth-submit" type="submit" disabled={loading}>
                {loading ? "Updating password..." : "Save new password"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
