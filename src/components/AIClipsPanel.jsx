/** لوحة المقاطع المقترحة من الذكاء الاصطناعي */
import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Loader2, CheckCircle2, Edit3, X, Sparkles } from "lucide-react";
import { useToast } from "./Toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const TYPE_META = {
  hook:      { label: "هوك",      bg: "#ef4444", text: "#fff" },
  emotional: { label: "عاطفي",    bg: "#8b5cf6", text: "#fff" },
  funny:     { label: "مضحك",     bg: "#eab308", text: "#000" },
  dramatic:  { label: "درامي",    bg: "#6b7280", text: "#fff" },
  important: { label: "مهم",      bg: "var(--brand)", text: "#fff" },
  viral:     { label: "فيروسي",   bg: "#f97316", text: "#fff" },
};

function secFromTimestamp(t = "") {
  const p = t.split(":").map(Number);
  if (p.some(isNaN)) return 0;
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0);
}

function ScoreBar({ score }) {
  const color = score >= 80 ? "var(--success)" : score >= 60 ? "#eab308" : "#f97316";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-black w-8 text-left" style={{ color }}>{score}%</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <div className="shimmer h-4 w-3/4 rounded" />
      <div className="shimmer h-2 w-full rounded" />
      <div className="shimmer h-2 w-1/2 rounded" />
      <div className="flex gap-2 mt-1">
        {[1, 2, 3].map((i) => <div key={i} className="shimmer h-8 flex-1 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function AIClipsPanel({
  url, videoInfo,
  groqApiKey, analysisMode,
  setTranscript, setSrtJobId,
  onUseClip, onEditClip, onBack,
}) {
  const toast = useToast();
  const [loading,   setLoading]   = useState(true);
  const [loadStep,  setLoadStep]  = useState("جاري تحميل الترجمة...");
  const [clips,     setClips]     = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [error,     setError]     = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // 1. fetch transcript
        setLoadStep("جاري تحميل الترجمة...");
        const { data: tData } = await axios.post(`${API_URL}/api/transcript`, { url, lang: "ar" });
        if (cancelled) return;
        if (tData.transcript) {
          setTranscript(tData.transcript);
          setSrtJobId(tData.srtJobId);
        }

        // 2. analyze
        setLoadStep("جاري تحليل المحتوى بالذكاء الاصطناعي...");
        const useGroq = analysisMode === "groq" && groqApiKey;
        const endpoint = useGroq ? "/api/analyze" : "/api/analyze-local";
        const payload = useGroq
          ? { transcript: tData.transcript || "", duration: videoInfo?.duration || 600, groqApiKey }
          : { transcript: tData.transcript || "", duration: videoInfo?.duration || 600 };
        const { data: aData } = await axios.post(`${API_URL}${endpoint}`, payload);
        if (cancelled) return;
        setClips(aData.clips || []);
        if (!aData.clips?.length) setError("لم يُقترح أي مقطع — جرّب نمطاً مختلفاً");
      } catch (e) {
        if (cancelled) return;
        const msg = e.response?.data?.error || e.message || "خطأ في التحليل";
        setError(msg);
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const visible = clips.filter((_, i) => !dismissed.has(i));

  return (
    <div className="flex flex-col gap-4 anim-slide" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 rounded-lg glass hover:scale-110 transition-transform">
          <ChevronRight size={16} style={{ color: "var(--muted)" }} />
        </button>
        <Sparkles size={16} style={{ color: "#8b5cf6" }} />
        <span className="font-black text-sm" style={{ color: "var(--text)" }}>
          المقاطع المقترحة
        </span>
        {!loading && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
            {visible.length} مقطع
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
            <Loader2 size={15} className="anim-spin" />
            {loadStep}
          </div>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="glass rounded-xl p-4 text-center flex flex-col gap-3" style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={onBack}
            className="text-xs mx-auto"
            style={{ color: "var(--brand)" }}
          >
            العودة لاختيار الوضع
          </button>
        </div>
      )}

      {/* Clips */}
      <AnimatePresence>
        {!loading && visible.map((clip, origIdx) => {
          const idx = clips.indexOf(clip);
          const meta = TYPE_META[clip.type] || TYPE_META.important;
          const durSec = secFromTimestamp(clip.end) - secFromTimestamp(clip.start);

          return (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-4 flex flex-col gap-3"
            >
              {/* Type badge + timing */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full"
                  style={{ background: meta.bg, color: meta.text }}
                >
                  {meta.label}
                </span>
                <span className="text-xs font-mono" dir="ltr" style={{ color: "var(--muted)" }}>
                  {clip.start} → {clip.end}
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {durSec} ثانية
                </span>
              </div>

              {/* Score */}
              <ScoreBar score={clip.score} />

              {/* Reason */}
              {clip.reason && (
                <p className="text-xs" style={{ color: "var(--text)" }}>{clip.reason}</p>
              )}

              {/* Keywords */}
              {clip.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {clip.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  onClick={() => onUseClip(clip)}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                  style={{ background: "var(--success)" }}
                >
                  <CheckCircle2 size={13} /> استخدام
                </button>
                <button
                  onClick={() => onEditClip(clip)}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}
                >
                  <Edit3 size={13} /> تعديل
                </button>
                <button
                  onClick={() => setDismissed((s) => new Set([...s, idx]))}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  <X size={13} /> تجاهل
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* All dismissed */}
      {!loading && !error && visible.length === 0 && clips.length > 0 && (
        <div className="glass rounded-xl p-4 text-center text-sm" style={{ color: "var(--muted)" }}>
          تم تجاهل جميع المقاطع.
          <button onClick={() => setDismissed(new Set())} className="block mx-auto mt-2 text-xs" style={{ color: "var(--brand)" }}>
            إعادة عرضها
          </button>
        </div>
      )}
    </div>
  );
}
