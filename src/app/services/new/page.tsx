"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NigeriaLocationFields, {
  isValidNigeriaLocation,
} from "@/components/NigeriaLocationFields";
import { ArrowLeft, Upload, MapPin } from "lucide-react";

type RegisteredLocation = {
  community: string | null;
  lga: string | null;
  state: string | null;
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLocaleLowerCase("en-NG");
}

export default function NewServicePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [registeredLocation, setRegisteredLocation] =
    useState<RegisteredLocation | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [community, setCommunity] = useState("");
  const [lga, setLga] = useState("");
  const [stateName, setStateName] = useState("");
  const [priceType, setPriceType] = useState("negotiable");
  const [priceAmount, setPriceAmount] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function check() {
      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth.user) {
        router.replace("/login/");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type, community, lga, state")
        .eq("id", auth.user.id)
        .single();

      if (!active) return;
      setUserId(auth.user.id);

      if (profileError || !profile) {
        setNotice("Your WORKYARD profile could not be loaded. Please try again.");
      } else if (profile.account_type !== "skill_owner") {
        setNotice("Switch to Skill Owner mode before creating a service listing.");
      } else {
        const savedLocation = {
          community: profile.community || "",
          lga: profile.lga || "",
          state: profile.state || "",
        };

        setRegisteredLocation(savedLocation);
        setCommunity(savedLocation.community);
        setLga(savedLocation.lga);
        setStateName(savedLocation.state);
        setCanManage(true);

        if (!savedLocation.lga || !savedLocation.state) {
          setNotice(
            "Complete your State and LGA in your profile before publishing a local service."
          );
          setCanManage(false);
        }
      }

      setLoading(false);
    }

    void check();

    return () => {
      active = false;
    };
  }, [router]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null;
    setPhoto(selected);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId || !canManage || saving || !registeredLocation) return;

    if (!isValidNigeriaLocation(stateName, lga)) {
      setNotice("Please select a valid Nigerian state and an LGA within that state.");
      return;
    }

    // Service visibility is determined from the provider's registered profile
    // location. Do not let a listing advertise a different LGA or state.
    if (
      normalize(stateName) !== normalize(registeredLocation.state) ||
      normalize(lga) !== normalize(registeredLocation.lga)
    ) {
      setNotice(
        "Your service location must match your registered profile State and LGA. Update your profile first if you have moved."
      );
      return;
    }

    if (!community.trim()) {
      setNotice("Enter your community or nearest landmark.");
      return;
    }

    if (
      (priceType === "fixed" || priceType === "hourly") &&
      (!priceAmount || !Number.isFinite(Number(priceAmount)) || Number(priceAmount) <= 0)
    ) {
      setNotice("Enter a price greater than zero.");
      return;
    }

    if (photo) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(photo.type)) {
        setNotice("Please upload a JPG, PNG or WebP image.");
        return;
      }
      if (photo.size > 5 * 1024 * 1024) {
        setNotice("Photo must not exceed 5MB.");
        return;
      }
    }

    setSaving(true);
    setNotice("");

    let photoPath: string | null = null;

    try {
      if (photo) {
        const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        photoPath = `${userId}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("service-photos")
          .upload(photoPath, photo, {
            upsert: false,
            contentType: photo.type,
          });

        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);
      }

      const formattedLocation = [community.trim(), lga.trim(), stateName.trim()]
        .filter(Boolean)
        .join(", ");

      const { error: insertError } = await supabase.from("services").insert({
        owner_id: userId,
        title: title.trim(),
        category,
        description: description.trim(),
        location: formattedLocation,
        price_type: priceType,
        price_amount: priceType === "negotiable" ? null : Number(priceAmount),
        currency: "NGN",
        cover_image_path: photoPath,
        status: "published",
      });

      if (insertError) throw new Error(`Could not create service: ${insertError.message}`);

      router.push("/services/");
    } catch (error) {
      if (photoPath) {
        await supabase.storage.from("service-photos").remove([photoPath]);
      }

      setNotice(
        error instanceof Error ? error.message : "Could not publish this service."
      );
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="dashboard-loading">Preparing your service listing...</main>;
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

        {!canManage && (
          <Link href="/profile/" className="btn" style={{ display: "inline-flex", marginTop: 8 }}>
            Update my profile location
          </Link>
        )}

        <form onSubmit={submit} style={{ display: "grid", gap: 15, marginTop: 22 }}>
          <label>
            Service title
            <input
              className="auth-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
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
              onChange={(event) => setCategory(event.target.value)}
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
              onChange={(event) => setDescription(event.target.value)}
              minLength={10}
              maxLength={3000}
              rows={5}
              required
              placeholder="Describe your experience, what you do, and what customers should expect."
            />
          </label>

          <section style={{
            border: "1px solid #dce8df",
            borderRadius: 12,
            padding: 14,
            display: "grid",
            gap: 10,
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#0B7A42" }}>
              <MapPin size={17} />
              <strong>Service location</strong>
            </div>
            <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
              Your State and LGA must match your registered WORKYARD profile so customers nearby can find you.
            </p>
            <NigeriaLocationFields
              stateValue={stateName}
              lgaValue={lga}
              communityValue={community}
              onStateChange={setStateName}
              onLgaChange={setLga}
              onCommunityChange={setCommunity}
              required
            />
            {registeredLocation && (
              <small style={{ color: "#64748b" }}>
                Registered area: {[registeredLocation.community, registeredLocation.lga, registeredLocation.state]
                  .filter(Boolean)
                  .join(", ")}
              </small>
            )}
          </section>

          <label>
            Pricing type
            <select
              className="auth-input"
              value={priceType}
              onChange={(event) => setPriceType(event.target.value)}
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
                min="0.01"
                step="0.01"
                value={priceAmount}
                onChange={(event) => setPriceAmount(event.target.value)}
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
              onChange={handlePhotoChange}
            />
          </label>

          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            <Upload size={14} style={{ verticalAlign: "middle" }} /> Your listing will be published immediately.
          </p>

          <button className="btn" type="submit" disabled={saving || !userId || !canManage}>
            {saving ? "Publishing..." : "Publish service"}
          </button>
        </form>
      </div>
    </main>
  );
}
