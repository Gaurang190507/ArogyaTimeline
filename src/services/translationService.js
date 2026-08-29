// ─────────────────────────────────────────────────────────────
// Translation service — uses Groq's free LLM API to translate
// ANY English text into 10 Indian languages on demand.
// Caches results in sessionStorage so we don't re-translate.
// ─────────────────────────────────────────────────────────────

const GROQ_PROXY_URL = import.meta.env.VITE_GROQ_PROXY_URL;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; // fallback if no proxy

// Map our app's language codes → natural language names for the prompt
export const LANG_NAMES = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  gu: 'Gujarati (ગુજરાતી)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
};

const cache = new Map();
const CACHE_PREFIX = 'aarogya_tx::';
const MAX_TEXT_LEN = 600; // chars per request to keep prompts small

/**
 * Split a long English string into small pieces (sentences / clauses)
 * so we can translate each independently. This avoids Groq's output
 * length limits and improves quality.
 */
function splitIntoChunks(text, maxLen = MAX_TEXT_LEN) {
  if (!text) return [];
  if (text.length <= maxLen) return [text];
  // Split on sentence boundaries first
  const sentences = text.match(/[^.!?\n]+[.!?\n]?/g) || [text];
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > maxLen && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/**
 * Translate a single chunk. Returns the translated string.
 * Falls back to the original text if anything fails.
 */
async function translateChunk(text, targetLang) {
  if (!text) return text;
  if (targetLang === 'en' || (!GROQ_PROXY_URL && (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here'))) {
    return text;
  }

  const cacheKey = `${CACHE_PREFIX}${targetLang}::${text}`;
  // Session cache (in-memory) — survives navigations but not reloads
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  // Persistent cache
  try {
    const stored = sessionStorage.getItem(cacheKey);
    if (stored) {
      cache.set(cacheKey, stored);
      return stored;
    }
  } catch (_) {}

  const langName = LANG_NAMES[targetLang] || 'English';
  const systemPrompt = `You are a precise medical-domain translator. Translate the following text from English into ${langName}. Keep medical terms accurate and natural. Preserve markdown, emojis, placeholders like {{name}}, line breaks, and numbers. Output ONLY the translation — no explanations.`;

  try {
    const chatPayload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: Math.min(1024, Math.ceil(text.length * 2.5)),
    };

    const url = GROQ_PROXY_URL || 'https://api.groq.com/openai/v1/chat/completions';
    const headers = GROQ_PROXY_URL
      ? { 'Content-Type': 'application/json' }
      : { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' };
    const body = GROQ_PROXY_URL
      ? JSON.stringify({ kind: 'chat', ...chatPayload })
      : JSON.stringify({ model: 'llama-3.1-8b-instant', ...chatPayload });

    const res = await fetch(url, { method: 'POST', headers, body });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const translated = (json.choices?.[0]?.message?.content || text).trim();

    cache.set(cacheKey, translated);
    try { sessionStorage.setItem(cacheKey, translated); } catch (_) {}
    return translated;
  } catch (err) {
    console.warn('[translationService] chunk failed:', err.message);
    return text; // graceful fallback
  }
}

/**
 * Translate a full English string (any length). Handles chunking +
 * parallel requests. Returns a Promise<string>.
 */
export async function translateText(text, targetLang) {
  if (!text || targetLang === 'en') return text;
  const chunks = splitIntoChunks(text);
  const results = await Promise.all(chunks.map(c => translateChunk(c, targetLang)));
  return results.join(' ');
}

/**
 * Batch translate multiple strings at once. Useful for translating
 * every visible string on a page in one pass.
 */
export async function translateMany(textArray, targetLang) {
  return Promise.all(textArray.map(t => translateText(t, targetLang)));
}

/**
 * Clear all cached translations for a language (e.g. when user switches).
 */
export function clearTranslationCache(targetLang) {
  for (const key of cache.keys()) {
    if (key.startsWith(`${CACHE_PREFIX}${targetLang}::`)) cache.delete(key);
  }
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(`${CACHE_PREFIX}${targetLang}::`)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch (_) {}
}
