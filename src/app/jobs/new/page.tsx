"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NigeriaLocationFields, {
  isValidNigeriaLocation,
} from "@/components/NigeriaLocationFields";

export default function NewJobPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [community, setCommunity] = useState("");
  const [lga, setLga] = useState("");
  const [stateName, setStateName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login/");
        return;
      }

      setUserId(data.user.id);
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (!isValidNigeriaLocation(stateName, lga)) {
      setMessage("Please select a valid Nigerian state and an LGA within that state.");
      setSaving(false);
      return;
    }

    if (!community.trim()) {
      setMessage("Please enter your community or nearest landmark.");
      setSaving(false);
      return;
    }

    const formattedLocation = [community, lga, stateName]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(", ");

    const { error } = await supabase.from("jobs").insert({
      owner_id: userId,
      title: title.trim(),
      description: description.trim(),
      community: community.trim(),
      lga: lga.trim(),
      state: stateName.trim(),
      location: formattedLocation,
      status: "open",
    });

    if (error) {
      setMessage(`Could not post job: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Your job has been posted successfully!");
    setTitle("");
    setDescription("");
    setCommunity("");
    setLga("");
    setStateName("");
    setSaving(false);
  }

  if (loading) {
    return <main className="dashboard-loading">Loading...</main>;
  }

  return (
    <main className="profile-page">
      <div className="profile-card">
        <a href="/" className="profile-back">
          ← Back to Home
        </a>

        <h1>Post a Job</h1>
        <p>Tell your community what work you need done.</p>

        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            Job title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Plumber needed"
              required
            />
          </label>

          <label>
            Job description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the work you need done"
              required
              rows={5}
            />
          </label>

          <NigeriaLocationFields
            stateValue={stateName}
            lgaValue={lga}
            communityValue={community}
            onStateChange={setStateName}
            onLgaChange={setLga}
            onCommunityChange={setCommunity}
            required
          />

          <button type="submit" disabled={saving}>
            {saving ? "Posting..." : "Post Job"}
          </button>

          {message && <p className="profile-message">{message}</p>}
        </form>
      </div>
    </main>
  );
}