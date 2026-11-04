
"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      const user = authData.user;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, location, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      setFullName(profile?.full_name || user.user_metadata?.full_name || "");
      setPhone(profile?.phone || user.user_metadata?.phone || "");
      setLocation(profile?.location || user.user_metadata?.location || "");
      setAvatarUrl(profile?.avatar_url || "");

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 5 MB.");
      return;
    }

    setPhoto(selected);
    setAvatarUrl(URL.createObjectURL(selected));
    setMessage("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    let finalAvatarUrl = avatarUrl;

    if (photo) {
      const fileExt = photo.name.split(".").pop() || "jpg";
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, photo, { upsert: true });

      if (uploadError) {
        setMessage(`Photo upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      finalAvatarUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim(),
      phone: phone.trim(),
      location: location.trim(),
      avatar_url: finalAvatarUrl || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(`Could not save profile: ${error.message}`);
      setSaving(false);
      return;
    }

    await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), phone: phone.trim(), location: location.trim() },
    });

    setAvatarUrl(finalAvatarUrl);
    setPhoto(null);
    setMessage("Profile saved successfully!");
    setSaving(false);
  }

  if (loading) return <main className="dashboard-loading">Loading your profile...</main>;

  return (
    <main className="profile-page">
      <div className="profile-card">
        <a href="/dashboard/" className="profile-back">← Back to dashboard</a>
        <h1>Edit your profile</h1>
        <p>Keep your WORKYARD details up to date.</p>

        <form onSubmit={handleSave} className="profile-form">
          <div className="profile-photo-section">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile preview" className="profile-photo-preview" />
            ) : (
              <div className="profile-photo-placeholder">Add photo</div>
            )}

            <label className="profile-upload-label">
              Choose profile photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
            <small>Use a clear photo of yourself. Maximum size: 5 MB.</small>
          </div>

          <label>
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>

          <label>
            Phone number
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>

          <label>
            Location (community / LGA)
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Akungba-Akoko" />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>

          {message && <p className="profile-message">{message}</p>}
        </form>
      </div>
    </main>
  );
}

