"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, PhoneOff, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";

type IncomingCall = {
  id: string;
  conversation_id: string;
  caller_id: string;
  call_type: "audio" | "video";
  status: string;
};

export default function IncomingCallListener() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUserId(data.user?.id || "");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUserId(session?.user?.id || "");
        setIncoming(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    async function loadPendingCall() {
      const { data, error: queryError } = await supabase
        .from("call_sessions")
        .select("id, conversation_id, caller_id, call_type, status")
        .eq("callee_id", userId)
        .eq("status", "ringing")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (active && !queryError && data) {
        setIncoming(data as IncomingCall);
      }
    }

    void loadPendingCall();

    const channel = supabase
      .channel(`incoming-calls:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_sessions",
          filter: `callee_id=eq.${userId}`,
        },
        (payload) => {
          const call = payload.new as IncomingCall;

          if (active && call.status === "ringing") {
            setError("");
            setIncoming(call);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "call_sessions",
          filter: `callee_id=eq.${userId}`,
        },
        (payload) => {
          const call = payload.new as IncomingCall;

          if (!active || !incoming || call.id !== incoming.id) return;

          if (call.status !== "ringing") {
            setIncoming(null);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [userId, incoming?.id]);

  async function respond(accept: boolean) {
    if (!incoming || busy) return;

    setBusy(true);
    setError("");

    const { error: rpcError } = await supabase.rpc(
      "respond_workyard_call",
      {
        p_call_id: incoming.id,
        p_accept: accept,
      }
    );

    if (rpcError) {
      setError(rpcError.message);
      setBusy(false);
      return;
    }

    const callId = incoming.id;
    setIncoming(null);
    setBusy(false);

    if (accept) {
      router.push(`/messages/call/?id=${encodeURIComponent(callId)}`);
    }
  }

  if (!incoming) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Incoming call"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(10, 25, 16, 0.65)",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "min(100%, 390px)",
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          textAlign: "center",
          boxShadow: "0 20px 70px rgba(0,0,0,.25)",
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "#e6f5eb",
            color: "#0B7A42",
            display: "grid",
            placeItems: "center",
          }}
        >
          {incoming.call_type === "video" ? (
            <Video size={30} />
          ) : (
            <Phone size={30} />
          )}
        </div>

        <h2 style={{ margin: "0 0 8px", color: "#173326" }}>
          Incoming {incoming.call_type} call
        </h2>
        <p style={{ color: "#64748b", margin: "0 0 20px" }}>
          Someone in your WORKYARD conversation is calling you.
        </p>

        {error && (
          <p className="auth-message" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
          <button
            type="button"
            onClick={() => void respond(false)}
            disabled={busy}
            aria-label="Decline call"
            style={{
              border: 0,
              borderRadius: 12,
              padding: "13px 20px",
              background: "#dc2626",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <PhoneOff size={18} /> Decline
          </button>

          <button
            type="button"
            onClick={() => void respond(true)}
            disabled={busy}
            aria-label="Accept call"
            style={{
              border: 0,
              borderRadius: 12,
              padding: "13px 20px",
              background: "#0B7A42",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <Phone size={18} /> {busy ? "Please wait..." : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
