// Supabase Edge Function: groq-proxy
// ─────────────────────────────────────────────────────────────
// Proxies requests to Groq's LLM and Whisper APIs so the
// GROQ_API_KEY is never bundled in the client.
//
// Deploy:    supabase functions deploy groq-proxy
// Set secret: supabase secrets set GROQ_API_KEY=<your-key>
//
// Request body shape:
//   {
//     "kind": "chat" | "transcribe",
//     "messages": [...],         // for kind: "chat"
//     "audioBase64": "..."       // for kind: "transcribe"
//     "language": "en"           // for kind: "transcribe"
//   }
//
// Response:  same shape Groq returns, or { error: "..." } on failure
// ─────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
if (!GROQ_API_KEY) {
  console.error("[groq-proxy] GROQ_API_KEY secret is not set");
}

const CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  if (!GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: GROQ_API_KEY missing" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await req.json();
    const { kind } = body;

    if (kind === "chat") {
      const { messages, model = "llama-3.1-8b-instant", temperature = 0.3, max_tokens = 1024 } = body;
      const upstream = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, temperature, max_tokens }),
      });
      const data = await upstream.json();
      return new Response(JSON.stringify(data), {
        status: upstream.status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (kind === "transcribe") {
      const { audioBase64, language = "en", model = "whisper-large-v3", mimeType = "audio/webm" } = body;
      if (!audioBase64) {
        return new Response(
          JSON.stringify({ error: "audioBase64 is required for transcribe" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
        );
      }
      // Decode base64 → Uint8Array → Blob for multipart upload
      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mimeType });

      const form = new FormData();
      form.append("file", blob, "recording.webm");
      form.append("model", model);
      form.append("language", language);

      const upstream = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: form,
      });
      const data = await upstream.json();
      return new Response(JSON.stringify(data), {
        status: upstream.status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: `Unknown kind: ${kind}` }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }
});
