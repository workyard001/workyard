"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload } from "lucide-react";

export default function NewServicePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priceType, setPriceType] = useState("negotiable");
  const [priceAmount, setPriceAmount] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login/");
        return;
      }

      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", data.user.id)
        .single();

      if (profile?.account_type !== "skill_owner") {
        setNotice("Switch to Skill Owner mode before creating a service listing.");
      }
    }

    void check();
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId || saving) return;

    if (
      (priceType === "fixed" || priceType === "hourly") &&
      (!priceAmount || Number(priceAmount) < 0)
    ) {
      setNotice("Enter a valid price amount.");
      return;
    }

    setSaving(true);
    setNotice("");

    let photoPath: string | null = null;

    if (photo) {
      if (photo.size > 5 * 1024 * 1024) {
        setNotice("Photo must not exceed 5MB.");
        setSaving(false);
        return;
      }

      const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      photoPath = `${userId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("service-photos")
        .upload(photoPath, photo, {
          upsert: false,
          contentType: photo.type,
        });

      if (uploadError) {
        setNotice(`Photo upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase.from("services").insert({
      owner_id: userId,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      price_type: priceType,
      price_amount: priceType === "negotiable" ? null : Number(priceAmount),
      currency: "NGN",
      cover_image_path: photoPath,
      status: "published",
    });

    setSaving(false);

    if (error) {
      setNotice(`Could not create service: ${error.message}`);
      return;
    }

    router.push("/services/");
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: 720 }}>
        <Link href="/services/" className="profile-back">
          <ArrowLeft size={16} /> Back to my services
        </Link>

        <h1 style={{ marginTop: 22 }}>List a Service</h1>

        <p style={{ color: "#64748b" }}>
          Help people in your community discover the skill you offer.
        </p>

        {notice && <p className="auth-message" role="status">{notice}</p>}

        <form onSubmit={submit} style={{ display: "grid", gap: 15, marginTop: 22 }}>
          <label>
            Service title
            <input
              className="auth-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={3}
              maxLength={100}
              required
              placeholder="e.g. Professional plumbing repairs"
            />
          </label>

          <label>
            Category
            <select
              className="auth-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Choose a category</option>
              {[
                "Plumbing",
                "Electrical",
                "Carpentry",
                "Painting",
                "Cleaning",
                "Fashion & Tailoring",
                "Beauty & Wellness",
                "Catering",
                "Mechanic",
                "Welding",
                "Building & Construction",
                "Other",
              ].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Description
            <textarea
              className="auth-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              maxLength={3000}
              rows={5}
              required
              placeholder="Describe your experience, what you do, and what customers should expect."
            />
          </label>

          <label>
            Community / location
            <input
              className="auth-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g. Akungba-Akoko"
            />
          </label>

          <label>
            Pricing type
            <select
              className="auth-input"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
            >
              <option value="negotiable">Negotiable</option>
              <option value="fixed">Fixed price</option>
              <option value="hourly">Hourly rate</option>
            </select>
          </label>

          {priceType !== "negotiable" && (
            <label>
              Amount (NGN)
              <input
                className="auth-input"
                type="number"
                min="0"
                step="0.01"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                required
                placeholder="e.g. 15000"
              />
            </label>
          )}

          <label>
            Cover photo (optional, max 5MB)
            <input
              className="auth-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPhoto(e.target.files?.[0] || null)
              }
            />
          </label>

          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            <Upload size={14} style={{ verticalAlign: "middle" }} />
            Your listing will be published immediately.
          </p>

          <button className="btn" type="submit" disabled={saving || !userId}>
            {saving ? "Publishing..." : "Publish service"}
          </button>
        </form>
      </div>
    </main>
  );
}
