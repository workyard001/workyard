"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Search, MapPin, BadgeCheck } from "lucide-react";

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
};

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  verification_status: string | null;
  location: string | null;
};

export default function FindWorkersPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        router.replace("/login/");
        return;
      }

      const { data, error } = await supabase
        .from("services")
        .select("id,owner_id,title,category,description,location,price_type,price_amount,currency,cover_image_path")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        setNotice(error.message);
        setLoading(false);
        return;
      }

      const list = (data || []) as Service[];
      setServices(list);

      const ids = [...new Set(list.map((item) => item.owner_id))];

      if (ids.length) {
        const results = await Promise.all(
          ids.map(async (id) => {
            const { data, error } = await supabase.rpc(
              "get_member_profile_v2",
              { p_profile_id: id }
            );

            if (error) {
              console.error("Could not load worker profile:", error.message);
              return null;
            }

            const person = Array.isArray(data) ? data[0] : data;
            if (!person) return null;

            let avatarUrl: string | null = null;

            if (person.avatar_path) {
              const { data: photo } = await supabase.storage
                .from("profile-photos")
                .createSignedUrl(person.avatar_path, 3600);

              avatarUrl = photo?.signedUrl || null;
            }

            return {
              id: person.user_id,
              full_name: person.full_name || "WORKYARD Member",
              avatar_url: avatarUrl,
              verification_status: person.verification_status,
              location: person.location,
            } as Profile;
          })
        );

        const map: Record<string, Profile> = {};

        results.forEach((person) => {
          if (person) map[person.id] = person;
        });

        setProfiles(map);
      }

      setLoading(false);
    }

    void load();
  }, [router]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(services.map((item) => item.category).filter(Boolean))
      ).sort(),
    ],
    [services]
  );

  const filtered = services.filter((item) => {
    const person = profiles[item.owner_id];

    const haystack = [
      item.title,
      item.description,
      item.category,
      item.location,
      person?.full_name || "",
    ].join(" ").toLowerCase();

    return (
      (!search || haystack.includes(search.toLowerCase())) &&
      (category === "All" || item.category === category) &&
      (!location || item.location.toLowerCase().includes(location.toLowerCase()))
    );
  });

  function price(item: Service) {
    if (item.price_type === "negotiable") return "Negotiable";

    return `NGN ${Number(item.price_amount || 0).toLocaleString()}${
      item.price_type === "hourly" ? " / hour" : ""
    }`;
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        Finding trusted service providers...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: 1100 }}>
        <Link href="/" className="profile-back">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 style={{ marginTop: 22 }}>Find a Worker</h1>

        <p style={{ color: "#64748b" }}>
          Discover skilled people offering services in your community.
        </p>

        {notice && <p className="auth-message">{notice}</p>}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
          gap: 10,
          margin: "22px 0",
        }}>
          <div style={{ position: "relative" }}>
            <Search size={17} style={{
              position: "absolute",
              left: 12,
              top: 14,
              color: "#64748b",
            }} />
            <input
              className="auth-input"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search skills or services"
            />
          </div>

          <select
            className="auth-input"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <input
            className="auth-input"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Filter by community / LGA"
          />
        </div>

        <p style={{ color: "#64748b", fontSize: 13 }}>
          {filtered.length} service{filtered.length === 1 ? "" : "s"} found
        </p>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 45 }}>
            <h2>No matching services</h2>
            <p style={{ color: "#64748b" }}>
              Try another skill or location.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 16,
          }}>
            {filtered.map((item) => {
              const person = profiles[item.owner_id];

              const imageUrl = item.cover_image_path
                ? supabase.storage
                    .from("service-photos")
                    .getPublicUrl(item.cover_image_path).data.publicUrl
                : null;

              return (
                <Link
                  key={item.id}
                  href={`/services/view/?id=${encodeURIComponent(item.id)}`}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: 165,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div style={{
                      height: 165,
                      background: "#e6f5eb",
                      display: "grid",
                      placeItems: "center",
                      color: "#0B7A42",
                      fontWeight: 800,
                    }}>
                      WORKYARD SERVICE
                    </div>
                  )}

                  <div style={{ padding: 16 }}>
                    <span style={{
                      fontSize: 12,
                      color: "#0B7A42",
                      fontWeight: 800,
                    }}>
                      {item.category}
                    </span>

                    <h3 style={{ margin: "7px 0" }}>{item.title}</h3>

                    <p style={{
                      color: "#64748b",
                      fontSize: 13,
                      margin: "0 0 10px",
                    }}>
                      {person?.full_name || "WORKYARD provider"}

                      {person?.verification_status === "verified" && (
                        <BadgeCheck
                          size={14}
                          style={{
                            verticalAlign: "middle",
                            color: "#0B7A42",
                          }}
                        />
                      )}
                    </p>

                    <p style={{
                      fontSize: 13,
                      color: "#64748b",
                      margin: "0 0 10px",
                    }}>
                      <MapPin size={14} style={{ verticalAlign: "middle" }} />
                      {" "}{item.location}
                    </p>

                    <strong style={{ color: "#0B7A42" }}>
                      {price(item)}
                    </strong>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
