"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, Pause, Play, Trash2, Eye } from "lucide-react";

type Service = {
  id: string;
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

export default function ServicesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      router.replace("/login/");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", auth.user.id)
      .single();

    if (profile?.account_type !== "skill_owner") {
      setNotice("Only Skill Owner accounts can manage service listings.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("services")
      .select("id,title,category,description,location,price_type,price_amount,currency,cover_image_path,status")
      .eq("owner_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setNotice(error.message);
    } else {
      setItems((data || []) as Service[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function changeStatus(item: Service) {
    const next = item.status === "published" ? "paused" : "published";

    const { error } = await supabase
      .from("services")
      .update({ status: next })
      .eq("id", item.id);

    if (error) {
      setNotice(error.message);
    } else {
      setNotice(next === "published" ? "Service published." : "Service paused.");
      await load();
    }
  }

  async function remove(item: Service) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", item.id);

    if (error) {
      setNotice(error.message);
    } else {
      setNotice("Service deleted.");
      await load();
    }
  }

  function priceLabel(item: Service) {
    if (item.price_type === "negotiable") return "Price negotiable";

    const amount = Number(item.price_amount || 0).toLocaleString();

    return `${item.currency || "NGN"} ${amount}${
      item.price_type === "hourly" ? " / hour" : ""
    }`;
  }

  if (loading) {
    return <main className="dashboard-loading">Loading your services...</main>;
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: "900px" }}>
        <Link href="/" className="profile-back">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 20,
        }}>
          <div>
            <h1 style={{ margin: "0 0 6px" }}>My Services</h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Create and manage the services you offer in your community.
            </p>
          </div>

          <Link
            href="/services/new/"
            className="btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <Plus size={17} /> Add a service
          </Link>
        </div>

        {notice && <p className="auth-message" role="status">{notice}</p>}

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 12px" }}>
            <h2>No services listed yet</h2>
            <p style={{ color: "#64748b" }}>
              Add your skill so people nearby can find and contact you.
            </p>
            <Link href="/services/new/" className="btn">
              Create your first listing
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
            {items.map((item) => {
              const imageUrl = item.cover_image_path
                ? supabase.storage
                    .from("service-photos")
                    .getPublicUrl(item.cover_image_path).data.publicUrl
                : null;

              return (
                <article
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    flexWrap: "wrap",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      style={{
                        width: 104,
                        height: 88,
                        objectFit: "cover",
                        borderRadius: 10,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 104,
                      height: 88,
                      borderRadius: 10,
                      background: "#e6f5eb",
                      display: "grid",
                      placeItems: "center",
                      color: "#0B7A42",
                      fontWeight: 800,
                    }}>
                      WORKYARD
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 180 }}>
                    <strong>{item.title}</strong>
                    <p style={{ margin: "5px 0", color: "#64748b", fontSize: 13 }}>
                      {item.category} · {item.location}
                    </p>
                    <p style={{ margin: 0, fontWeight: 700, color: "#0B7A42" }}>
                      {priceLabel(item)}
                    </p>
                    <span style={{
                      display: "inline-block",
                      marginTop: 7,
                      fontSize: 12,
                      fontWeight: 700,
                      color: item.status === "published" ? "#0B7A42" : "#92400e",
                    }}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {item.status === "published" && (
                      <Link
                        className="btn btn-outline"
                        href={`/services/view/?id=${encodeURIComponent(item.id)}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Eye size={15} /> View
                      </Link>
                    )}

                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => void changeStatus(item)}
                    >
                      {item.status === "published" ? <Pause size={15} /> : <Play size={15} />}
                      {item.status === "published" ? "Pause" : "Publish"}
                    </button>

                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => void remove(item)}
                      style={{ color: "#b91c1c" }}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
