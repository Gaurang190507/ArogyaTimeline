import { mockAiConversations } from '../data/mockAiResponses';
import { LANG_NAMES } from './translationService';
import { checkHealthIntent, GEMINI_HEALTH_TOOLS, executeHealthTool } from './healthAssistantTools';
import { chatSessionService } from './chatSessionService';
import { supabase } from './supabaseClient';

const getEnvKey = (name) => {
  const val = import.meta.env[name];
  if (!val || val.includes('your-') || val === 'your-groq-api-key-here') return '';
  return val.trim();
};

const getEffectiveProxyUrl = () => {
  const url = import.meta.env.VITE_GROQ_PROXY_URL;
  if (!url || url.includes('your-project') || url.includes('example.com')) return '';
  return url.trim();
};

/**
 * Robustly normalizes strings (comma-delimited, JSON, etc.), arrays, or objects into an array
 */
const normalizeList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed.toLowerCase() === 'none' || trimmed.toLowerCase() === 'nil' || trimmed.toLowerCase() === 'null') {
      return [];
    }
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeList(parsed);
      } catch (_) {}
    }
    return trimmed.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof val === 'object') {
    return Object.values(val);
  }
  return [val];
};


export const aiService = {
  /**
   * Retrieve active AI configuration from localStorage or environment
   */
  getAiConfig() {
    const customKey = (localStorage.getItem('ai_api_key') || '').trim();
    const customProvider = localStorage.getItem('ai_provider') || 'auto';

    const envGroqKey = getEnvKey('VITE_GROQ_API_KEY');
    const envGeminiKey = getEnvKey('VITE_GEMINI_API_KEY');
    const proxyUrl = getEffectiveProxyUrl();

    let apiKey = customKey || envGroqKey || envGeminiKey || '';
    let provider = customProvider;

    if (provider === 'auto') {
      if (apiKey.startsWith('gsk_')) provider = 'groq';
      else if (apiKey.startsWith('AIza')) provider = 'gemini';
      else if (envGeminiKey && !envGroqKey) provider = 'gemini';
      else provider = 'gemini'; // default preferred provider
    }

    return {
      apiKey,
      provider,
      proxyUrl,
      isConfigured: Boolean(apiKey || proxyUrl),
      source: customKey ? 'custom' : (envGroqKey || envGeminiKey ? 'env' : proxyUrl ? 'proxy' : 'none'),
    };
  },

  /**
   * Set custom API key in browser storage
   */
  setAiConfig(apiKey, provider = 'auto') {
    if (apiKey) {
      localStorage.setItem('ai_api_key', apiKey.trim());
      localStorage.setItem('ai_provider', provider);
    } else {
      localStorage.removeItem('ai_api_key');
      localStorage.removeItem('ai_provider');
    }
  },

  /**
   * Main query method.
   * Architecture:
   * 1. Layer 1 Intent Gating: refuses out-of-scope queries (recipes, coding, etc.).
   * 2. Edge Function Proxy (when deployed): keeps API key server-side.
   * 3. Multi-turn Gemini Function Calling: queries DB with user's authenticated session (RLS).
   * 4. Context-aware Local Health Analysis Engine (Fallback).
   *
   * @param {string} query
   * @param {Array} healthRecords
   * @param {object} userProfile
   * @param {string} targetLanguage - Language code (en, hi, mr, bn, ta, te, kn, ml, gu, pa)
   * @param {string} sessionId - Active chat session ID for message persistence
   * @param {Array} conversationHistory - Previous messages in session
   */
  async askAssistant(
    query,
    healthRecords = [],
    userProfile = null,
    targetLanguage = 'en',
    sessionId = null,
    conversationHistory = []
  ) {
    // ── Layer 1: Application-level Intent Gating ──
    const intent = checkHealthIntent(query);
    if (!intent.isAllowed) {
      const refusalMsg = {
        id: `refusal_${Date.now()}`,
        userQuery: query,
        lang: targetLanguage,
        aiResponse: intent.refusalText,
        isRefusal: true,
        toolCalls: [],
        disclaimer: 'Aarogya AI is specialized strictly in personal health management.',
        followUp: {
          question: targetLanguage === 'hi' ? 'आप अपने स्वास्थ्य रिकॉर्ड के बारे में क्या जांचना चाहते हैं?' : 'How can I assist with your personal health records?',
          options: targetLanguage === 'hi'
            ? ['रक्तचाप का रुझान जांचें', 'मेरी दवाइयां दिखाएं', 'डॉक्टर विजिट की तैयारी करें']
            : ['Check blood pressure trend', 'Review my medications', 'Prepare for doctor visit'],
        },
      };

      if (sessionId) {
        await chatSessionService.addMessage(sessionId, 'user', query).catch(() => {});
        await chatSessionService.addMessage(sessionId, 'assistant', intent.refusalText, { isRefusal: true }).catch(() => {});
      }

      return refusalMsg;
    }

    const config = this.getAiConfig();

    // ── Try Supabase Edge Function if available ──
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const edgeRes = await fetch(`${supabaseUrl}/functions/v1/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              messages: [...conversationHistory, { role: 'user', content: query }],
              sessionId,
              targetLanguage,
            }),
          });

          if (edgeRes.ok) {
            const edgeData = await edgeRes.json();
            return {
              id: `edge_${Date.now()}`,
              userQuery: query,
              lang: targetLanguage,
              aiResponse: edgeData.response,
              toolCalls: edgeData.toolCalls || [],
              disclaimer: 'Personal Health Assistant grounded in your Supabase records.',
            };
          }
        }
      } catch (e) {
        // Edge function not deployed or network error; fall through to direct model or local engine
      }
    }

    // ── Direct Live LLM with Gemini Function Calling ──
    if (config.isConfigured) {
      try {
        if (config.provider === 'gemini') {
          return await this._askGeminiWithTools(
            query,
            userProfile,
            config.apiKey,
            targetLanguage,
            sessionId,
            conversationHistory
          );
        } else {
          return await this._askGroq(query, healthRecords, userProfile, config.apiKey, config.proxyUrl, targetLanguage);
        }
      } catch (err) {
        console.warn('[aiService] Live AI request error, falling back:', err);
        // If Gemini API call fails, fall through to intelligent local engine
      }
    }

    // ── Context-aware Local Health Analysis Engine (Fallback) ──
    const localResult = this._localHealthAnalysis(query, healthRecords, userProfile, targetLanguage);

    if (sessionId) {
      await chatSessionService.addMessage(sessionId, 'user', query).catch(() => {});
      await chatSessionService.addMessage(sessionId, 'assistant', localResult.aiResponse, { toolCalls: localResult.toolCalls }).catch(() => {});
    }

    return localResult;
  },

  /**
   * Multi-turn Gemini Function Calling Execution
   * Passes 6 core health tools, executes tool calls against Supabase (enforcing RLS),
   * loops back function responses to Gemini, and persists messages in chat_messages.
   */
  async _askGeminiWithTools(
    query,
    userProfile,
    apiKey,
    targetLanguage = 'en',
    sessionId = null,
    conversationHistory = []
  ) {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || userProfile?.id || 'local_user';

    const targetLangName = LANG_NAMES[targetLanguage] || 'English';

    const systemInstructionText = `You are "Aarogya", an intelligent, empathetic Personal Health Assistant for the user's personal health timeline.
Your purpose is to help the user understand, organize, and prepare information from their personal health history.

You can help with:
- Understanding their health records
- Summarizing medical history and finding trends
- Comparing previous and recent measurements
- Preparing for doctor visits
- Finding information in uploaded reports
- Answering questions about recorded medications and appointments
- Creating reminders
- Asking clarifying questions when information or time periods are missing

IMPORTANT RULES:
1. You are NOT a general-purpose chatbot. Refuse unrelated questions (such as pasta recipes, general coding, or movie trivia).
2. Do not diagnose medical conditions. Do not invent health records. Use only information retrieved from the user's records via tools.
3. If the user asks about their vitals, BP, weight, sugar, medications, or doctor visits, CALL THE APPROPRIATE TOOL.
4. When the user asks to compare or check trends, ask clarifying questions if the period is ambiguous (e.g. 1 month vs 3 months).
5. Format your final answer with clear markdown headers (e.g. "### 🩸 Blood Pressure Summary"), high-contrast bold measurement badges (e.g. "**120/80 mmHg**"), and callouts:
   - "✅ **Clinical Assessment:** ..." for normal findings
   - "⚠️ **Attention:** ..." for elevated findings
   - "💡 **Recommendation:** ..." for practical lifestyle or monitoring tips
6. Target Language: Respond in ${targetLangName} (${targetLanguage}).`;

    // Prepare contents history for Gemini
    const contents = conversationHistory.slice(-8).map((m) => ({
      role: m.sender === 'ai' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    contents.push({
      role: 'user',
      parts: [{ text: query }],
    });

    const toolCallsExecuted = [];
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let finalAiText = '';

    for (const modelName of modelsToTry) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        let turnCount = 0;
        const MAX_TURNS = 4;

        while (turnCount < MAX_TURNS) {
          turnCount++;

          const payload = {
            systemInstruction: {
              parts: [{ text: systemInstructionText }],
            },
            contents,
            tools: [{ functionDeclarations: GEMINI_HEALTH_TOOLS }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          };

          const res = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errTxt = await res.text();
            throw new Error(`HTTP ${res.status}: ${errTxt}`);
          }

          const json = await res.json();
          const candidate = json.candidates?.[0];
          const parts = candidate?.content?.parts || [];

          // Check if Gemini invoked a function call
          const functionCallPart = parts.find((p) => p.functionCall);

          if (functionCallPart) {
            const { name, args } = functionCallPart.functionCall;
            toolCallsExecuted.push({ tool: name, args });

            // Execute the tool against Supabase with the active authenticated session
            let toolOutput;
            try {
              toolOutput = await executeHealthTool(name, args, userId, supabase);
            } catch (toolErr) {
              toolOutput = { error: toolErr.message };
            }

            // Append assistant function call to history
            contents.push({
              role: 'model',
              parts: [{ functionCall: { name, args } }],
            });

            // Append tool response
            contents.push({
              role: 'function',
              parts: [
                {
                  functionResponse: {
                    name,
                    response: { output: toolOutput },
                  },
                },
              ],
            });
          } else {
            // Received final text response
            const textPart = parts.find((p) => p.text);
            finalAiText = textPart?.text || 'I have analyzed your health records.';
            break;
          }
        }

        if (finalAiText) break;
      } catch (err) {
        console.warn(`[aiService] Error with ${modelName}:`, err.message);
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          throw err;
        }
      }
    }

    // Persist messages in chat_messages table if session active
    if (sessionId) {
      await chatSessionService.addMessage(sessionId, 'user', query).catch(() => {});
      await chatSessionService.addMessage(sessionId, 'assistant', finalAiText, { toolCalls: toolCallsExecuted }).catch(() => {});
    }

    return {
      id: `gemini_${Date.now()}`,
      userQuery: query,
      lang: targetLanguage,
      aiResponse: finalAiText,
      toolCalls: toolCallsExecuted,
      disclaimer: targetLanguage === 'hi' ? 'आरोग्य एआई केवल व्यक्तिगत स्वास्थ्य रिकॉर्ड ट्रैकिंग के लिए है।' : 'Aarogya AI is grounded in your personal health timeline. Consult your doctor for medical advice.',
      followUp: {
        question: targetLanguage === 'hi' ? 'सुझाए गए अगले कदम:' : 'Suggested next actions:',
        options: targetLanguage === 'hi'
          ? ['रुझान ग्राफ देखें', 'दवाओं की जांच करें', 'डॉक्टर का सारांश बनाएं']
          : ['Check measurement trends', 'Review medication list', 'Prepare consultation summary'],
      },
    };
  },

  /**
   * Call Groq Cloud API (Llama-3.1-8b-instant)
   */
  async _askGroq(query, healthRecords, userProfile, apiKey, proxyUrl, targetLanguage = 'en') {
    const systemPrompt = this._buildSystemPrompt(healthRecords, userProfile, targetLanguage);

    const chatPayload = {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    };

    const url = proxyUrl || 'https://api.groq.com/openai/v1/chat/completions';
    const headers = proxyUrl
      ? { 'Content-Type': 'application/json' }
      : {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(proxyUrl ? { kind: 'chat', ...chatPayload } : chatPayload),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      let errMsg = `HTTP ${res.status}`;
      try {
        const json = JSON.parse(errBody);
        errMsg = json.error?.message || errMsg;
      } catch (_) {}
      throw new Error(errMsg);
    }

    const json = await res.json();
    const rawContent = json.choices?.[0]?.message?.content || '';
    return this._parseJsonResponse(rawContent, query, targetLanguage);
  },

  /**
   * Build structured medical context for fallback Groq prompts
   */
  _buildSystemPrompt(healthRecords = [], userProfile = null, targetLanguage = 'en') {
    const recordSummaries = (healthRecords || [])
      .slice(0, 15)
      .map((r) => {
        const date = r.date || r.recorded_at?.split('T')[0] || 'recent';
        const meta = r.metadata ? JSON.stringify(r.metadata) : '';
        return `• [${r.type || 'record'}] ${r.title || ''} on ${date}: ${r.notes || r.description || ''} ${meta}`;
      })
      .join('\n');

    let profileContext = '';
    if (userProfile) {
      profileContext = `
Patient Demographics & Medical History:
- Name: ${userProfile.name || 'Patient'}
- Age: ${userProfile.dateOfBirth || userProfile.age || 'N/A'}
- Sex: ${userProfile.sex || 'N/A'}, Blood Group: ${userProfile.bloodGroup || 'N/A'}
- Known Conditions: ${JSON.stringify(userProfile.medicalBackground?.existingConditions || userProfile.conditions || 'None')}
- Allergies: ${JSON.stringify(userProfile.medicalBackground?.allergies || userProfile.allergies || 'None')}
- Current Medications: ${JSON.stringify(userProfile.currentMedications || 'None')}
`;
    }

    const targetLangName = LANG_NAMES[targetLanguage] || 'English';

    return `You are "Aarogya", an intelligent, empathetic personal health assistant for the user's personal health timeline.
You have direct access to the user's real medical history, vitals, and recorded records.

${profileContext}

Recorded Health Timeline Events:
${recordSummaries || '(No prior records on file yet)'}

Language & Formatting Instructions for Maximum Readability:
1. TARGET LANGUAGE: Respond entirely in ${targetLangName} script (${targetLanguage}).
2. READABILITY & VISUAL HIERARCHY:
   - Start with a clear section header (e.g. "### 🩸 Blood Pressure Summary" or "### 💊 Medication Review").
   - Highlight all medical readings, vitals, and counts in bold with units (e.g. "**130/85 mmHg**", "**98.6 °F**", "**2026-09-01**").
   - Use callout markers for clinical assessment:
     - "✅ **Clinical Assessment:** ..." for healthy/normal findings.
     - "⚠️ **Attention:** ..." for elevated or cautionary findings.
     - "💡 **Recommendation:** ..." for practical lifestyle, diet, or monitoring advice.
   - Use clean bullet points ("• ") when listing medications, symptoms, or instructions.
3. Answer the user's query accurately using their real recorded health data.
4. If they ask about vitals, cite their exact readings and dates from the records.
5. Never provide a formal medical diagnosis or prescribe new medication; encourage discussion with their doctor.
6. You MUST respond with a valid JSON object matching this schema:
{
  "aiResponse": "Markdown formatted response string in ${targetLangName}",
  "disclaimer": "Medical disclaimer string in ${targetLangName}",
  "followUp": {
    "question": "Follow-up question string in ${targetLangName}",
    "options": ["Option 1 in ${targetLangName}", "Option 2 in ${targetLangName}", "Option 3 in ${targetLangName}"]
  }
}`;
  },

  /**
   * Parse structured JSON from model response
   */
  _parseJsonResponse(rawContent, query, targetLanguage = 'en') {
    try {
      const cleaned = rawContent.replace(/```(?:json)?\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        id: `conv_${Date.now()}`,
        userQuery: query,
        lang: targetLanguage,
        aiResponse: parsed.aiResponse || rawContent,
        toolCalls: [],
        disclaimer: parsed.disclaimer || (targetLanguage === 'hi' ? 'आरोग्य एआई केवल सूचनात्मक उद्देश्यों के लिए है। चिकित्सकीय सलाह के लिए अपने डॉक्टर से परामर्श लें।' : 'Aarogya AI is for informational purposes. Consult your doctor for medical advice.'),
        followUp: parsed.followUp || {
          question: targetLanguage === 'hi' ? 'आप आगे क्या देखना चाहते हैं?' : 'What would you like to explore next?',
          options: targetLanguage === 'hi'
            ? ['हालिया वाइटल्स जांचें', 'दवाओं की समीक्षा करें', 'डॉक्टर का सारांश तैयार करें']
            : ['Check recent vitals', 'Review medications', 'Prepare doctor summary'],
        },
      };
    } catch (_) {
      return {
        id: `conv_${Date.now()}`,
        userQuery: query,
        lang: targetLanguage,
        aiResponse: rawContent,
        toolCalls: [],
        disclaimer: targetLanguage === 'hi' ? 'आरोग्य एआई केवल सूचनात्मक उद्देश्यों के लिए है।' : 'Aarogya AI is for informational purposes. Consult your doctor for medical advice.',
      };
    }
  },

  /**
   * Dynamic local health analysis engine (simulates the 6 tools when offline/no API key)
   */
  _localHealthAnalysis(query, healthRecords = [], userProfile = null, targetLanguage = 'en') {
    const q = query.toLowerCase();
    const isHindi = targetLanguage === 'hi';

    // 1. Blood Pressure / Vitals query
    if (q.includes('bp') || q.includes('blood pressure') || q.includes('hypertension') || q.includes('pressure') || q.includes('रक्तचाप') || q.includes('बीपी')) {
      const bpRecords = healthRecords.filter(r => r.type === 'blood_pressure' || r.record_type === 'blood_pressure' || r.type === 'vitals');
      const latest = bpRecords[0];
      const count = bpRecords.length;

      let msg = '';
      if (latest) {
        const sys = latest.metadata?.systolic || '124';
        const dia = latest.metadata?.diastolic || '80';
        const isElevated = Number(sys) > 130;

        if (isHindi) {
          msg = `### 🩸 ब्लड प्रेशर सारांश\n\n` +
            `📊 **नवीनतम रीडिंग:** **${sys}/${dia} mmHg** (तारीख: **${latest.date || 'हाल ही में'}**)\n` +
            `📈 **टाइमलाइन रिकॉर्ड:** कुल **${count} रीडिंग** दर्ज\n\n` +
            (isElevated
              ? `⚠️ **चिकित्सीय स्थिति:** यह सामान्य सीमा से थोड़ा अधिक है। पर्याप्त पानी पिएं और नियमित रूप से जांच करते रहें।`
              : `✅ **चिकित्सीय स्थिति:** यह रीडिंग सामान्य विश्राम सीमा के भीतर है।`) +
            `\n\n💡 **सलाह:** स्वस्थ जीवनशैली बनाए रखें और समय पर अपने बीपी की जांच करते रहें।`;
        } else {
          msg = `### 🩸 Blood Pressure Summary\n\n` +
            `📊 **Most Recent Reading:** **${sys}/${dia} mmHg** on **${latest.date || 'recent'}**\n` +
            `📈 **Timeline History:** **${count} total readings** found in your records\n\n` +
            (isElevated
              ? `⚠️ **Clinical Observation:** This reading is slightly above standard resting thresholds. Ensure adequate hydration and reduce sodium.`
              : `✅ **Clinical Observation:** This reading is within a healthy resting range.`) +
            `\n\n💡 **Recommendation:** Continue periodic morning checks to maintain your baseline.`;
        }
      } else {
        msg = isHindi
          ? `### 🩸 ब्लड प्रेशर रिकॉर्ड्स\n\nℹ️ आपके टाइमलाइन पर वर्तमान में कोई ब्लड प्रेशर रिकॉर्ड नहीं मिला। आप अपने डैशबोर्ड से नई रीडिंग जोड़ सकते हैं।`
          : `### 🩸 Blood Pressure Records\n\nℹ️ No blood pressure readings are currently on file in your timeline. You can record a reading anytime.`;
      }

      return {
        id: `conv_${Date.now()}`,
        userQuery: query,
        lang: targetLanguage,
        aiResponse: msg,
        toolCalls: [{ tool: 'get_measurement_history', args: { type: 'blood_pressure', period: '3_months' } }],
        disclaimer: isHindi ? 'आरोग्य एआई केवल व्यक्तिगत स्वास्थ्य ट्रैकिंग के लिए है।' : 'Aarogya AI is for informational tracking and continuity.',
        followUp: {
          question: isHindi ? 'आप और क्या देखना चाहते हैं?' : 'Would you like to examine anything else?',
          options: isHindi
            ? ['पिछले 3 महीने का ट्रेंड देखें', 'दवाओं की सूची देखें', 'डॉक्टर का सारांश तैयार करें']
            : ['Compare last 3 months', 'Review current medications', 'Prepare doctor summary'],
        },
      };
    }

    // 2. Medication inquiry
    if (q.includes('medicine') || q.includes('medication') || q.includes('prescription') || q.includes('दवा') || q.includes('गोली')) {
      const meds = normalizeList(userProfile?.currentMedications);
      const rxRecords = Array.isArray(healthRecords)
        ? healthRecords.filter(r => r.type === 'prescription' || r.record_type === 'prescription')
        : [];

      let msg = '';
      if (isHindi) {
        if (meds.length > 0 || rxRecords.length > 0) {
          msg = `### 💊 सक्रिय दवाइयां एवं नुस्खे\n\n` +
            `📊 **सक्रिय दवाइयां:** आपके क्लिनिकल प्रोफाइल में **${meds.length || rxRecords.length} दर्ज आइटम** हैं:\n\n`;

          meds.forEach((m) => {
            if (typeof m === 'string') {
              msg += `• **${m}**\n`;
            } else if (m && typeof m === 'object') {
              const name = m.name || m.medicine_name || m.title || m.label || 'दवा';
              const details = [m.dosage || m.dose, m.frequency || m.schedule || m.timing].filter(Boolean).join(' - ');
              msg += `• **${name}**${details ? ` — ${details}` : ''}\n`;
            } else {
              msg += `• **${String(m)}**\n`;
            }
          });
          rxRecords.forEach((r) => {
            msg += `• **${r.title}** (${r.date || 'फाइल पर'})\n`;
          });

          msg += `\n✅ **सुरक्षा सलाह:** अपने चिकित्सक के निर्देशानुसार भोजन के बाद पानी के साथ दवाएं लें।\n\n` +
            `💡 **सुझाव:** रिमाइंडर टैब में दवा का अलर्ट सेट करें ताकि कोई खुराक न छूटे।`;
        } else {
          msg = `### 💊 दवा समीक्षा\n\nℹ️ आपके प्रोफाइल में वर्तमान में कोई सक्रिय दवा या नुस्खा दर्ज नहीं है।`;
        }
      } else {
        if (meds.length > 0 || rxRecords.length > 0) {
          msg = `### 💊 Active Prescriptions & Medications\n\n` +
            `📊 **Active Medications:** **${meds.length || rxRecords.length} recorded items** on your clinical profile:\n\n`;

          meds.forEach((m) => {
            if (typeof m === 'string') {
              msg += `• **${m}**\n`;
            } else if (m && typeof m === 'object') {
              const name = m.name || m.medicine_name || m.title || m.label || 'Medication';
              const details = [m.dosage || m.dose, m.frequency || m.schedule || m.timing].filter(Boolean).join(' - ');
              msg += `• **${name}**${details ? ` — ${details}` : ''}\n`;
            } else {
              msg += `• **${String(m)}**\n`;
            }
          });
          rxRecords.forEach((r) => {
            msg += `• **${r.title}** (${r.date || 'On file'})\n`;
          });

          msg += `\n✅ **Safety Review:** Take medications with water after meals as directed by your physician.\n\n` +
            `💡 **Action:** Set medication alerts in the Reminders tab so you never miss a dose.`;
        } else {
          msg = `### 💊 Medication Review\n\nℹ️ No active prescriptions or daily medications are currently saved in your profile.`;
        }
      }

      return {
        id: `conv_${Date.now()}`,
        userQuery: query,
        lang: targetLanguage,
        aiResponse: msg,
        toolCalls: [{ tool: 'get_medications', args: {} }],
        disclaimer: isHindi
          ? 'सूचनात्मक दवा समीक्षा। हमेशा अपने डॉक्टर के निर्देशों का पालन करें।'
          : 'Informational medication review. Always follow your prescribing physician instructions.',
        followUp: {
          question: isHindi ? 'सुझाए गए कार्य:' : 'Suggested actions:',
          options: isHindi
            ? ['दवा का रिमाइंडर सेट करें', 'हालिया वाइटल्स जांचें', 'डॉक्टर विजिट की तैयारी करें']
            : ['Set medication reminder', 'Check recent vitals', 'Prepare for doctor appointment'],
        },
      };
    }

    // 3. Doctor visit prep
    if (q.includes('doctor') || q.includes('visit') || q.includes('appointment') || q.includes('डॉक्टर') || q.includes('अस्पताल')) {
      const recentVitals = (Array.isArray(healthRecords) ? healthRecords : [])
        .filter(r => r.type === 'blood_pressure' || r.type === 'vitals' || r.record_type === 'vitals')
        .slice(0, 3);
      const conditions = normalizeList(userProfile?.medicalBackground?.existingConditions || userProfile?.conditions);

      let msg = `### 🩺 Doctor Consultation Preparation\n\n` +
        `Here is a summary prepared from your health timeline for your upcoming clinical consultation:\n\n` +
        `📊 **Profile Overview:** ${userProfile?.name || 'Patient'}, Blood Group: **${userProfile?.bloodGroup || 'O+'}**\n` +
        (conditions.length > 0 ? `📌 **Recorded Conditions:** ${conditions.join(', ')}\n\n` : '\n') +
        `**Recent Vitals to Share:**\n`;

      if (recentVitals.length > 0) {
        recentVitals.forEach(v => {
          msg += `• ${v.title} on **${v.date || 'recent'}**: ${v.notes || 'Normal'}\n`;
        });
      } else {
        msg += `• No recent vitals logged this week.\n`;
      }

      msg += `\n💡 **Questions to Ask Your Doctor:**\n` +
        `1. Are my current vital readings within the target range for my age?\n` +
        `2. Should we continue or adjust my current daily medications?\n` +
        `3. Are there any follow-up blood tests or lipid panels recommended?`;

      return {
        id: `conv_${Date.now()}`,
        userQuery: query,
        lang: targetLanguage,
        aiResponse: msg,
        toolCalls: [{ tool: 'get_doctor_visits', args: { status: 'all' } }],
        disclaimer: isHindi
          ? 'क्लिनिकल परामर्श संक्षिप्त। आपके सहेजे गए रिकॉर्ड से तैयार किया गया।'
          : 'Clinical consultation brief. Generated from your stored records.',
        followUp: {
          question: isHindi ? 'तैयारी के अगले चरण:' : 'Next preparation steps:',
          options: isHindi
            ? ['परामर्श संक्षिप्त डाउनलोड करें', 'हालिया लैब रिपोर्ट जांचें', 'अपॉइंटमेंट रिमाइंडर सेट करें']
            : ['Download consultation brief', 'Check recent lab reports', 'Set appointment reminder'],
        },
      };
    }

    // Default general health inquiry
    return {
      id: `conv_${Date.now()}`,
      userQuery: query,
      lang: targetLanguage,
      aiResponse: isHindi
        ? `### 🩺 आरोग्य स्वास्थ्य सहायक\n\nमैंने आपकी टाइमलाइन और स्वास्थ्य रिकॉर्ड की समीक्षा की है। आपके पास कुल **${(healthRecords || []).length} रिकॉर्ड** मौजूद हैं।\n\n💡 **उपलब्ध विकल्प:** आप अपने रक्तचाप के रुझान, दवाइयों की सूची, या डॉक्टर विजिट की तैयारी के बारे में पूछ सकते हैं।`
        : `### 🩺 Health Timeline Assistant\n\nI have reviewed your recorded health memory timeline (**${(healthRecords || []).length} records** on file).\n\n💡 **How I can help:**\n• Analyze your vital measurement trends (BP, glucose, weight)\n• Review your active medications and dosages\n• Prepare comprehensive briefs for your upcoming doctor visits\n• Create timely health reminders`,
      toolCalls: [{ tool: 'get_health_records', args: { limit: 5 } }],
      disclaimer: 'Aarogya AI is for informational tracking and continuity.',
      followUp: {
        question: 'Suggested health queries:',
        options: [
          'How has my blood pressure changed this month?',
          'Prepare me for my next doctor visit.',
          'What medicines have I recorded?'
        ],
      },
    };
  },

  /**
   * Structured clinical session summary
   */
  async summarizeConversation(messages = [], userProfile = null, targetLanguage = 'en', sessionMeta = {}) {
    const config = this.getAiConfig();

    if (config.isConfigured && config.provider === 'gemini') {
      try {
        const transcript = messages
          .map((m) => `${m.sender === 'user' ? 'Patient' : 'Assistant'}: ${m.text}`)
          .join('\n\n');

        const prompt = `You are a clinical documentation specialist. Summarize this health consultation session between a patient and the health assistant.
Respond ONLY with a valid JSON object matching this schema:
{
  "title": "Short title (e.g. Hypertension & Medication Review)",
  "overview": "2-3 sentence clinical synopsis of the consultation",
  "topics": ["topic 1", "topic 2"],
  "vitals": ["vital reading 1 with units", "vital reading 2"],
  "insights": ["key observation 1", "key observation 2"],
  "actionItems": ["actionable next step 1", "actionable next step 2"]
}

Patient: ${userProfile?.name || 'Patient'}
Duration: ${sessionMeta.duration ? Math.floor(sessionMeta.duration / 60) + 'm ' + (sessionMeta.duration % 60) + 's' : 'Standard'}
Doctor Mode: ${sessionMeta.doctorMode ? 'Yes' : 'No'}

Consultation Dialogue:
${transcript}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.apiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const parsed = JSON.parse(raw);
            return {
              ...parsed,
              generatedAt: new Date().toISOString(),
              duration: sessionMeta.duration || 0,
            };
          }
        }
      } catch (err) {
        console.warn('[aiService] Live summary failed, using local summary generator:', err);
      }
    }

    return this._localConversationSummary(messages, userProfile, targetLanguage, sessionMeta);
  },

  /**
   * Local deterministic clinical session summary generator
   */
  _localConversationSummary(messages = [], userProfile = null, targetLanguage = 'en', sessionMeta = {}) {
    const topics = [];
    const vitals = [];
    const insights = [];
    const actionItems = [];

    const fullText = messages.map((m) => m.text || '').join(' ');

    if (/bp|blood pressure|\d{2,3}\/\d{2,3}/i.test(fullText)) {
      topics.push('Blood Pressure & Cardiovascular Monitoring');
      const match = fullText.match(/(\d{2,3}\/\d{2,3}\s*mmHg|\d{2,3}\/\d{2,3})/);
      if (match) vitals.push(`Blood Pressure: ${match[1]}`);
      insights.push('Resting blood pressure baseline evaluated against recent recordings.');
      actionItems.push('Log blood pressure again tomorrow morning before breakfast.');
    }

    if (/sugar|glucose|diabetes/i.test(fullText)) {
      topics.push('Blood Glucose & Glycemic Balance');
      insights.push('Discussed dietary habits and periodic glucose tracking.');
      actionItems.push('Maintain a 3-day fasting blood glucose log.');
    }

    if (/medicine|medication|prescription|dose/i.test(fullText)) {
      topics.push('Medication Adherence & Schedule');
      insights.push('Reviewed active prescriptions and daily dose timings.');
      actionItems.push('Set automated reminders for daily doses.');
    }

    if (/doctor|visit|appointment/i.test(fullText)) {
      topics.push('Clinical Visit Preparation');
      insights.push('Prepared clinical questions and symptom summary for the physician.');
      actionItems.push('Bring recorded timeline history to upcoming consultation.');
    }

    if (topics.length === 0) {
      topics.push('General Health Memory Review', 'Wellness Discussion');
      insights.push('Reviewed chronological health memory records and active profile parameters.');
      actionItems.push('Continue regular vitals monitoring and logging in Aarogya.');
    }

    return {
      title: topics[0] ? `${topics[0]} Session` : 'Health Consultation Summary',
      overview: `Completed clinical session with ${userProfile?.name || 'patient'}. Key inquiries centered around ${topics.join(', ').toLowerCase()}. Relevant health records and trend analyses were reviewed.`,
      topics,
      vitals,
      insights,
      actionItems,
      generatedAt: new Date().toISOString(),
      duration: sessionMeta.duration || 0,
      doctorMode: Boolean(sessionMeta.doctorMode),
    };
  },
};