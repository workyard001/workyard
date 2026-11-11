"use client";

import { Suspense, useEffect, useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, RefreshCw, Flag } from "lucide-react";

type Conversation = {
  conversation_id: string;
  other_user_id: string;
  job_title: string;
  other_user_name: string;
  other_avatar_path: string | null;
  other_avatar_url: string | null;
};

type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");

  const [userId, setUserId] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState("CONNECTING");
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingActiveRef = useRef(false);

  async function loadMessages(id: string, currentUserId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at, read_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      setMessage(`Could not load messages: ${error.message}`);
      return;
    }

    const loaded = (data || []) as ChatMessage[];
    setMessages(loaded);

    const readAt = new Date().toISOString();

    const { error: readError } = await supabase
      .from("messages")
      .update({ read_at: readAt })
      .eq("conversation_id", id)
      .neq("sender_id", currentUserId)
      .is("read_at", null);

    if (readError) {
      setMessage(`Messages loaded, but read receipts could not be updated: ${readError.message}`);
    } else {
      setMessages((current) =>
        current.map((item) =>
          item.sender_id !== currentUserId && !item.read_at
            ? { ...item, read_at: readAt }
            : item
        )
      );
    }
  }

  useEffect(() => {
    let active = true;

    async function loadChat() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      if (!active) return;
      setUserId(authData.user.id);

      if (!conversationId) {
        setMessage("No conversation was selected.");
        setLoading(false);
        return;
      }

      const { data: conversationData, error: conversationError } =
        await supabase.rpc("get_my_conversations_v2");

      if (!active) return;

      if (conversationError) {
        setMessage(`Could not open conversation: ${conversationError.message}`);
        setLoading(false);
        return;
      }

      const found = ((conversationData || []) as Conversation[]).find(
        (item) => item.conversation_id === conversationId
      );

      if (!found) {
        setMessage("This conversation does not exist or you do not have access to it.");
        setLoading(false);
        return;
      }

      let avatarUrl: string | null = null;

      if (found.other_avatar_path) {
        const { data: photo } = await supabase.storage
          .from("profile-photos")
          .createSignedUrl(found.other_avatar_path, 3600);

        avatarUrl = photo?.signedUrl || null;
      }

      if (!active) return;

      setConversation({
        ...found,
        other_avatar_url: avatarUrl,
      });
      await loadMessages(conversationId, authData.user.id);

      if (active) setLoading(false);
    }

    void loadChat();

    return () => {
      active = false;
    };
  }, [router, conversationId]);

  // Subscribe only to messages in this conversation.
  useEffect(() => {
    if (!conversationId || !userId) return;

    let active = true;
    setRealtimeStatus("CONNECTING");

    const otherUserId = conversation?.other_user_id;
    if (!otherUserId) return;

    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: {
        private: true,
        presence: { key: userId },
        broadcast: { self: false },
      },
    });

    channelRef.current = channel;

    channel
      .on(
        "presence",
        { event: "sync" },
        () => {
          if (!active) return;

          const presenceState = channel.presenceState();
          const isOnline = Object.keys(presenceState).includes(otherUserId);

          setOtherOnline(isOnline);

          if (!isOnline) {
            setOtherTyping(false);
            if (otherTypingTimeoutRef.current) {
              clearTimeout(otherTypingTimeoutRef.current);
              otherTypingTimeoutRef.current = null;
            }
          }
        }
      )
      .on(
        "broadcast",
        { event: "typing" },
        ({ payload }) => {
          if (!active || payload?.user_id !== otherUserId) return;

          const isTyping = payload?.is_typing === true;
          setOtherTyping(isTyping);

          if (otherTypingTimeoutRef.current) {
            clearTimeout(otherTypingTimeoutRef.current);
            otherTypingTimeoutRef.current = null;
          }

          // Clear stale typing indicators if a stop event is missed.
          if (isTyping) {
            otherTypingTimeoutRef.current = setTimeout(() => {
              setOtherTyping(false);
              otherTypingTimeoutRef.current = null;
            }, 4000);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          if (!incoming?.id || !active) return;

          setMessages((current) => {
            const exists = current.some((item) => item.id === incoming.id);
            const next = exists
              ? current.map((item) =>
                  item.id === incoming.id ? { ...item, ...incoming } : item
                )
              : [...current, incoming];

            return [...next].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
          });

          // Automatically mark incoming messages as read while this chat is open.
          if (incoming.sender_id !== userId && !incoming.read_at) {
            void (async () => {
              const readAt = new Date().toISOString();

              const { error: readError } = await supabase
                .from("messages")
                .update({ read_at: readAt })
                .eq("id", incoming.id)
                .eq("conversation_id", conversationId)
                .neq("sender_id", userId)
                .is("read_at", null);

              if (!active) return;

              if (readError) {
                setMessage(
                  `New message received, but its read receipt could not be updated: ${readError.message}`
                );
              } else {
                setMessages((current) =>
                  current.map((item) =>
                    item.id === incoming.id
                      ? { ...item, read_at: item.read_at || readAt }
                      : item
                  )
                );
              }
            })();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage;
          if (!updated?.id || !active) return;

          // Update read receipts on the sender's screen.
          setMessages((current) =>
            current.map((item) =>
              item.id === updated.id
                ? { ...item, read_at: updated.read_at }
                : item
            )
          );
        }
      )
      .subscribe(async (status) => {
        if (!active) return;

        setRealtimeStatus(status);

        if (status === "SUBSCRIBED") {
          try {
            await channel.track({
              user_id: userId,
              online_at: new Date().toISOString(),
            });
          } catch {
            if (active) {
              setMessage(
                "Live messages are connected, but online status could not be shared."
              );
            }
          }
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setMessage(
            "Live message updates are unavailable. Use Refresh to check for new messages."
          );
        }
      });

    return () => {
      active = false;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (otherTypingTimeoutRef.current) {
        clearTimeout(otherTypingTimeoutRef.current);
        otherTypingTimeoutRef.current = null;
      }

      typingActiveRef.current = false;

      if (channelRef.current === channel) {
        channelRef.current = null;
      }

      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [conversationId, userId, conversation?.other_user_id]);

  function broadcastTyping(isTyping: boolean) {
    const channel = channelRef.current;

    if (!channel || realtimeStatus !== "SUBSCRIBED") return;

    void channel.send({
      type: "broadcast",
      event: "typing",
      payload: {
        user_id: userId,
        is_typing: isTyping,
      },
    });
  }

  function handleDraftChange(value: string) {
    setDraft(value);

    if (realtimeStatus !== "SUBSCRIBED") return;

    if (value.trim()) {
      if (!typingActiveRef.current) {
        typingActiveRef.current = true;
        broadcastTyping(true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        typingActiveRef.current = false;
        broadcastTyping(false);
        typingTimeoutRef.current = null;
      }, 1500);
    } else if (typingActiveRef.current) {
      typingActiveRef.current = false;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      broadcastTyping(false);
    }
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = draft.trim();
    if (!body || !conversationId || !userId || sending) return;

    typingActiveRef.current = false;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    broadcastTyping(false);

    setSending(true);
    setMessage("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      body,
    });

    setSending(false);

    if (error) {
      setMessage(`Message could not be sent: ${error.message}`);
      return;
    }

    setDraft("");
    await loadMessages(conversationId, userId);
  }


  async function reportMessage(item: ChatMessage) {
    if (!userId || item.sender_id === userId || reportSubmitting) return;

    const reasons = [
      "spam",
      "harassment",
      "scam",
      "impersonation",
      "inappropriate_content",
      "unsafe_work",
      "other",
    ];

    const selected = window.prompt(
      "Why are you reporting this message?\\n" +
      reasons.map((reason, index) => `${index + 1}. ${reason.replaceAll("_", " ")}`).join("\\n")
    );

    if (!selected) return;

    const index = Number(selected.trim()) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= reasons.length) {
      setMessage("Invalid report reason. Please try again.");
      return;
    }

    const details = window.prompt("Additional details (optional):");

    setReportSubmitting(item.id);
    setMessage("");

    try {
      const { error } = await supabase.rpc("submit_content_report", {
        p_target_type: "message",
        p_target_id: item.id,
        p_reason: reasons[index],
        p_details: details?.trim() || null,
      });

      if (error) {
        if (error.message.toLowerCase().includes("duplicate") ||
            error.code === "23505") {
          throw new Error("You have already submitted an active report for this message.");
        }
        throw error;
      }

      setMessage("Message report submitted successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not submit this message report."
      );
    } finally {
      setReportSubmitting(null);
    }
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        Opening conversation...
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card" style={{
        maxWidth: "800px",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
      }}>
        <Link href="/messages/" className="profile-back">
          <ArrowLeft size={16} /> Back to messages
        </Link>

        {conversation ? (
          <>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "20px",
              paddingBottom: "16px",
              borderBottom: "1px solid #e5e7eb",
            }}>
              {conversation.other_avatar_url ? (
                <img
                  src={conversation.other_avatar_url}
                  alt=""
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  background: "#e6f5eb",
                  color: "#0B7A42",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                }}>
                  {(conversation.other_user_name || "W").charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0 }}>{conversation.other_user_name}</h2>
                <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: "13px" }}>
                  Job: {conversation.job_title}
                </p>
                <p
                  style={{
                    margin: "5px 0 0",
                    color: realtimeStatus === "SUBSCRIBED" ? "#0B7A42" : "#64748b",
                    fontSize: "12px",
                  }}
                >
                  {realtimeStatus === "SUBSCRIBED"
                    ? "● Live message updates connected"
                    : realtimeStatus === "CHANNEL_ERROR" || realtimeStatus === "TIMED_OUT"
                      ? "Live updates unavailable · use Refresh"
                      : "Connecting to live messages..."}
                </p>
                <p
                  style={{
                    margin: "5px 0 0",
                    color: otherOnline ? "#0B7A42" : "#87938b",
                    fontSize: "12px",
                    fontWeight: otherTyping ? 700 : 500,
                  }}
                >
                  {otherTyping
                    ? "● Typing..."
                    : otherOnline
                      ? "● Online"
                      : "○ Offline"}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => loadMessages(conversationId!, userId)}
                title="Refresh messages"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            <div style={{
              flex: 1,
              minHeight: "300px",
              maxHeight: "55vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "18px 0",
            }}>
              {messages.length === 0 && (
                <p style={{ textAlign: "center", color: "#64748b", margin: "auto" }}>
                  No messages yet. Send the first message to start the conversation.
                </p>
              )}

              {messages.map((item) => {
                const mine = item.sender_id === userId;

                return (
                  <div
                    key={item.id}
                    style={{
                      alignSelf: mine ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      background: mine ? "#e6f5eb" : "#f1f5f9",
                      color: "#173326",
                      borderRadius: "14px",
                      padding: "12px 15px",
                    }}
                  >
                    <p style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      lineHeight: 1.6,
                    }}>
                      {item.body}
                    </p>
                    <small style={{
                      display: "block",
                      textAlign: "right",
                      color: "#64748b",
                      marginTop: "6px",
                    }}>
                      {new Date(item.created_at).toLocaleString()}
                      {mine && item.read_at ? " · Read" : ""}
                    </small>

                    {!mine && (
                      <button
                        type="button"
                        onClick={() => void reportMessage(item)}
                        disabled={reportSubmitting === item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          marginTop: "8px",
                          marginLeft: "auto",
                          padding: "3px 0",
                          border: "none",
                          background: "transparent",
                          color: "#64748b",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        <Flag size={13} />
                        {reportSubmitting === item.id ? "Reporting..." : "Report"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {message && (
              <p className="auth-message" role="status">{message}</p>
            )}

            <form onSubmit={handleSend} style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-end",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "16px",
            }}>
              <textarea
                value={draft}
                onChange={(event) => handleDraftChange(event.target.value)}
                rows={2}
                maxLength={4000}
                placeholder="Write a message..."
                required
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "12px",
                  border: "1px solid #dce8df",
                  borderRadius: "10px",
                  font: "inherit",
                  resize: "vertical",
                }}
              />
              <button className="btn" type="submit" disabled={sending || !draft.trim()}>
                <Send size={17} />
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Conversation unavailable</h1>
            <p>{message}</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<main className="dashboard-loading">Loading conversation...</main>}>
      <ChatContent />
    </Suspense>
  );
}
