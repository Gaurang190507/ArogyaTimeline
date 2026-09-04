// ─────────────────────────────────────────────────────────────
// Page Translator — Google-Translate style whole-page translation
// Walks the DOM and translates every visible text node into the
// target language via the free Groq LLM API. Caches results in
// sessionStorage. Skips inputs, code blocks, and our own locale
// strings (which are already translated).
// ─────────────────────────────────────────────────────────────

import { LANG_NAMES } from './translationService';

const GROQ_PROXY_URL = import.meta.env.VITE_GROQ_PROXY_URL;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; // fallback if no proxy
const CACHE_PREFIX = 'aarogya_page::';
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CANVAS', 'SVG',
  'CODE', 'PRE', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION',
]);

// Element attributes we should also translate
const ATTR_LIST = ['title', 'placeholder', 'aria-label', 'alt'];

const originalCache = new WeakMap(); // node → original text
// Map: "attrKey" (el.dataset.translatorAttrKey or generated) → original value
// We use a WeakMap keyed by element, with attribute name as the value key.
const attrOriginalCache = new WeakMap(); // el → Map(attr → original)
let isTranslating = false;
let pendingLang = null;
let observer = null;

function cacheKey(lang, text) {
  return `${CACHE_PREFIX}${lang}::${text}`;
}

function getOriginalText(node) {
  if (!originalCache.has(node)) {
    originalCache.set(node, node.nodeValue);
  }
  return originalCache.get(node);
}

function shouldSkipNode(node) {
  let el = node.parentElement;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.dataset && el.dataset.notranslate !== undefined) return true;
    el = el.parentElement;
  }
  return false;
}

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.nodeValue.length < 2) return NodeFilter.FILTER_REJECT;
      if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  return nodes;
}

function collectAttributeTargets(root) {
  const els = root.querySelectorAll('*');
  const targets = [];
  els.forEach((el) => {
    if (el.dataset && el.dataset.notranslate !== undefined) return;
    for (const attr of ATTR_LIST) {
      const val = el.getAttribute(attr);
      if (val && val.trim().length > 1) {
        targets.push({ el, attr, original: val });
      }
    }
  });
  return targets;
}

async function translateOne(text, targetLang) {
  const hasAi = Boolean(GROQ_PROXY_URL || (GROQ_API_KEY && GROQ_API_KEY !== 'your-groq-api-key-here'));
  if (!text || targetLang === 'en' || !hasAi) return text;
  const key = cacheKey(targetLang, text);
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) return stored;
  } catch (_) {}

  try {
    const chatPayload = {
      messages: [
        {
          role: 'system',
          content: `You are a precise UI translator. Translate the following English text into ${LANG_NAMES[targetLang] || 'English'}. Preserve any placeholders like {{name}}, numbers, emojis, and punctuation. Output ONLY the translation, no explanations. If the text is already in the target language, return it as-is.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 256,
    };

    const url = GROQ_PROXY_URL || 'https://api.groq.com/openai/v1/chat/completions';
    const headers = GROQ_PROXY_URL
      ? { 'Content-Type': 'application/json' }
      : { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' };
    const body = GROQ_PROXY_URL
      ? JSON.stringify({ kind: 'chat', ...chatPayload })
      : JSON.stringify({ model: 'llama-3.1-8b-instant', ...chatPayload });

    const res = await fetch(url, { method: 'POST', headers, body });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    const out = (json.choices?.[0]?.message?.content || text).trim();
    try { sessionStorage.setItem(key, out); } catch (_) {}
    return out;
  } catch (err) {
    return text;
  }
}

/**
 * Translate the current page into targetLang.
 * - Walks all text nodes + relevant attributes
 * - Sends requests in parallel batches of 6 to avoid Groq rate limits
 * - Skips already-translated nodes (idempotent)
 */
export async function translatePage(targetLang) {
  if (targetLang === 'en') {
    revertPage();
    return;
  }

  document.documentElement.lang = targetLang;

  const hasAi = Boolean(GROQ_PROXY_URL || (GROQ_API_KEY && GROQ_API_KEY !== 'your-groq-api-key-here'));
  if (!hasAi) {
    return;
  }

  if (isTranslating) {
    pendingLang = targetLang;
    return;
  }
  isTranslating = true;
  pendingLang = null;

  try {
    // Make sure we have a baseline of original English before mutating
    const textNodes = collectTextNodes(document.body);
    const attrTargets = collectAttributeTargets(document.body);

    // Prepare unique text strings to translate
    const uniqueTexts = new Set();
    textNodes.forEach((n) => uniqueTexts.add(getOriginalText(n)));
    attrTargets.forEach((t) => uniqueTexts.add(t.original));

    const allTexts = [...uniqueTexts];
    const BATCH = 6;
    const translations = new Map();

    for (let i = 0; i < allTexts.length; i += BATCH) {
      const batch = allTexts.slice(i, i + BATCH);
      const results = await Promise.all(
        batch.map((t) => translateOne(t, targetLang))
      );
      batch.forEach((t, idx) => translations.set(t, results[idx]));
    }

    // Apply translations
    textNodes.forEach((node) => {
      const original = getOriginalText(node);
      const translated = translations.get(original);
      if (translated) node.nodeValue = translated;
    });
    attrTargets.forEach(({ el, attr, original }) => {
      // Store the original value before overwriting
      let elCache = attrOriginalCache.get(el);
      if (!elCache) {
        elCache = new Map();
        attrOriginalCache.set(el, elCache);
      }
      if (!elCache.has(attr)) elCache.set(attr, original);

      const translated = translations.get(original);
      if (translated) el.setAttribute(attr, translated);
    });

    document.documentElement.lang = targetLang;
  } finally {
    isTranslating = false;
    if (pendingLang) {
      const next = pendingLang;
      pendingLang = null;
      translatePage(next);
    }
  }
}

/**
 * Revert all text nodes back to their original English.
 * Called when the user switches back to English.
 */
export function revertPage() {
  // Text nodes
  const textNodes = collectTextNodes(document.body);
  textNodes.forEach((node) => {
    if (originalCache.has(node)) {
      node.nodeValue = originalCache.get(node);
    }
  });

  // Attributes — restore each element's cached originals
  const elsWithAttrs = document.querySelectorAll(`[${ATTR_LIST.map(a => `[${a}]`).join(', ')}]`);
  elsWithAttrs.forEach((el) => {
    const elCache = attrOriginalCache.get(el);
    if (!elCache) return;
    elCache.forEach((original, attr) => {
      if (original !== el.getAttribute(attr)) {
        el.setAttribute(attr, original);
      }
    });
  });

  document.documentElement.lang = 'en';
}

/**
 * Watch the DOM for new text nodes (from React re-renders) and
 * translate them on the fly.
 */
export function startPageTranslator(getTargetLang) {
  if (observer) return;

  observer = new MutationObserver(async () => {
    const lang = getTargetLang();
    if (lang === 'en') return;
    if (isTranslating) return;

    // Debounce: only run once per 300ms of DOM activity
    clearTimeout(observer._t);
    observer._t = setTimeout(() => {
      translatePage(lang);
    }, 300);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['title', 'placeholder', 'aria-label', 'alt'],
  });
}

export function stopPageTranslator() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
