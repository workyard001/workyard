
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Save,
  UserRound,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import NigeriaLocationFields from "@/components/NigeriaLocationFields";

type AccountMode = "skill_owner" | "job_seeker" | "hirer" | "unknown";
type Visibility = "public" | "connections" | "selected" | "private";

type ProfileDetails = {
  headline: string;
  about: string;
  education: string;
  experience: string;
  skills: string;
  certifications: string;
  languages: string;
  name_visibility: Visibility;
  avatar_visibility: Visibility;
  account_type_visibility: Visibility;
  verification_visibility: Visibility;
  headline_visibility: Visibility;
  about_visibility: Visibility;
  education_visibility: Visibility;
  experience_visibility: Visibility;
  skills_visibility: Visibility;
  certifications_visibility: Visibility;
  languages_visibility: Visibility;
  phone_visibility: Visibility;
  location_visibility: Visibility;
};

const DEFAULT_DETAILS: ProfileDetails = {
  headline: "",
  about: "",
  education: "",
  experience: "",
  skills: "",
  certifications: "",
  languages: "",
  name_visibility: "public",
  avatar_visibility: "public",
  account_type_visibility: "public",
  verification_visibility: "public",
  headline_visibility: "public",
  about_visibility: "public",
  education_visibility: "public",
  experience_visibility: "public",
  skills_visibility: "public",
  certifications_visibility: "public",
  languages_visibility: "public",
  phone_visibility: "private",
  location_visibility: "public",
};

function normalizeAccountMode(value: unknown): AccountMode {
  if (
    value === "skill_owner" ||
    value === "job_seeker" ||
    value === "hirer"
  ) {
    return value;
  }

  if (value === "client" || value === "recruiter") return "hirer";
  return "unknown";
}

function PrivacySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Visibility;
  onChange: (value: Visibility) => void;
}) {
  return (
    <label className="wy-privacy-control">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Visibility)}
      >
        <option value="public">Public to members</option>
        <option value="connections">Connections only</option>
        <option value="selected">Selected people</option>
        <option value="private">Only me</option>
      </select>
    </label>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [community, setCommunity] = useState("");
  const [lga, setLga] = useState("");
  const [stateName, setStateName] = useState("");
  const [avatarPath, setAvatarPath] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [accountMode, setAccountMode] = useState<AccountMode>("unknown");
  const [details, setDetails] =
    useState<ProfileDetails>(DEFAULT_DETAILS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">(
    "success"
  );

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.replace("/login/");
          return;
        }

        const user = authData.user;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(
            "full_name, phone, location, community, lga, state, avatar_url, avatar_path, account_type"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) throw new Error("Your WORKYARD profile was not found.");

        const { data: memberDetails, error: detailsError } = await supabase
          .from("member_profile_details")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (detailsError) throw detailsError;
        if (!active) return;

        setUserId(user.id);
        setFullName(
          profile.full_name || user.user_metadata?.full_name || ""
        );
        setPhone(profile.phone || "");
        setLocation(profile.location || "");
        setCommunity(profile.community || profile.location || "");
        setLga(profile.lga || "");
        setStateName(profile.state || "");
        setAvatarPath(profile.avatar_path || "");
        setAccountMode(
          normalizeAccountMode(
            profile.account_type || user.user_metadata?.account_type
          )
        );

        if (memberDetails) {
          setDetails({
            ...DEFAULT_DETAILS,
            headline: memberDetails.headline || "",
            about: memberDetails.about || "",
            education: memberDetails.education || "",
            experience: memberDetails.experience || "",
            skills: memberDetails.skills || "",
            certifications: memberDetails.certifications || "",
            languages: memberDetails.languages || "",
            name_visibility: memberDetails.name_visibility || "public",
            avatar_visibility: memberDetails.avatar_visibility || "public",
            account_type_visibility:
              memberDetails.account_type_visibility || "public",
            verification_visibility:
              memberDetails.verification_visibility || "public",
            headline_visibility:
              memberDetails.headline_visibility || "public",
            about_visibility: memberDetails.about_visibility || "public",
            education_visibility:
              memberDetails.education_visibility || "public",
            experience_visibility:
              memberDetails.experience_visibility || "public",
            skills_visibility: memberDetails.skills_visibility || "public",
            certifications_visibility:
              memberDetails.certifications_visibility || "public",
            languages_visibility:
              memberDetails.languages_visibility || "public",
            phone_visibility: memberDetails.phone_visibility || "private",
            location_visibility:
              memberDetails.location_visibility || "public",
          });
        }

        // Private bucket: create a temporary authenticated viewing URL.
        if (profile.avatar_path) {
          const { data: signed, error: signedError } =
            await supabase.storage
              .from("profile-photos")
              .createSignedUrl(profile.avatar_path, 3600);

          if (signedError) throw signedError;
          if (active) setAvatarUrl(signed.signedUrl);
        } else if (
          profile.avatar_url &&
          !profile.avatar_url.includes("/storage/v1/object/public/profile-photos/")
        ) {
          if (active) setAvatarUrl(profile.avatar_url);
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not load your profile."
          );
          setMessageType("error");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  function updateDetail<K extends keyof ProfileDetails>(
    key: K,
    value: ProfileDetails[K]
  ) {
    setDetails((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(selected.type)
    ) {
      setMessage("Choose a JPG, PNG or WebP photograph.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setMessage("Choose a photograph smaller than 5 MB.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    setPhoto(selected);
    setAvatarUrl(URL.createObjectURL(selected));
    setMessage("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) return;

    if (!fullName.trim()) {
      setMessage("Your full name is required.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    let newPhotoPath = "";
    const previousPhotoPath = avatarPath;

    try {
      if (photo) {
        const extension =
          photo.type === "image/png"
            ? "png"
            : photo.type === "image/webp"
              ? "webp"
              : "jpg";

        newPhotoPath = `${userId}/${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(newPhotoPath, photo, {
            upsert: false,
            contentType: photo.type,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;
      }

      const finalPhotoPath = newPhotoPath || avatarPath;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          community: community.trim() || null,
          lga: lga.trim() || null,
          state: stateName.trim() || null,
          location:
            [community, lga, stateName]
              .map((value) => value.trim())
              .filter(Boolean)
              .join(", ") || null,
          avatar_path: finalPhotoPath || null,
          // Never store a private bucket's public object URL.
          avatar_url: "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      const { error: detailsError } = await supabase
        .from("member_profile_details")
        .upsert({
          user_id: userId,
          ...details,
          updated_at: new Date().toISOString(),
        });

      if (detailsError) {
        throw new Error(
          `Basic profile saved, but professional details could not be saved: ${detailsError.message}`
        );
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          location: [community, lga, stateName]
            .map((value) => value.trim())
            .filter(Boolean)
            .join(", "),
          headline: details.headline,
        },
      });

      if (newPhotoPath) {
        setAvatarPath(newPhotoPath);

        if (previousPhotoPath && previousPhotoPath !== newPhotoPath) {
          await supabase.storage
            .from("profile-photos")
            .remove([previousPhotoPath]);
        }
      }

      if (newPhotoPath) {
        const { data: signed } = await supabase.storage
          .from("profile-photos")
          .createSignedUrl(newPhotoPath, 3600);

        setAvatarUrl(signed?.signedUrl || "");
      }

      setPhoto(null);
      setMessage(
        metadataError
          ? "Profile saved. Some sign-in metadata could not be refreshed."
          : "Your professional profile has been saved."
      );
      setMessageType("success");
    } catch (error) {
      if (newPhotoPath) {
        await supabase.storage
          .from("profile-photos")
          .remove([newPhotoPath]);
      }

      setMessage(
        error instanceof Error ? error.message : "Could not save your profile."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSwitchMode() {
    if (accountMode !== "job_seeker" && accountMode !== "hirer") return;

    const nextMode = accountMode === "job_seeker" ? "hirer" : "job_seeker";
    const nextLabel = nextMode === "hirer" ? "HIRER" : "Job Seeker";

    if (
      !window.confirm(
        `Switch your WORKYARD mode to ${nextLabel}? Your jobs, applications, messages and profile will remain on this account.`
      )
    ) {
      return;
    }

    setSwitchingMode(true);
    setMessage("");

    try {
      const { error } = await supabase.rpc("switch_workyard_mode", {
        p_account_type: nextMode,
      });

      if (error) throw error;

      await supabase.auth.updateUser({
        data: { account_type: nextMode },
      });

      setAccountMode(nextMode);
      setMessage(`Your account is now in ${nextLabel} mode.`);
      setMessageType("success");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not switch account mode."
      );
      setMessageType("error");
    } finally {
      setSwitchingMode(false);
    }
  }

  if (loading) {
    return (
      <main className="wy-profile-loading">
        Loading your professional profile...
      </main>
    );
  }

  const canSwitchMode =
    accountMode === "job_seeker" || accountMode === "hirer";

  return (
    <main className="wy-profile-editor-page">
      <header className="wy-profile-editor-top">
        <Link href="/" className="wy-profile-back">
          <ArrowLeft size={17} /> Home feed
        </Link>
        <Link href={`/profile/view/?id=${userId}`} className="wy-profile-preview-link">
          <ExternalLink size={16} /> View public profile
        </Link>
      </header>

      <div className="wy-profile-editor-layout">
        <section className="wy-profile-editor-main">
          <div className="wy-profile-editor-heading">
            <span className="wy-profile-kicker">YOUR WORKYARD IDENTITY</span>
            <h1>Build your professional profile</h1>
            <p>
              Help people understand who you are, what you do and the
              experience you bring to your community.
            </p>
          </div>

          {message && (
            <div
              className={`wy-profile-alert ${messageType}`}
              role="status"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="wy-profile-form">
            <section className="wy-profile-section">
              <div className="wy-profile-section-title">
                <div>
                  <h2>Basic information</h2>
                  <p>Your identity and how people recognise you.</p>
                </div>
                <UserRound size={21} />
              </div>

              <div className="wy-profile-photo-row">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Your profile"
                    className="wy-profile-photo"
                  />
                ) : (
                  <div className="wy-profile-photo wy-profile-photo-empty">
                    <UserRound size={35} />
                  </div>
                )}

                <div>
                  <label className="wy-photo-button">
                    Change profile photograph
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                    />
                  </label>
                  <small>JPG, PNG or WebP. Maximum 5 MB.</small>
                </div>
              </div>

              <label className="wy-profile-field">
                <span>Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  maxLength={120}
                />
              </label>
              <PrivacySelect
                label="Who can see your name?"
                value={details.name_visibility}
                onChange={(value) => updateDetail("name_visibility", value)}
              />

              <label className="wy-profile-field">
                <span>Professional headline</span>
                <input
                  value={details.headline}
                  onChange={(event) =>
                    updateDetail("headline", event.target.value)
                  }
                  maxLength={160}
                  placeholder="e.g. Experienced electrician | Residential and commercial work"
                />
              </label>
              <PrivacySelect
                label="Headline visibility"
                value={details.headline_visibility}
                onChange={(value) =>
                  updateDetail("headline_visibility", value)
                }
              />

              <NigeriaLocationFields
                stateValue={stateName}
                lgaValue={lga}
                communityValue={community}
                onStateChange={setStateName}
                onLgaChange={setLga}
                onCommunityChange={setCommunity}
              />
              <PrivacySelect
                label="Location visibility"
                value={details.location_visibility}
                onChange={(value) =>
                  updateDetail("location_visibility", value)
                }
              />

              <label className="wy-profile-field">
                <span>Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  maxLength={40}
                  placeholder="+234..."
                />
              </label>
              <PrivacySelect
                label="Phone visibility"
                value={details.phone_visibility}
                onChange={(value) => updateDetail("phone_visibility", value)}
              />

              <PrivacySelect
                label="Profile photograph visibility"
                value={details.avatar_visibility}
                onChange={(value) => updateDetail("avatar_visibility", value)}
              />
              <PrivacySelect
                label="Account type visibility"
                value={details.account_type_visibility}
                onChange={(value) =>
                  updateDetail("account_type_visibility", value)
                }
              />
              <PrivacySelect
                label="Verification status visibility"
                value={details.verification_visibility}
                onChange={(value) =>
                  updateDetail("verification_visibility", value)
                }
              />
            </section>

            <section className="wy-profile-section">
              <div className="wy-profile-section-title">
                <div>
                  <h2>About</h2>
                  <p>Introduce yourself to people in your community.</p>
                </div>
              </div>
              <label className="wy-profile-field">
                <span>About you</span>
                <textarea
                  value={details.about}
                  onChange={(event) =>
                    updateDetail("about", event.target.value)
                  }
                  rows={6}
                  maxLength={3000}
                  placeholder="Tell people about yourself, your professional interests, the work you do and what makes you reliable."
                />
                <small>{details.about.length}/3000 characters</small>
              </label>
              <PrivacySelect
                label="About visibility"
                value={details.about_visibility}
                onChange={(value) => updateDetail("about_visibility", value)}
              />
            </section>

            <section className="wy-profile-section">
              <div className="wy-profile-section-title">
                <div>
                  <h2>Education and qualifications</h2>
                  <p>Schools, courses, training and qualifications.</p>
                </div>
              </div>
              <label className="wy-profile-field">
                <span>Education</span>
                <textarea
                  value={details.education}
                  onChange={(event) =>
                    updateDetail("education", event.target.value)
                  }
                  rows={5}
                  maxLength={4000}
                  placeholder={"Institution, qualification, course and year.\nYou can add more than one entry."}
                />
              </label>
              <PrivacySelect
                label="Education visibility"
                value={details.education_visibility}
                onChange={(value) =>
                  updateDetail("education_visibility", value)
                }
              />

              <label className="wy-profile-field">
                <span>Certifications and training</span>
                <textarea
                  value={details.certifications}
                  onChange={(event) =>
                    updateDetail("certifications", event.target.value)
                  }
                  rows={4}
                  maxLength={3000}
                  placeholder="List relevant certificates, licences, apprenticeships or professional training."
                />
              </label>
              <PrivacySelect
                label="Certifications visibility"
                value={details.certifications_visibility}
                onChange={(value) =>
                  updateDetail("certifications_visibility", value)
                }
              />
            </section>

            <section className="wy-profile-section">
              <div className="wy-profile-section-title">
                <div>
                  <h2>Work experience</h2>
                  <p>Show your employment and practical experience.</p>
                </div>
              </div>
              <label className="wy-profile-field">
                <span>Experience</span>
                <textarea
                  value={details.experience}
                  onChange={(event) =>
                    updateDetail("experience", event.target.value)
                  }
                  rows={6}
                  maxLength={5000}
                  placeholder={"Role or trade — Company or client — Dates\nDescribe the work you performed and what you achieved."}
                />
              </label>
              <PrivacySelect
                label="Experience visibility"
                value={details.experience_visibility}
                onChange={(value) =>
                  updateDetail("experience_visibility", value)
                }
              />
            </section>

            <section className="wy-profile-section">
              <div className="wy-profile-section-title">
                <div>
                  <h2>Skills and languages</h2>
                  <p>Help people understand what you can offer.</p>
                </div>
              </div>
              <label className="wy-profile-field">
                <span>Skills</span>
                <textarea
                  value={details.skills}
                  onChange={(event) =>
                    updateDetail("skills", event.target.value)
                  }
                  rows={4}
                  maxLength={2000}
                  placeholder="e.g. Plumbing, pipe installation, maintenance, tiling"
                />
              </label>
              <PrivacySelect
                label="Skills visibility"
                value={details.skills_visibility}
                onChange={(value) => updateDetail("skills_visibility", value)}
              />

              <label className="wy-profile-field">
                <span>Languages</span>
                <textarea
                  value={details.languages}
                  onChange={(event) =>
                    updateDetail("languages", event.target.value)
                  }
                  rows={2}
                  maxLength={1000}
                  placeholder="e.g. English, Yoruba, Hausa, Igbo"
                />
              </label>
              <PrivacySelect
                label="Languages visibility"
                value={details.languages_visibility}
                onChange={(value) =>
                  updateDetail("languages_visibility", value)
                }
              />
            </section>

            <div className="wy-profile-save-row">
              <span>
                <LockKeyhole size={15} />
                Your privacy choices are enforced by WORKYARD's database.
              </span>
              <button
                type="submit"
                className="wy-profile-save"
                disabled={saving}
              >
                <Save size={17} />
                {saving ? "Saving profile..." : "Save profile"}
              </button>
            </div>
          </form>

          <section className="wy-profile-section wy-account-mode">
            <div className="wy-profile-section-title">
              <div>
                <h2>Account mode</h2>
                <p>Choose how you want to use WORKYARD.</p>
              </div>
              <ArrowLeftRight size={21} />
            </div>

            <p>
              Current mode:{" "}
              <strong>
                {accountMode === "hirer"
                  ? "HIRER"
                  : accountMode === "job_seeker"
                    ? "Job Seeker"
                    : accountMode === "skill_owner"
                      ? "Skill Owner"
                      : "Not available"}
              </strong>
            </p>

            {canSwitchMode ? (
              <button
                type="button"
                className="wy-profile-save"
                onClick={() => void handleSwitchMode()}
                disabled={switchingMode}
              >
                <ArrowLeftRight size={17} />
                {switchingMode
                  ? "Switching..."
                  : accountMode === "hirer"
                    ? "Switch to Job Seeker"
                    : "Switch to HIRER"}
              </button>
            ) : (
              <p className="wy-profile-muted">
                Skill Owner is a separate account mode. HIRER / Job Seeker
                switching is available to those two account types.
              </p>
            )}
          </section>
        </section>

        <aside className="wy-profile-editor-aside">
          <div className="wy-profile-side-card">
            <div className="wy-profile-side-icon"><Eye size={20} /></div>
            <h3>You're in control</h3>
            <p>
              Choose whether each section is visible to all signed-in
              members, accepted connections, selected people or only you.
            </p>
          </div>

          <div className="wy-profile-side-card">
            <div className="wy-profile-side-icon"><EyeOff size={20} /></div>
            <h3>Private by default</h3>
            <p>
              Your phone number starts as private. Do not add passwords,
              financial details or other sensitive information to your
              professional profile.
            </p>
          </div>

          <div className="wy-profile-side-card">
            <div className="wy-profile-side-icon"><BadgeCheck size={20} /></div>
            <h3>Build trust</h3>
            <p>
              Complete your profile and verification to help people make
              better-informed decisions before working with you.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
