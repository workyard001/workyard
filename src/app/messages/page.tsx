"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MessageCircle } from "lucide-react";

type Conversation = {
  conversation_id: string;
  job_id: string;
  job_title: string;
  other_user_id: string;
  other_user_name: string;
  other_avatar_path: string | null;
  other_avatar_url: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
};

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function loadConversations() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      // RLS on messages limits these events to conversations this member can read.
      if (!channel) {
        channel = supabase
          .channel(`messages-inbox:${authData.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "messages",
            },
            () => {
              if (active) {
                void loadConversations();
              }
            }
          )
          .subscribe((status) => {
            if (
              active &&
              (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
            ) {
              setMessage(
                "Live inbox updates are unavailable. Reopen or refresh this page to check for new messages."
              );
            }
          });
      }

      const { data, error } = await supabase.rpc("get_my_conversations_v2");

      if (!active) return;

      if (error) {
        setMessage(`Could not load messages: ${error.message}`);
      } else {
        const rows = (data || []) as Conversation[];

        const conversationsWithPhotos = await Promise.all(
          rows.map(async (conversation) => {
            if (!conversation.other_avatar_path) {
              return { ...conversation, other_avatar_url: null };
            }

            const { data: photo } = await supabase.storage
              .from("profile-photos")
              .createSignedUrl(conversation.other_avatar_path, 3600);

            return {
              ...conversation,
              other_avatar_url: photo?.signedUrl || null,
            };
          })
        );

        if (active) setConversations(conversationsWithPhotos);
      }

      setLoading(false);
    }

    void loadConversations();

    return () => {
      active = false;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [router]);

  if (loading) {
    return (
      <main className="dashboard-loading">
        Loading your messages...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{ maxWidth: "800px" }}>
        <Link href="/" className="profile-back">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 style={{ marginTop: "22px" }}>Messages</h1>
        <p style={{ color: "#64748b" }}>
          Conversations with employers and workers in your community.
        </p>

        {message && (
          <p className="auth-message" role="status">{message}</p>
        )}

        {conversations.length === 0 && !message && (
          <div style={{ textAlign: "center", padding: "45px 10px" }}>
            <MessageCircle size={42} color="#0B7A42" />
            <h2>No conversations yet</h2>
            <p style={{ color: "#64748b" }}>
              When you start a conversation from a job application,
              it will appear here.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
          {conversations.map((conversation) => (
            <Link
              key={conversation.conversation_id}
              href={`/messages/chat/?id=${encodeURIComponent(conversation.conversation_id)}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {conversation.other_avatar_url ? (
                <img
                  src={conversation.other_avatar_url}
                  alt=""
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#e6f5eb",
                  color: "#0B7A42",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: "18px",
                  flexShrink: 0,
                }}>
                  {(conversation.other_user_name || "W").charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{conversation.other_user_name}</strong>
                <p style={{
                  margin: "4px 0",
                  color: "#0B7A42",
                  fontSize: "12px",
                  fontWeight: 700,
                }}>
                  {conversation.job_title}
                </p>
                <p style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {conversation.last_message || "Conversation started"}
                </p>
              </div>

              {conversation.unread_count > 0 && (
                <span style={{
                  minWidth: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#0B7A42",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "12px",
                  fontWeight: 800,
                }}>
                  {conversation.unread_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
