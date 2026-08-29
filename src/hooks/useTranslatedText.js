import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../services/translationService';

/**
 * Hook: translate an English string into the user's current language
 * via Groq (with caching). Returns { text, loading }.
 *
 * Usage:
 *   const { text } = useTranslatedText('Welcome to your dashboard');
 *   // → "आपके डैशबोर्ड पर आपका स्वागत है" (when currentLang === 'hi')
 */
export const useTranslatedText = (englishText) => {
  const { currentLang } = useLanguage();
  const [text, setText] = useState(englishText);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    // If English or no text, return immediately
    if (!englishText || currentLang === 'en') {
      setText(englishText || '');
      setLoading(false);
      return;
    }

    const myReq = ++requestId.current;
    setLoading(true);
    translateText(englishText, currentLang).then((translated) => {
      // Guard against stale results
      if (myReq === requestId.current) {
        setText(translated);
        setLoading(false);
      }
    });
  }, [englishText, currentLang]);

  return { text, loading };
};

/**
 * Hook: batch translate an array of strings.
 * Returns { translations, loading } — translations is a string[] in the
 * same order as the input.
 */
export const useTranslatedBatch = (englishTexts = []) => {
  const { currentLang } = useLanguage();
  const [translations, setTranslations] = useState(englishTexts);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  // Store a stable serialized key so the effect dependency doesn't
  // create a new string reference on every render (which would trigger
  // an infinite translate-render-translate loop).
  const prevTextsRef = useRef('');

  useEffect(() => {
    const serialized = JSON.stringify(englishTexts);
    if (serialized === prevTextsRef.current) return;
    prevTextsRef.current = serialized;

    if (currentLang === 'en' || englishTexts.length === 0) {
      setTranslations(englishTexts);
      setLoading(false);
      return;
    }

    const myReq = ++requestId.current;
    setLoading(true);
    Promise.all(englishTexts.map((t) => translateText(t, currentLang))).then((results) => {
      if (myReq === requestId.current) {
        setTranslations(results);
        setLoading(false);
      }
    });
  }, [JSON.stringify(englishTexts), currentLang]);

  return { translations, loading };
};
