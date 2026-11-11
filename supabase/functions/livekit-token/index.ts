import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { AccessToken } from "npm:livekit-server-sdk@2.19.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return response({ error: "Method not allowed" }, 405);
  }

  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return response({ error: "Sign-in required" }, 401);
    }

    const jwt = authorization.slice(7);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKeys = JSON.parse(
      Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}",
    );
    const supabaseKey =
      Deno.env.get("SUPABASE_ANON_KEY") ?? publishableKeys.default;

    const livekitUrl = Deno.env.get("LIVEKIT_URL");
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");

    if (
      !supabaseUrl || !supabaseKey ||
      !livekitUrl || !livekitApiKey || !livekitApiSecret
    ) {
      console.error("A required server configuration value is missing");
      return response({ error: "Call service is not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    });

    // Validate the actual Supabase user, not a client-supplied identity.
    const { data: authData, error: authError } =
      await supabase.auth.getUser(jwt);

    if (authError || !authData.user) {
      return response({ error: "Invalid or expired sign-in session" }, 401);
    }

    const body = await req.json();
    const callId = body?.call_id;

    if (
      typeof callId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callId)
    ) {
      return response({ error: "A valid call_id is required" }, 400);
    }

    // This SECURITY DEFINER RPC checks membership, call status and suspension.
    const { data: accessRows, error: accessError } = await supabase.rpc(
      "get_workyard_call_access",
      { p_call_id: callId },
    );

    if (accessError || !accessRows || accessRows.length !== 1) {
      console.warn("Call access denied", {
        userId: authData.user.id,
        callId,
        reason: accessError?.message ?? "No access row",
      });
      return response({ error: "You cannot join this call" }, 403);
    }

    const access = accessRows[0];

    if (!access.room_name || access.call_status === "ended") {
      return response({ error: "This call is no longer available" }, 409);
    }

    const token = new AccessToken(
      livekitApiKey,
      livekitApiSecret,
      {
        identity: authData.user.id,
        ttl: "10m",
      },
    );

    token.addGrant({
      roomJoin: true,
      room: access.room_name,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwtToken = await token.toJwt();

    return response({
      token: jwtToken,
      server_url: livekitUrl,
      room_name: access.room_name,
      call_type: access.call_type,
    });
  } catch (error) {
    console.error("LiveKit token function error:", error);
    return response({ error: "Could not prepare the call" }, 500);
  }
});
