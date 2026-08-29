import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { languages, translations } from '../locales';
import { translatePage, revertPage, startPageTranslator, stopPageTranslator } from '../services/pageTranslator';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('aarogya_lang') || 'en';
  });

  // ── Start the MutationObserver once so dynamically rendered text
  // also gets translated when routes change ──
  useEffect(() => {
    startPageTranslator(() => currentLang);
    return () => stopPageTranslator();
  }, [currentLang]);

  const setLanguage = useCallback(async (langCode) => {
    if (!translations[langCode]) return;

    setCurrentLang(langCode);
    localStorage.setItem('aarogya_lang', langCode);

    // Translate the whole page into the selected language
    if (langCode === 'en') {
      revertPage();
    } else {
      await translatePage(langCode);
    }
  }, []);

  const refreshTranslations = useCallback(() => {
    // Called after route changes to reapply translation to new content
    if (currentLang !== 'en') {
      translatePage(currentLang);
    }
  }, [currentLang]);

  const t = translations[currentLang] || translations.en;

  return (
    <LanguageContext.Provider value={{
      currentLang,
      setLanguage,
      languages,
      t,
      refreshTranslations,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};