// Supabase Edge Function: /functions/v1/chat
// ─────────────────────────────────────────────────────────────
// User-Scoped Health Assistant Backend with Gemini Function Calling
//
// 1. Authenticates user via Supabase Auth (JWT header).
// 2. Executes DB queries ONLY via authenticated Supabase client (enforces RLS).
// 3. Calls Gemini API using server-side GEMINI_API_KEY (never leaked to frontend).
// 4. Implements multi-turn tool calling loop with 6 core health tools.
// 5. Persists conversation messages in chat_messages table.
//
// Deploy:    supabase functions deploy chat
// Set secret: supabase secrets set GEMINI_API_KEY=<your-key>
// ─────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 6 Core Gemini Tool Definitions
const GEMINI_TOOLS = [
  {
    name: "search_health_history",
    description: "Search the authenticated user's chronological health records and past consultations by keyword and date range.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Search keyword (e.g. 'blood pressure', 'fever', 'Dr. Sharma')" },
        start_date: { type: "STRING", description: "Start date in YYYY-MM-DD format" },
        end_date: { type: "STRING", description: "End date in YYYY-MM-DD format" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_health_records",
    description: "Retrieve recent health records optionally filtered by record_type (vitals, consultation, lab, prescription).",
    parameters: {
      type: "OBJECT",
      properties: {
        record_type: { type: "STRING", description: "vitals, consultation, lab, prescription, or all" },
        limit: { type: "NUMBER", description: "Max records (default 10)" },
      },
    },
  },
  {
    name: "get_measurement_history",
    description: "Retrieve numerical measurements (blood_pressure, blood_glucose, weight, heart_rate) for trend comparison.",
    parameters: {
      type: "OBJECT",
      properties: {
        type: { type: "STRING", description: "blood_pressure, blood_glucose, weight, or heart_rate" },
        period: { type: "STRING", description: "1_month, 3_months, 6_months, 1_year, or all" },
      },
      required: ["type"],
    },
  },
  {
    name: "get_medications",
    description: "Retrieve user's active prescribed medications, dosage details, and medication records.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_doctor_visits",
    description: "Retrieve past clinical doctor visits, consultation notes, and upcoming appointments.",
    parameters: {
      type: "OBJECT",
      properties: {
        status: { type: "STRING", description: "past, upcoming, or all" },
      },
    },
  },
  {
    name: "create_reminder",
    description: "Create a health reminder (medication, vitals check, or appointment) on user's schedule.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Reminder description" },
        date: { type: "STRING", description: "YYYY-MM-DD" },
        time: { type: "STRING", description: "HH:MM format" },
        category: { type: "STRING", description: "Medication, Measurement, Appointment, General" },
      },
      required: ["title"],
    },
  },
];

const SYSTEM_INSTRUCTION = `You are "Aarogya", an intelligent, empathetic Personal Health Assistant for the user's personal health timeline.
Your purpose is to help the user understand, organize, and prepare information from their personal health history.

You can help with:
- Understanding their recorded health records
- Summarizing medical history and finding trends
- Comparing previous and recent measurements
- Preparing for doctor visits
- Answering questions about recorded medications and appointments
- Creating reminders
- Asking clarifying questions when information or time periods are missing

IMPORTANT RULES:
1. You are NOT a general-purpose chatbot. Refuse unrelated questions (such as pasta recipes, general coding, or movie trivia).
2. Do not diagnose medical conditions or alter prescriptions. Recommend consulting their physician.
3. Do not invent health records. Always call the appropriate tool when user asks about their history or measurements.
4. When comparing trends, ask clarifying questions if the time window (e.g. 1 month vs 3 months) is ambiguous.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  // 1. Authenticate Caller with Supabase Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const supabaseUserClient = createClient(
    SUPABASE_URL ?? "",
    SUPABASE_ANON_KEY ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized Supabase user" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const userId = user.id;

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY secret is not configured on server" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { messages = [], sessionId = null, targetLanguage = "en" } = await req.json();

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Convert incoming chat history into Gemini contents format
    const contents = messages.map((m: any) => ({
      role: m.sender === "ai" || m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text || m.content || "" }],
    }));

    const toolCallsExecuted: any[] = [];
    const modelName = "gemini-2.5-flash";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    let turnCount = 0;
    const MAX_TURNS = 4;
    let finalAiText = "";

    // Multi-turn Function Calling Loop
    while (turnCount < MAX_TURNS) {
      turnCount++;

      const payload = {
        systemInstruction: {
          parts: [{ text: `${SYSTEM_INSTRUCTION}\nTarget Response Language: ${targetLanguage}.` }],
        },
        contents,
        tools: [{ functionDeclarations: GEMINI_TOOLS }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      };

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!geminiRes.ok) {
        const errTxt = await geminiRes.text();
        throw new Error(`Gemini API Error (${geminiRes.status}): ${errTxt}`);
      }

      const geminiJson = await geminiRes.json();
      const candidate = geminiJson.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      // Check if Gemini requested a function call
      const functionCallPart = parts.find((p: any) => p.functionCall);

      if (functionCallPart) {
        const { name, args } = functionCallPart.functionCall;
        toolCallsExecuted.push({ tool: name, args });

        // Execute tool securely with user's authenticated Supabase client (RLS enforced)
        const toolResult = await executeTool(name, args, userId, supabaseUserClient);

        // Append assistant's function call message to history
        contents.push({
          role: "model",
          parts: [{ functionCall: { name, args } }],
        });

        // Append function response message
        contents.push({
          role: "function",
          parts: [{
            functionResponse: {
              name,
              response: { output: toolResult },
            },
          }],
        });
      } else {
        // Model provided final text
        const textPart = parts.find((p: any) => p.text);
        finalAiText = textPart?.text || "I have analyzed your health records.";
        break;
      }
    }

    // Persist messages if sessionId provided
    if (sessionId) {
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg && (lastUserMsg.sender === "user" || lastUserMsg.role === "user")) {
        await supabaseUserClient.from("chat_messages").insert([
          {
            session_id: sessionId,
            user_id: userId,
            role: "user",
            content: lastUserMsg.text || lastUserMsg.content,
          },
        ]);
      }

      await supabaseUserClient.from("chat_messages").insert([
        {
          session_id: sessionId,
          user_id: userId,
          role: "assistant",
          content: finalAiText,
          metadata: { toolCalls: toolCallsExecuted },
        },
      ]);
    }

    return new Response(
      JSON.stringify({
        response: finalAiText,
        toolCalls: toolCallsExecuted,
        sessionId,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[chat-edge-function] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});

// Helper: execute tool with user-scoped query
async function executeTool(name: string, args: any, userId: string, client: any) {
  switch (name) {
    case "search_health_history": {
      const { query = "", start_date, end_date } = args;
      let q = client.from("health_records").select("*").eq("user_id", userId).order("recorded_at", { ascending: false });
      if (start_date) q = q.gte("recorded_at", `${start_date}T00:00:00.000Z`);
      if (end_date) q = q.lte("recorded_at", `${end_date}T23:59:59.999Z`);
      const { data } = await q.limit(20);
      const filtered = (data || []).filter((r: any) => {
        const str = `${r.title || ""} ${r.notes || ""}`.toLowerCase();
        return str.includes(query.toLowerCase());
      });
      return { found: filtered.length, records: filtered.slice(0, 10) };
    }

    case "get_health_records": {
      const { record_type, limit = 10 } = args;
      let q = client.from("health_records").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(limit);
      if (record_type && record_type !== "all") q = q.eq("record_type", record_type);
      const { data } = await q;
      return { records: data || [] };
    }

    case "get_measurement_history": {
      const { type = "blood_pressure", period = "3_months" } = args;
      const now = new Date();
      let start = new Date();
      if (period === "1_month") start.setMonth(now.getMonth() - 1);
      else if (period === "3_months") start.setMonth(now.getMonth() - 3);
      else if (period === "6_months") start.setMonth(now.getMonth() - 6);
      else if (period === "1_year") start.setFullYear(now.getFullYear() - 1);
      else start = new Date(0);

      const { data } = await client
        .from("health_records")
        .select("*")
        .eq("user_id", userId)
        .gte("recorded_at", start.toISOString())
        .order("recorded_at", { ascending: true });

      const relevant = (data || []).filter((r: any) => {
        const text = `${r.title || ""} ${r.notes || ""}`.toLowerCase();
        if (type === "blood_pressure") return r.record_type === "vitals" || /bp|blood pressure|\d{2,3}\/\d{2,3}/i.test(text);
        if (type === "blood_glucose") return /sugar|glucose|fasting/i.test(text);
        if (type === "weight") return /weight|kg/i.test(text);
        return true;
      });

      return { type, period, count: relevant.length, readings: relevant };
    }

    case "get_medications": {
      const { data: profile } = await client.from("profiles").select("current_medications").eq("id", userId).single();
      const { data: rx } = await client.from("health_records").select("*").eq("user_id", userId).eq("record_type", "prescription").limit(10);
      return { currentMedications: profile?.current_medications || [], recordedPrescriptions: rx || [] };
    }

    case "get_doctor_visits": {
      const { data: apts } = await client.from("appointments").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(10);
      const { data: consults } = await client.from("health_records").select("*").eq("user_id", userId).eq("record_type", "consultation").limit(10);
      return { appointments: apts || [], consultations: consults || [] };
    }

    case "create_reminder": {
      const { title, date, time, category = "General" } = args;
      const { data, error } = await client.from("reminders").insert([{
        user_id: userId,
        title,
        date: date || new Date().toISOString().split("T")[0],
        time: time || "09:00",
        category,
        completed: false,
      }]).select().single();
      if (error) return { error: error.message };
      return { success: true, reminder: data };
    }

    default:
      return { error: `Tool ${name} not found` };
  }
}
