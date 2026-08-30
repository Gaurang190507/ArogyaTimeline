/**
 * AnupanaService — Generates a structured Anupana voice script
 * from a doctor_visit health record, ready for Web Speech API TTS.
 *
 * The script reads aloud:
 *   1. Greeting + patient name
 *   2. Doctor visit summary
 *   3. Medications with dosage, Anupana (with-food / empty-stomach), and timing
 *   4. Pathya (recommended foods/habits)
 *   5. Apathya (foods/habits to avoid)
 *
 * All content is generated in the selected language.
 */

// ── Scripts per language ──────────────────────────────────────
const scripts = {
  en: {
    greeting: (name) => `Hello ${name || "Patient"}. Here is your prescription summary after your recent doctor visit.`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "as directed"}`);
      if (med.anupana) parts.push(`Take ${med.anupana}`);
      if (med.timing) parts.push(`at ${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `Recommended foods and habits: ${items.join(", ")}.`
      : "No specific dietary recommendations recorded.",
    apathya: (items) => items.length
      ? `Foods and habits to avoid: ${items.join(", ")}.`
      : "No specific restrictions recorded.",
    closing: "Please follow the prescribed schedule. If you have any concerns, contact your doctor.",
  },
  hi: {
    greeting: (name) => `नमस्ते ${name || "मरीज़"}। आपके हाल के डॉक्टर विज़िट के बाद यह आपकी दवाइयों की सारांश है।`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "निर्देशानुसार"}`);
      if (med.anupana) parts.push(`${med.anupana} के साथ लें`);
      if (med.timing) parts.push(`${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `सुझाए गए आहार और आदतें: ${items.join(", ")}.`
      : "कोई विशेष आहार सिफारिश दर्ज नहीं है।",
    apathya: (items) => items.length
      ? `परहेज करने योग्य आहार और आदतें: ${items.join(", ")}.`
      : "कोई विशेष परहेज दर्ज नहीं है।",
    closing: "कृपया निर्धारित समय पर दवाइयाँ लें। किसी भी प्रकार की परेशानी हो तो अपने डॉक्टर से संपर्क करें।",
  },
  ta: {
    greeting: (name) => `வணக்கம் ${name || "நோயாளி"}. உங்கள் சமீபத்திய மருத்துவர் வருகைக்குப் பிறகு உங்கள் மருந்து விவரம் இதோ.`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "வழிகாட்டுதல் படி"}`);
      if (med.anupana) parts.push(`${med.anupana} உடன் எடுத்துக்கொள்ளவும்`);
      if (med.timing) parts.push(`${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `பரிந்துரைக்கப்பட்ட உணவுகள்: ${items.join(", ")}.`
      : "குறிப்பிட்ட உணவு பரிந்துரைகள் பதிவு செய்யப்படவில்லை.",
    apathya: (items) => items.length
      ? `தவிர்க்க வேண்டிய உணவுகள்: ${items.join(", ")}.`
      : "குறிப்பிட்ட தடைகள் பதிவு செய்யப்படவில்லை.",
    closing: "தயவுசெய்து நிர்ணயிக்கப்பட்ட நேரத்தில் மருந்துகளை எடுத்துக்கொள்ளுங்கள். ஏதேனும் கவலை இருந்தால் உங்கள் மருத்துவரைத் தொடர்பு கொள்ளுங்கள்.",
  },
  te: {
    greeting: (name) => `నమస్కారం ${name || "రోగి"}. మీ ఇటీవలి వైద్యుడి సందర్శన తర్వాత మీ మందుల సారాంశం ఇది.`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "సూచనల ప్రకారం"}`);
      if (med.anupana) parts.push(`${med.anupana} తీసుకోండి`);
      if (med.timing) parts.push(`${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `సూచించిన ఆహారాలు: ${items.join(", ")}.`
      : "నిర్దిష్ట ఆహార సూచనలు నమోదు చేయబడలేదు.",
    apathya: (items) => items.length
      ? `తప్పించాల్సిన ఆహారాలు: ${items.join(", ")}.`
      : "నిర్దిష్ట ఆంక్షలు నమోదు చేయబడలేదు.",
    closing: "దయచేసి నిర్ణీత సమయంలో మందులు తీసుకోండి. ఏవైనా ఆందోళనలు ఉంటే మీ వైద్యుడిని సంప్రదించండి.",
  },
  bn: {
    greeting: (name) => `নমস্কার ${name || "রোগী"}. আপনার সাম্প্রতিক ডাক্তার পরিদর্শনের পর এটি আপনার ওষুধের সারসংক্ষেপ।`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "নির্দেশ অনুযায়ী"}`);
      if (med.anupana) parts.push(`${med.anupana} সাথে নিন`);
      if (med.timing) parts.push(`${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `প্রতিষেধিত খাদ্য: ${items.join(", ")}.`
      : "কোনো নির্দিষ্ট খাদ্য সুপারিশ নথিভুক্ত হয়নি।",
    apathya: (items) => items.length
      ? `এড়িয়ে চলুন: ${items.join(", ")}.`
      : "কোনো নির্দিষ্ট নিষেধাজ্ঞা নথিভুক্ত হয়নি।",
    closing: "অনুগ্রহ করে নির্ধারিত সময়ে ওষুধ সেবন করুন। যেকোনো উদ্বেগ থাকলে আপনার ডাক্তারের সাথে যোগাযোগ করুন।",
  },
  mr: {
    greeting: (name) => `नमस्कार ${name || "रुग्ण"}. तुमच्या अलीकडील डॉक्टर भेटीनंतर ही तुमच्या औषधांची आवृत्ती आहे.`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "सूचनेप्रमाणे"}`);
      if (med.anupana) parts.push(`${med.anupana} सोबत घ्या`);
      if (med.timing) parts.push(`${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `शिफारस केलेले आहार: ${items.join(", ")}.`
      : "कोणतीही विशिष्ट आहार शिफारस नोंदवलेली नाही.",
    apathya: (items) => items.length
      ? `टाळावयाचे आहार: ${items.join(", ")}.`
      : "कोणतीही विशिष्ट निर्बंध नोंदवलेले नाही.",
    closing: "कृपया निर्धारित वेळी औषधे घ्या. कोणत्याही चिंता असल्यास आपल्या डॉक्टरांशी संपर्क साधा.",
  },
  gu: {
    greeting: (name) => `નમસ્તે ${name || "દર્દી"}. તમારી તાજેતરની ડ doctor visit પછી આ તમારી દવાઓનો સારાંશ છે.`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "સૂચન મુજબ"}`);
      if (med.anupana) parts.push(`${med.anupana} સાથે લો`);
      if (med.timing) parts.push(`${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `સૂચિત ખોરાક: ${items.join(", ")}.`
      : "કોઈ વિશિષ્ટ ખોરાક ભલામણ નોંધાઈ નથી.",
    apathya: (items) => items.length
      ? `ટાળવાનો ખોરાક: ${items.join(", ")}.`
      : "કોઈ વિશિષ્ટ પ્રતિબંધો નોંધાયા નથી.",
    closing: "કૃપા કરીને નિર્ધારિત સમયે દવાઓ લો. કોઈ પણ ચિંતા હોય તો તમારા ડ doctor નો સંપર્ક કરો.",
  },
  kn: {
    greeting: (name) => `ನಮಸ್ಕಾರ ${name || "ರೋಗಿ"}. ನಿಮ್ಮ ಇತ್ತೀಚಿನ ವೈದ್ಯರ ಭೇಟಿಯ ನಂತರ ಇದು ನಿಮ್ಮ ಔಷಧಿಗಳ ಸಾರಾಂಶ.`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "ಸೂಚನೆಯಂತೆ"}`);
      if (med.anupana) parts.push(`${med.anupana} ಜೊತೆ ತೆಗೆದುಕೊಳ್ಳಿ`);
      if (med.timing) parts.push(`${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `ಶಿಫಾರಸು ಮಾಡಿದ ಆಹಾರ: ${items.join(", ")}.`
      : "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಆಹಾರ ಶಿಫಾರಸು ದಾಖಲಾಗಿಲ್ಲ.",
    apathya: (items) => items.length
      ? `ತಪ್ಪಿಸಬೇಕಾದ ಆಹಾರ: ${items.join(", ")}.`
      : "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ನಿರ್ಬಂಧಗಳು ದಾಖಲಾಗಿಲ್ಲ.",
    closing: "ದಯವಿಟ್ಟು ನಿಗದಿತ ಸಮಯದಲ್ಲಿ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ. ಯಾವುದೇ ಕಾಳಜಿ ಇದ್ದರೆ ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
  },
  ml: {
    greeting: (name) => `നമസ്കാരം ${name || "രോഗി"}. നിങ്ങളുടെ സമീപകാല ഡോക്ടർ സന്ദർശനത്തിന് ശേഷം ഇത് നിങ്ങളുടെ മരുന്നുകളുടെ സംഗ്രഹമാണ്.`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "നിർദ്ദേശം പ്രകാരം"}`);
      if (med.anupana) parts.push(`${med.anupana} സഹിച്ച് കഴിക്കുക`);
      if (med.timing) parts.push(`${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `ശുപാർശ ചെയ്ത ഭക്ഷണം: ${items.join(", ")}.`
      : "പ്രത്യേക ഭക്ഷണ ശുപാർശകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
    apathya: (items) => items.length
      ? `ഒഴിവാക്കേണ്ട ഭക്ഷണം: ${items.join(", ")}.`
      : "പ്രത്യേക നിരോധനങ്ങൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
    closing: "ദയവായി നിർദ്ദിഷ്ട സമയത്ത് മരുന്നുകൾ കഴിക്കുക. ഏതെങ്കിലും ആശങ്കകൾ ഉണ്ടെങ്കിൽ നിങ്ങളുടെ ഡോക്ടറെ ബന്ധപ്പെടുക.",
  },
  pa: {
    greeting: (name) => `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${name || "ਮਰੀਜ਼"}. ਤੁਹਾਡੀ ਤਾਜ਼ਾ ਡਾਕਟਰ ਮੁਲਾਕਾਤ ਤੋਂ ਬਾਅਦ ਇਹ ਤੁਹਾਡੀਆਂ ਦਵਾਈਆਂ ਦਾ ਸਾਰ ਹੈ।`,
    medication: (med) => {
      let parts = [];
      parts.push(`${med.name}, ${med.dosage || "ਹਦਾਇਤਾਂ ਅਨੁਸਾਰ"}`);
      if (med.anupana) parts.push(`${med.anupana} ਨਾਲ ਲਓ`);
      if (med.timing) parts.push(`${med.timing}`);
      return parts.join(". ");
    },
    pathya: (items) => items.length
      ? `ਸੁਝਾਏ ਗਏ ਖਾਣੇ: ${items.join(", ")}.`
      : "ਕੋਈ ਖਾਸ ਖਾਣ ਦੀ ਸਿਫਾਰਸ਼ ਦਰਜ ਨਹੀਂ ਹੈ।",
    apathya: (items) => items.length
      ? `ਪਰਹੇਜ਼ ਕਰਨ ਯੋਗ ਖਾਣੇ: ${items.join(", ")}.`
      : "ਕੋਈ ਖਾਸ ਪਾਬੰਦੀਆਂ ਦਰਜ ਨਹੀਂ ਹਨ।",
    closing: "ਕਿਰਪਾ ਕਰਕੇ ਨਿਰਧਾਰਿਤ ਸਮੇਂ ਤੇ ਦਵਾਈਆਂ ਲਓ। ਕਿਸੇ ਵੀ ਚਿੰਤਾ ਲਈ ਆਪਣੇ ਡਾਕਟਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
  },
};

// Language code mapping: app uses 2-letter codes, map to the above
const langMap = {
  en: "en", hi: "hi", ta: "ta", te: "te",
  bn: "bn", mr: "mr", gu: "gu", kn: "kn", ml: "ml", pa: "pa",
};

/**
 * Build a prescription script from a health record's metadata.
 * @param {Object} record  — a health_records row
 * @param {string} lang    — two-letter language code (default 'en')
 * @param {string} patientName — for greeting
 * @returns {string} plain-text script for TTS
 */
export function buildAnupanaScript(record, lang = "en", patientName = "") {
  const langCode = langMap[lang] || "en";
  const s = scripts[langCode] || scripts.en;

  const parts = [];
  parts.push(s.greeting(patientName));

  // Medications from metadata.medications array
  const meds = record?.metadata?.medications || [];
  if (meds.length > 0) {
    parts.push(`You have been prescribed ${meds.length} medication${meds.length > 1 ? "s" : ""}.`);
    meds.forEach((med, i) => {
      parts.push(`${i + 1}. ${s.medication(med)}`);
    });
  } else {
    parts.push("No specific medications have been recorded for this visit.");
  }

  // Pathya
  const pathya = record?.metadata?.pathya || [];
  parts.push(s.pathya(pathya));

  // Apathya
  const apathya = record?.metadata?.apathya || [];
  parts.push(s.apathya(apathya));

  parts.push(s.closing);

  return parts.join("\n\n");
}

/**
 * Play a text string using the Web Speech API.
 * Returns a promise that resolves when the utterance finishes.
 */
export function speakAnupana(text, lang = "en") {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("Speech synthesis not supported in this browser."));
      return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : lang === "te" ? "te-IN"
      : lang === "bn" ? "bn-IN" : lang === "mr" ? "mr-IN" : lang === "gu" ? "gu-IN"
      : lang === "kn" ? "kn-IN" : lang === "ml" ? "ml-IN" : lang === "pa" ? "pa-IN" : "en-IN";
    utter.rate = 0.9;
    utter.pitch = 1;

    utter.onend = () => resolve();
    utter.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utter);
  });
}

/**
 * Stop any ongoing speech.
 */
export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
