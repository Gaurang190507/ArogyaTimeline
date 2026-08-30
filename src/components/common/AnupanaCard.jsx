import React, { useState, useRef } from "react";
import { Play, Pause, Square, Volume2, Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useFamily } from "../../context/FamilyContext";
import { buildAnupanaScript, speakAnupana, stopSpeaking } from "../../services/anupanaService";

/**
 * AnupanaCard — Plays back a structured Anupana voice note (post-consultation
 * summary: dosage, Anupana, Pathya, Apathya) using Web Speech API TTS in the
 * selected language.
 *
 * Props:
 *   record       — a health_records row (with metadata.medications, pathya, apathya)
 *   compact      — show as a small inline pill instead of full card
 *   patientName  — optional override (otherwise uses active member / user name)
 */
export const AnupanaCard = ({ record, compact = false, patientName = null }) => {
  const { currentLang } = useLanguage();
  const { displayName } = useFamily();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const utteranceRef = useRef(null);

  const name = patientName || displayName || "Patient";
  const script = buildAnupanaScript(record, currentLang, name);

  const handlePlay = async () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    setHasPlayed(true);
    try {
      await speakAnupana(script, currentLang);
    } catch (err) {
      console.error("Anupana TTS error:", err);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    stopSpeaking();
    setIsPlaying(false);
  };

  const langLabels = {
    en: "English", hi: "हिन्दी", ta: "தமிழ்", te: "తెలుగు",
    bn: "বাংলা", mr: "मराठी", gu: "ગુજરાતી", kn: "ಕನ್ನಡ",
    ml: "മലയാളം", pa: "ਪੰਜਾਬੀ",
  };

  // ── Compact inline pill (for use in lists) ──
  if (compact) {
    return (
      <button
        type="button"
        onClick={handlePlay}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          isPlaying
            ? "bg-rose-500 text-white animate-pulse"
            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
        }`}
        title={`Play Anupana voice note in ${langLabels[currentLang] || "English"}`}
      >
        {isPlaying ? (
          <>
            <Square className="w-3 h-3 fill-white" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3 h-3" />
            <span>Play Anupana</span>
          </>
        )}
      </button>
    );
  }

  // ── Full card ──
  const medCount = record?.metadata?.medications?.length || 0;
  const pathyaCount = record?.metadata?.pathya?.length || 0;
  const apathyaCount = record?.metadata?.apathya?.length || 0;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Anupana Voice Explainer</span>
          </div>
          <h4 className="text-sm font-bold text-slate-800 mt-1">
            {record?.title || "Post-consultation summary"}
          </h4>
          {medCount + pathyaCount + apathyaCount > 0 && (
            <p className="text-[11px] text-slate-500 mt-1">
              {medCount > 0 && `${medCount} medicine${medCount > 1 ? "s" : ""}`}
              {pathyaCount > 0 && ` • ${pathyaCount} pathya`}
              {apathyaCount > 0 && ` • ${apathyaCount} apathya`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
          <Languages className="w-3 h-3" />
          <span>{langLabels[currentLang] || "English"}</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-emerald-100">
        A WhatsApp-style voice note reads aloud the prescription, Anupana
        (with-food/empty-stomach), Pathya (recommended) and Apathya (avoid)
        in your preferred language.
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePlay}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            isPlaying
              ? "bg-rose-500 text-white shadow-md shadow-rose-200"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Pause Voice Note</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{hasPlayed ? "Play Again" : "Play Anupana"}</span>
            </>
          )}
        </button>

        {isPlaying && (
          <button
            type="button"
            onClick={handleStop}
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            title="Stop voice note"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
