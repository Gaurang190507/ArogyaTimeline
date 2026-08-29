import { mockAiConversations } from '../data/mockAiResponses';

const GROQ_PROXY_URL = import.meta.env.VITE_GROQ_PROXY_URL;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; // fallback if no proxy

export const aiService = {
  /**
   * Ask the AI assistant a question.
   * Tries Groq first; falls back to deterministic mock responses if
   * the API key is missing or the request fails — so the prototype
   * works offline during hackathon demos.
   *
   * @param {string} query — the user's natural-language question
   * @param {Array} healthRecords — the current user's records array
   * @returns {Promise<object>} — { id, userQuery, aiResponse, disclaimer, followUp? }
   */
  async askAssistant(query, healthRecords = []) {
    const cleanQuery = query.toLowerCase();

    // Try real AI call first (only when key is configured or proxy is set)
    if (GROQ_PROXY_URL || (GROQ_API_KEY && GROQ_API_KEY !== 'your-groq-api-key-here')) {
      try {
        return await this._askGroq(query, healthRecords);
      } catch (err) {
        console.warn('[aiService] Groq request failed, falling back to mock:', err.message);
      }
    }

    // ── Fallback: deterministic mock responses ──
    const matchedPreset = mockAiConversations.find(c =>
      cleanQuery.includes(c.userQuery.toLowerCase().slice(0, 15)) ||
      c.userQuery.toLowerCase().includes(cleanQuery.slice(0, 15))
    );

    if (matchedPreset) return matchedPreset;

    if (cleanQuery.includes('bp') || cleanQuery.includes('blood pressure') || cleanQuery.includes('pressure')) {
      const bpRecords = healthRecords.filter(r => r.type === 'blood_pressure');
      const latest = bpRecords[0];
      return {
        id: `conv_${Date.now()}`,
        userQuery: query,
        aiResponse: `You have **${bpRecords.length} recorded blood pressure readings** in your health timeline.\n\nThe most recent reading is **${latest ? `${latest.metadata?.systolic}/${latest.metadata?.diastolic} mmHg` : '128/82 mmHg'}** recorded on ${latest ? latest.date : 'August 28, 2026'}.`,
        disclaimer: "These records alone do not establish a diagnosis. Discuss persistent or concerning readings with a qualified healthcare professional.",
        followUp: {
          question: "Would you like more details?",
          options: ["Show Blood Pressure Chart", "Log New BP Reading", "Prepare Doctor Note"]
        }
      };
    }

    if (cleanQuery.includes('doctor') || cleanQuery.includes('visit') || cleanQuery.includes('consult')) {
      return {
        id: `conv_${Date.now()}`,
        userQuery: query,
        aiResponse: "Your last consultation was with **Dr. Sharma (General Physician)** on **August 18, 2026** for mild gastritis.\n\nYour next scheduled appointment is on **September 10, 2026 at 10:30 AM** at ABC Hospital, Indiranagar.",
        disclaimer: "Make sure to confirm your appointment time with the clinic reception before visiting.",
        followUp: {
          question: "Would you like me to compile a summary of your recent vitals for Dr. Sharma?",
          options: ["Yes, generate summary", "View appointment details", "Reschedule visit"]
        }
      };
    }

    if (cleanQuery.includes('medicine') || cleanQuery.includes('drug') || cleanQuery.includes('pill') || cleanQuery.includes('tablet')) {
      return {
        id: `conv_${Date.now()}`,
        userQuery: query,
        aiResponse: "Your active medications list includes:\n1. **Pantoprazole 40mg** — 1 tab before breakfast daily\n2. **Vitamin D3 60,000 IU** — 1 cap weekly with milk\n3. **Cetirizine 10mg** — As needed (SOS).",
        disclaimer: "Always consult your physician or pharmacist before altering dosages or stopping any medication."
      };
    }

    // default
    return {
      id: `conv_${Date.now()}`,
      userQuery: query,
      aiResponse: `Based on your recorded health memory, I found **${healthRecords.length} health events** including your vitals, doctor visits, and recent lab reports.\n\nEverything is up to date. Is there a specific vital, symptom, or doctor visit you'd like me to look into?`,
      disclaimer: "AI-generated summaries are informational and should be verified with a qualified healthcare professional.",
      followUp: {
        question: "Quick actions you can take:",
        options: [
          "Summarize my health records from this month",
          "Prepare for my next doctor visit",
          "Show my health timeline"
        ]
      }
    };
  },

  /**
   * Real Groq LLM call. Constructs a context-rich prompt from the
   * health records and sends it to the chat completions endpoint.
   */
  async _askGroq(query, healthRecords) {
    const recentRecords = healthRecords
      .slice(0, 5)
      .map(r => `- ${r.type}: ${r.title} on ${r.date} — ${JSON.stringify(r.metadata)}`)
      .join('\n');

    const systemPrompt = `You are "Aarogya", a friendly personal health memory assistant. You have access to the user's health records. Answer concisely and suggest next actions. Always include a disclaimer. Never provide medical advice — always recommend consulting a qualified healthcare professional.

User's recent health records:
${recentRecords || '(no records on file)'}

Respond in JSON with these exact fields: "aiResponse" (markdown string), "disclaimer" (string), "followUp" (object with "question" string and "options" array of 3 strings).`;

    const chatPayload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.5,
      max_tokens: 1024,
    };

    const url = GROQ_PROXY_URL || 'https://api.groq.com/openai/v1/chat/completions';
    const headers = GROQ_PROXY_URL
      ? { 'Content-Type': 'application/json' }
      : { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' };
    const body = GROQ_PROXY_URL
      ? JSON.stringify({ kind: 'chat', ...chatPayload })
      : JSON.stringify({ model: 'llama-3.1-8b-instant', ...chatPayload });

    const response = await fetch(url, { method: 'POST', headers, body });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const rawContent = json.choices?.[0]?.message?.content || '';

    // Parse the JSON response the model was asked to return
    let parsed;
    try {
      // Strip markdown code fences if the model included them
      const cleaned = rawContent.replace(/```(?:json)?\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // If JSON failed, just return raw text
      parsed = {
        aiResponse: rawContent,
        disclaimer: "AI-generated response. Verify with a qualified healthcare professional.",
      };
    }

    return {
      id: `conv_${Date.now()}`,
      userQuery: query,
      aiResponse: parsed.aiResponse || '',
      disclaimer: parsed.disclaimer || '',
      followUp: parsed.followUp,
    };
  },

  async generateHealthStorySummary(stats, records) {
    await new Promise(r => setTimeout(r, 700));
    return {
      title: "Health Story Journey: Jan – Aug 2026",
      summary: "Your health records span several key moments this year, including doctor visits, lab reports, and ongoing vital tracking.",
      recommendation: "Continue logging your vitals regularly and maintain upcoming follow-up appointments.",
      generatedAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  }
};