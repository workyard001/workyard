"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  RefreshCw,
} from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read_at: string | null;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [openingId, setOpeningId] = useState("");
  const [message, setMessage] = useState("");

  const loadNotifications = useCallback(async () => {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.replace("/login/");
      return;
    }

    setUserId(authData.user.id);

    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setMessage(`Could not load notifications: ${error.message}`);
    } else {
      setNotifications((data || []) as Notification[]);
      setMessage("");
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(
    (item) => !item.read_at
  ).length;

  async function markAllAsRead() {
    if (!userId || unreadCount === 0) return;

    setBusy(true);
    setMessage("");

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", userId)
      .is("read_at", null);

    setBusy(false);

    if (error) {
      setMessage(`Could not mark notifications as read: ${error.message}`);
      return;
    }

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read_at: item.read_at || now,
      }))
    );
  }

  async function openNotification(item: Notification) {
    if (!item.link || !item.link.startsWith("/") || item.link.startsWith("//")) {
      setMessage("This notification does not have a valid destination.");
      return;
    }

    setOpeningId(item.id);
    setMessage("");

    if (!item.read_at) {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("notifications")
        .update({ read_at: now })
        .eq("id", item.id)
        .eq("user_id", userId);

      if (error) {
        setOpeningId("");
        setMessage(`Could not mark notification as read: ${error.message}`);
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, read_at: now }
            : notification
        )
      );
    }

    router.push(item.link);
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        Loading your notifications...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: "850px" }}>
        <Link href="/" className="profile-back">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          flexWrap: "wrap",
          marginTop: "22px",
        }}>
          <div>
            <h1 style={{ margin: "0 0 7px" }}>
              Notifications
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Stay updated on your jobs, applications and messages.
            </p>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => void loadNotifications()}
              disabled={busy}
            >
              <RefreshCw size={16} /> Refresh
            </button>

            <button
              type="button"
              className="btn"
              onClick={markAllAsRead}
              disabled={busy || unreadCount === 0}
            >
              <CheckCheck size={16} />
              {busy ? "Saving..." : "Mark all as read"}
            </button>
          </div>
        </div>

        <div style={{
          marginTop: "22px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          color: "#0B7A42",
          fontWeight: 700,
        }}>
          <Bell size={20} />
          {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
        </div>

        {message && (
          <p className="auth-message" role="status" style={{ marginTop: "18px" }}>
            {message}
          </p>
        )}

        {notifications.length === 0 && !message && (
          <div style={{ textAlign: "center", padding: "50px 10px" }}>
            <Bell size={42} color="#0B7A42" />
            <h2>You're all caught up!</h2>
            <p style={{ color: "#64748b" }}>
              New job applications, status updates and messages will appear here.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void openNotification(item)}
              disabled={openingId === item.id}
              style={{
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "flex-start",
                gap: "13px",
                padding: "17px",
                border: "1px solid #e5e7eb",
                borderLeft: item.read_at
                  ? "4px solid #e5e7eb"
                  : "4px solid #0B7A42",
                borderRadius: "12px",
                background: item.read_at ? "#fff" : "#f1f8f3",
                color: "#173326",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <span style={{
                width: "38px",
                height: "38px",
                flexShrink: 0,
                borderRadius: "10px",
                background: "#e6f5eb",
                color: "#0B7A42",
                display: "grid",
                placeItems: "center",
              }}>
                <Bell size={19} />
              </span>

              <span style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", marginBottom: "5px" }}>
                  {item.title}
                </strong>

                <span style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}>
                  {item.body}
                </span>

                <small style={{
                  display: "block",
                  marginTop: "9px",
                  color: "#87938b",
                }}>
                  {new Date(item.created_at).toLocaleString()}
                  {openingId === item.id ? " · Opening..." : " · Open"}
                </small>
              </span>

              {!item.read_at && (
                <span
                  aria-label="Unread"
                  style={{
                    width: "9px",
                    height: "9px",
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "#0B7A42",
                    marginTop: "6px",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
