"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  MapPin,
  BadgeCheck,
  MessageCircle,
  BriefcaseBusiness,
} from "lucide-react";

type Service = {
  id: string;
  owner_id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  price_type: string;
  price_amount: number | null;
  currency: string;
  cover_image_path: string | null;
  status: string;
};

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  verification_status: string | null;
  location: string | null;
};

function ServiceDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = searchParams.get("id");

  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function load() {
      if (!serviceId) {
        setNotice("No service was selected.");
        setLoading(false);
        return;
      }

      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        router.replace("/login/");
        return;
      }

      setUserId(auth.user.id);

      const { data, error } = await supabase
        .from("services")
        .select(
          "id,owner_id,title,category,description,location,price_type,price_amount,currency,cover_image_path,status"
        )
        .eq("id", serviceId)
        .maybeSingle();

      if (error || !data) {
        setNotice(error?.message || "This service could not be found.");
        setLoading(false);
        return;
      }

      const selected = data as Service;
      setService(selected);

      const { data: personData, error: personError } =
        await supabase.rpc("get_member_profile_v2", {
          p_profile_id: selected.owner_id,
        });

      const person = Array.isArray(personData)
        ? personData[0]
        : personData;

      if (personError) {
        console.error("Could not load provider profile:", personError.message);
        setProvider(null);
      } else if (person) {
        let avatarUrl: string | null = null;

        if (person.avatar_path) {
          const { data: photo } = await supabase.storage
            .from("profile-photos")
            .createSignedUrl(person.avatar_path, 3600);

          avatarUrl = photo?.signedUrl || null;
        }

        setProvider({
          id: person.user_id,
          full_name: person.full_name || "WORKYARD Member",
          avatar_url: avatarUrl,
          verification_status: person.verification_status,
          location: person.location,
        });
      } else {
        setProvider(null);
      }
      setLoading(false);
    }

    void load();
  }, [serviceId, router]);

  async function contactProvider() {
    if (!service || contacting) return;

    if (service.owner_id === userId) {
      setNotice("This is your own service listing.");
      return;
    }

    setContacting(true);
    setNotice("");

    const { data, error } = await supabase.rpc(
      "create_or_get_service_conversation",
      { p_service_id: service.id }
    );

    if (error) {
      setNotice(error.message);
      setContacting(false);
      return;
    }

    let conversationId: string | null = null;

    if (typeof data === "string") {
      conversationId = data;
    } else if (Array.isArray(data)) {
      conversationId =
        data[0]?.conversation_id || data[0]?.id || null;
    } else if (data && typeof data === "object") {
      conversationId =
        (data as { conversation_id?: string; id?: string })
          .conversation_id ||
        (data as { id?: string }).id ||
        null;
    }

    if (!conversationId) {
      setNotice("The conversation could not be opened. Please try again.");
      setContacting(false);
      return;
    }

    router.push(
      `/messages/chat/?id=${encodeURIComponent(conversationId)}`
    );
  }

  function price() {
    if (!service) return "";

    if (service.price_type === "negotiable") return "Price negotiable";

    const amount = `${service.currency || "NGN"} ${Number(
      service.price_amount || 0
    ).toLocaleString()}`;

    return service.price_type === "hourly"
      ? `${amount} / hour`
      : amount;
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        Loading service details...
      </main>
    );
  }

  if (!service) {
    return (
      <main className="profile-page">
        <div className="profile-card">
          <Link href="/workers/" className="profile-back">
            <ArrowLeft size={16} /> Back to workers
          </Link>
          <h1 style={{ marginTop: 24 }}>Service unavailable</h1>
          <p className="auth-message">{notice}</p>
          <Link href="/workers/" className="auth-button">
            Find another worker
          </Link>
        </div>
      </main>
    );
  }

  const imageUrl = service.cover_image_path
    ? supabase.storage
        .from("service-photos")
        .getPublicUrl(service.cover_image_path).data.publicUrl
    : null;

  const isOwner = service.owner_id === userId;
  const isVerified = provider?.verification_status === "verified";

  return (
    <main className="profile-page">
      <div
        className="profile-card"
        style={{ maxWidth: 900, width: "100%" }}
      >
        <Link href="/workers/" className="profile-back">
          <ArrowLeft size={16} /> Back to workers
        </Link>

        <div style={{ marginTop: 24 }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={service.title}
              style={{
                width: "100%",
                maxHeight: 390,
                objectFit: "cover",
                borderRadius: 14,
              }}
            />
          ) : (
            <div
              style={{
                height: 230,
                background: "#e6f5eb",
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                color: "#0B7A42",
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              <BriefcaseBusiness size={42} />
              WORKYARD SERVICE
            </div>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <span
            style={{
              color: "#0B7A42",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {service.category}
          </span>

          <h1 style={{ margin: "8px 0 12px" }}>
            {service.title}
          </h1>

          <h2 style={{ color: "#0B7A42", margin: "0 0 16px" }}>
            {price()}
          </h2>

          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            <MapPin
              size={16}
              style={{ verticalAlign: "middle" }}
            />{" "}
            {service.location}
          </p>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #e5e7eb",
              margin: "24px 0",
            }}
          />

          <h2>About this service</h2>
          <p style={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {service.description}
          </p>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #e5e7eb",
              margin: "24px 0",
            }}
          />

          <h2>Service provider</h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            {provider?.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt=""
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "#e6f5eb",
                  color: "#0B7A42",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                {(provider?.full_name || "W").charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <strong>
                {provider?.full_name || "WORKYARD provider"}
              </strong>

              <p style={{ margin: "5px 0", color: "#64748b" }}>
                {isVerified ? (
                  <span style={{ color: "#0B7A42" }}>
                    <BadgeCheck
                      size={15}
                      style={{ verticalAlign: "middle" }}
                    />{" "}
                    Identity verified
                  </span>
                ) : (
                  "Identity not yet verified"
                )}
              </p>

              {provider?.location && (
                <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
                  {provider.location}
                </p>
              )}
            </div>
          </div>

          {notice && (
            <p className="auth-message" style={{ marginTop: 18 }}>
              {notice}
            </p>
          )}

          <button
            type="button"
            className="auth-button"
            onClick={contactProvider}
            disabled={isOwner || contacting}
            style={{
              marginTop: 26,
              maxWidth: 340,
              opacity: isOwner || contacting ? 0.65 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
            }}
          >
            <MessageCircle size={18} />
            {isOwner
              ? "This is your service"
              : contacting
              ? "Opening conversation..."
              : "Contact provider"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ServiceViewPage() {
  return (
    <Suspense
      fallback={
        <main className="dashboard-loading">
          Loading service...
        </main>
      }
    >
      <ServiceDetails />
    </Suspense>
  );
}
