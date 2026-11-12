"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  AudioConference,
} from "@livekit/components-react";
import { supabase } from "@/lib/supabase";

type CallCredentials = {
  token: string;
  server_url: string;
  room_name: string;
  call_type: "audio" | "video";
};

function CallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callId = searchParams.get("id");

  const [credentials, setCredentials] = useState<CallCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [callError, setCallError] = useState("");
  const [callStatus, setCallStatus] = useState("Connecting to call...");
  const [loadingEnd, setLoadingEnd] = useState(false);
  const [ended, setEnded] = useState(false);
  const finishing = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function returnToMessagesSoon() {
    if (redirectTimer.current) return;

    redirectTimer.current = setTimeout(() => {
      router.replace("/messages/");
    }, 900);
  }

  useEffect(() => {
    let active = true;

    async function prepareCall() {
      if (!callId) {
        setError("No call was selected.");
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login/");
        return;
      }

      const { data, error: tokenError } =
        await supabase.functions.invoke("livekit-token", {
          body: { call_id: callId },
        });

      if (!active) return;

      if (tokenError || !data?.token || !data?.server_url) {
        setError(
          data?.error ||
          tokenError?.message ||
          "Could not connect to the call. Please try again."
        );
        setLoading(false);
        return;
      }

      setCredentials(data as CallCredentials);
      setLoading(false);
    }

    void prepareCall();

    return () => {
      active = false;
    };
  }, [callId, router]);

  useEffect(() => {
    if (!callId) return;

    let active = true;

    const channel = supabase
      .channel(`call-status:${callId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "call_sessions",
          filter: `id=eq.${callId}`,
        },
        (payload) => {
          const updated = payload.new as { status?: string };

          if (
            active &&
            ["declined", "cancelled", "ended", "missed"].includes(
              updated.status || ""
            )
          ) {
            setEnded(true);
            setCallStatus("Call ended");
            returnToMessagesSoon();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [callId, router]);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
        redirectTimer.current = null;
      }
    };
  }, []);

  async function finishCall() {
    if (!callId || finishing.current) return;

    finishing.current = true;
    setLoadingEnd(true);
    setCallError("");

    try {
      const { error: finishError } = await supabase.rpc(
        "finish_workyard_call",
        { p_call_id: callId }
      );

      if (finishError) throw finishError;

      setEnded(true);
      setCallStatus("Call ended");
      returnToMessagesSoon();
    } catch (finishError) {
      finishing.current = false;
      setLoadingEnd(false);
      setCallError(
        finishError instanceof Error
          ? finishError.message
          : "WORKYARD could not confirm that the call ended. Please try again."
      );
    }
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        Preparing your WORKYARD call...
      </main>
    );
  }

  if (error || !credentials) {
    return (
      <main className="profile-page">
        <div className="profile-card">
          <h1>Unable to join call</h1>
          <p className="auth-message">{error || "Call details are unavailable."}</p>
          <button className="btn" onClick={() => router.replace("/messages/")}>
            Back to messages
          </button>
        </div>
      </main>
    );
  }

  if (ended) {
    return (
      <main className="dashboard-loading">
        This call has ended. Returning to messages...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "#fff",
        padding: 12,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "8px 4px 14px",
          }}
        >
          <div>
            <strong>
              WORKYARD {credentials.call_type === "video" ? "Video" : "Audio"} Call
            </strong>
            <p
              aria-live="polite"
              style={{ margin: "4px 0 0", color: "#cbd5e1", fontSize: 12 }}
            >
              {callStatus}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void finishCall()}
            disabled={loadingEnd}
            style={{
              border: 0,
              borderRadius: 10,
              padding: "11px 16px",
              background: loadingEnd ? "#7f1d1d" : "#dc2626",
              color: "#fff",
              fontWeight: 700,
              cursor: loadingEnd ? "wait" : "pointer",
              opacity: loadingEnd ? 0.8 : 1,
            }}
          >
            {loadingEnd ? "Ending..." : "End call"}
          </button>
        </div>

        {callError && (
          <div
            role="alert"
            style={{
              margin: "0 0 12px",
              padding: "11px 13px",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              background: "#450a0a",
              color: "#fee2e2",
              fontSize: 14,
            }}
          >
            Call issue: {callError}
          </div>
        )}

        <div
          data-lk-theme="default"
          style={{
            height: "calc(100vh - 100px)",
            minHeight: 450,
            borderRadius: 14,
            overflow: "hidden",
            background: "#1f2937",
          }}
        >
          <LiveKitRoom
            token={credentials.token}
            serverUrl={credentials.server_url}
            connect={true}
            audio={true}
            video={credentials.call_type === "video"}
            onConnected={() => {
              setCallStatus("Connected");
              setCallError("");
            }}
            onDisconnected={() => {
              setCallStatus("Disconnected · closing call...");
              void finishCall();
            }}
            onError={(callIssue) => {
              setCallError(callIssue.message);
              setCallStatus("Call connection issue");
            }}
            style={{ height: "100%" }}
          >
            {credentials.call_type === "video" ? (
              <VideoConference />
            ) : (
              <AudioConference />
            )}
          </LiveKitRoom>
        </div>
      </div>
    </main>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={<main className="dashboard-loading">Loading call...</main>}>
      <CallContent />
    </Suspense>
  );
}
