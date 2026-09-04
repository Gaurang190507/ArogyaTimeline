import en from './en.js';
import hi from './hi.js';
import mr from './mr.js';

// Fallback helper to populate regional languages with their authentic names and translated phrases
const createLocaleWithFallback = (meta, baseTranslations) => {
  return {
    ...en,
    ...baseTranslations,
    brand: { ...en.brand, ...baseTranslations.brand },
    nav: { ...en.nav, ...baseTranslations.nav },
    common: { ...en.common, ...baseTranslations.common },
    home: { ...en.home, ...baseTranslations.home },
    recordTypes: { ...en.recordTypes, ...baseTranslations.recordTypes },
    ai: { ...en.ai, ...baseTranslations.ai },
  };
};

const bn = createLocaleWithFallback({}, {
  brand: { name: "MediPulse", tagline: "আপনার ব্যক্তিগত স্বাস্থ্য স্মৃতি" },
  nav: { home: "হোম", calendar: "ক্যালেন্ডার", timeline: "টাইমলাইন", addRecord: "রেকর্ড যোগ করুন", records: "মেডিকেল রেকর্ড", aiAssistant: "এআই সহকারী", doctors: "ডাক্তারগণ", appointments: "অ্যাপয়েন্টমেন্ট" },
  common: { save: "সংরক্ষণ", cancel: "বাতিল", search: "অনুসন্ধান করুন...", filter: "ফিল্টার", tapToSpeak: "কথা বলতে আলতো চাপুন" },
  home: { greeting: "শুভ সকাল", howAreYouFeeling: "আজ আপনি কেমন অনুভব করছেন?", quickRecord: "দ্রুত রেকর্ড" }
});

const ta = createLocaleWithFallback({}, {
  brand: { name: "MediPulse", tagline: "உங்கள் தனிப்பட்ட சுகாதார நினைவகம்" },
  nav: { home: "முகப்பு", calendar: "நாட்காட்டி", timeline: "காலவரிசை", addRecord: "பதிவு சேர்க்க", records: "மருத்துவ பதிவுகள்", aiAssistant: "AI உதவியாளர்", doctors: "மருத்துவர்கள்", appointments: "சந்திப்புகள்" },
  common: { save: "சேமி", cancel: "ரத்து செய்", search: "தேடு...", filter: "வடிகட்டி", tapToSpeak: "பேச தட்டவும்" },
  home: { greeting: "காலை வணக்கம்", howAreYouFeeling: "இன்று எப்படி உணர்கிறீர்கள்?", quickRecord: "விரைவு பதிவு" }
});

const te = createLocaleWithFallback({}, {
  brand: { name: "MediPulse", tagline: "మీ వ్యక్తిగత ఆరోగ్య జ్ఞాపకం" },
  nav: { home: "హోమ్", calendar: "క్యాలెండర్", timeline: "టైమ్‌లైన్", addRecord: "రికార్డ్ జోడించండి", records: "వైద్య రికార్డులు", aiAssistant: "AI సహాయకుడు", doctors: "వైద్యులు", appointments: "అపాయింట్‌మెంట్లు" },
  common: { save: "సేవ్ చేయండి", cancel: "రద్దు చేయండి", search: "శోధించండి...", filter: "ఫిల్టర్", tapToSpeak: "మాట్లాడటానికి నొక్కండి" },
  home: { greeting: "శుభోదయం", howAreYouFeeling: "ఈ రోజు మీకు ఎలా ఉంది?", quickRecord: "శీఘ్ర రికార్డ్" }
});

const kn = createLocaleWithFallback({}, {
  brand: { name: "MediPulse", tagline: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಸ್ಮೃತಿ" },
  nav: { home: "ಮುಖಪುಟ", calendar: "ಕ್ಯಾಲೆಂಡರ್", timeline: "ಟೈಮ್‌ಲೈನ್", addRecord: "ದಾಖಲೆ ಸೇರಿಸಿ", records: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು", aiAssistant: "AI ಸಹಾಯಕ", doctors: "ವೈದ್ಯರು", appointments: "ನೇಮಕಾತಿಗಳು" },
  common: { save: "ಉಳಿಸಿ", cancel: "ರದ್ದುಮಾಡಿ", search: "ಹುಡುಕಿ...", filter: "ಫಿಲ್ಟರ್", tapToSpeak: "ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ" },
  home: { greeting: "ಶುಭೋದಯ", howAreYouFeeling: "ಇಂದು ನೀವು ಹೇಗಿದ್ದೀರಿ?", quickRecord: "ತ್ವರಿತ ದಾಖಲೆ" }
});

const ml = createLocaleWithFallback({}, {
  brand: { name: "MediPulse", tagline: "നിങ്ങളുടെ സ്വകാര്യ ആരോഗ്യ സ്മരണ" },
  nav: { home: "ഹോം", calendar: "കലണ്ടർ", timeline: "ടൈംലൈൻ", addRecord: "റെക്കോർഡ് ചേർക്കുക", records: "മെഡിക്കൽ രേഖകൾ", aiAssistant: "AI അസിസ്റ്റന്റ്", doctors: "ഡോക്ടർമാർ", appointments: "അപ്പോയിന്റ്മെന്റുകൾ" },
  common: { save: "സംരക്ഷിക്കുക", cancel: "റദ്ദാക്കുക", search: "തിരയുക...", filter: "ഫിൽട്ടർ", tapToSpeak: "സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക" },
  home: { greeting: "സുപ്രഭാതം", howAreYouFeeling: "ഇന്ന് എങ്ങനെയുണ്ട്?", quickRecord: "ക്വിക്ക് റെക്കോർഡ്" }
});

const gu = createLocaleWithFallback({}, {
  brand: { name: "MediPulse", tagline: "તમારી વ્યક્તિગત સ્વાસ્થ્ય સ્મૃતિ" },
  nav: { home: "હોમ", calendar: "કેલેન્ડર", timeline: "ટાઇમલાઇન", addRecord: "રેકોર્ડ ઉમેરો", records: "તબીબી રેકોર્ડ્સ", aiAssistant: "AI સહાયક", doctors: "ડોક્ટરો", appointments: "મુલાકાતો" },
  common: { save: "સાચવો", cancel: "રદ કરો", search: "શોધો...", filter: "ફિલ્ટર", tapToSpeak: "બોલવા માટે ટેપ કરો" },
  home: { greeting: "સુપ્રભાત", howAreYouFeeling: "આજે તમને કેવું લાગે છે?", quickRecord: "ઝડપી રેકોર્ડ" }
});

const pa = createLocaleWithFallback({}, {
  brand: { name: "MediPulse", tagline: "ਤੁਹਾਡੀ ਨਿੱਜੀ ਸਿਹਤ ਯਾਦ" },
  nav: { home: "ਮੁੱਖ ਪੰਨਾ", calendar: "ਕੈਲੰਡਰ", timeline: "ਟਾਈਮਲਾਈਨ", addRecord: "ਰਿਕਾਰਡ ਸ਼ਾਮਲ ਕਰੋ", records: "ਮੈਡੀਕਲ ਰਿਕਾਰਡ", aiAssistant: "AI ਸਹਾਇਕ", doctors: "ਡਾਕਟਰ", appointments: "ਮੁਲਾਕਾਤਾਂ" },
  common: { save: "ਸੰਭਾਲੋ", cancel: "ਰੱਦ ਕਰੋ", search: "ਖੋਜ ਕਰੋ...", filter: "ਫਿਲਟਰ", tapToSpeak: "ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ" },
  home: { greeting: "ਸ਼ੁਭ ਸਵੇਰ", howAreYouFeeling: "ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?", quickRecord: "ਤੁਰੰਤ ਰਿਕਾਰਡ" }
});

export const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

export const translations = {
  en,
  hi,
  mr,
  bn,
  ta,
  te,
  kn,
  ml,
  gu,
  pa,
};
