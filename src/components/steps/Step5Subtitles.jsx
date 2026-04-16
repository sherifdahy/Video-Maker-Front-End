/** Step 5 — الترجمة وبطاقة المتحدث والنصوص */
import { useState } from "react";
import axios from "axios";
import { Loader2, FileText, User, Type, Volume2, VolumeX } from "lucide-react";

const SUB_STYLES = [
  { id: "none",           label: "بدون ترجمة" },
  { id: "center-box",    label: "صندوق وسطي" },
  { id: "bottom-captions", label: "كابشن أسفل" },
];

const OVERLAY_POS = [
  { id: "top",    label: "أعلى" },
  { id: "bottom", label: "أسفل" },
];

function Toggle({ label, desc, value, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <div className={`toggle-track mt-0.5 ${value ? "on" : ""}`} onClick={() => onChange(!value)}>
        <div className="toggle-thumb" />
      </div>
      <div>
        <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{desc}</div>}
      </div>
    </label>
  );
}

export default function Step5Subtitles({
  url,
  subtitleStyle, setSubtitleStyle,
  subtitleLang, setSubtitleLang,
  srtJobId, setSrtJobId,
  transcript, setTranscript,
  overlayText, setOverlayText,
  overlayPos, setOverlayPos,
  speakerName, setSpeakerName,
  speakerTitle, setSpeakerTitle,
  watermarkText, setWatermarkText,
  muteAudio, setMuteAudio,
  audioOnly, setAudioOnly,
}) {
  const [loadingSub, setLoadingSub] = useState(false);
  const [subError,   setSubError]   = useState("");

  const fetchTranscript = async () => {
    if (!url) return setSubError("أدخل رابط الفيديو أولاً في الخطوة 1");
    setLoadingSub(true);
    setSubError("");
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/transcript`, { url, lang: subtitleLang });
      setTranscript(data.transcript);
      setSrtJobId(data.srtJobId);
      if (!data.transcript) setSubError(data.message || "لا توجد ترجمة");
    } catch (e) {
      setSubError(e.response?.data?.error || "خطأ في استخراج الترجمة");
    } finally {
      setLoadingSub(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Subtitle system ─── */}
      <div className="glass2 rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FileText size={15} style={{ color: "var(--brand)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--text)" }}>الترجمة التلقائية</span>
        </div>

        {/* Style selector */}
        <div className="grid grid-cols-3 gap-2">
          {SUB_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubtitleStyle(s.id)}
              className="py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={subtitleStyle === s.id
                ? { background: "var(--brand)", color: "#fff" }
                : { background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        {subtitleStyle !== "none" && (
          <>
            {/* Language selector */}
            <div className="flex gap-2">
              {[{ v: "ar", l: "عربي" }, { v: "en", l: "إنجليزي" }].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setSubtitleLang(v)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                  style={subtitleLang === v
                    ? { background: "var(--brand)", color: "#fff" }
                    : { background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }
                  }
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Fetch button */}
            <button
              onClick={fetchTranscript}
              disabled={loadingSub}
              className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, var(--brand-d), var(--brand))` }}
            >
              {loadingSub ? <><Loader2 size={16} className="anim-spin" /> جاري الاستخراج...</>
                          : "استخراج الترجمة التلقائياً"}
            </button>

            {subError && <p className="text-xs text-red-400">{subError}</p>}

            {transcript && (
              <div className="glass rounded-xl p-3 max-h-28 overflow-y-auto">
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  {transcript.slice(0, 400)}{transcript.length > 400 ? "..." : ""}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Speaker card ─── */}
      <div className="glass2 rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <User size={15} style={{ color: "var(--brand)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--text)" }}>بطاقة المتحدث</span>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--muted)" }}>
              اسم المتحدث / الشيخ
            </label>
            <input
              type="text"
              placeholder="الشيخ / المتحدث"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              className="glass rounded-xl px-4 py-2.5 w-full text-sm"
              style={{ color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--muted)" }}>
              اللقب / الصفة
            </label>
            <input
              type="text"
              placeholder="عالم / داعية / مفكر..."
              value={speakerTitle}
              onChange={(e) => setSpeakerTitle(e.target.value)}
              className="glass rounded-xl px-4 py-2.5 w-full text-sm"
              style={{ color: "var(--text)" }}
            />
          </div>
        </div>
      </div>

      {/* ── Text overlay ─── */}
      <div className="glass2 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Type size={15} style={{ color: "var(--brand)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--text)" }}>تراكب نص (آية / اقتباس)</span>
        </div>
        <textarea
          rows={3}
          placeholder="﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾"
          value={overlayText}
          onChange={(e) => setOverlayText(e.target.value)}
          className="glass rounded-xl px-4 py-2.5 w-full text-sm resize-none"
          style={{ color: "var(--text)" }}
        />
        <div className="flex gap-2">
          {OVERLAY_POS.map((p) => (
            <button
              key={p.id}
              onClick={() => setOverlayPos(p.id)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={overlayPos === p.id
                ? { background: "var(--brand)", color: "#fff" }
                : { background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Watermark ─── */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
          علامة مائية (اسم القناة)
        </label>
        <input
          type="text"
          placeholder="@اسم_قناتك"
          value={watermarkText}
          onChange={(e) => setWatermarkText(e.target.value)}
          className="glass rounded-xl px-4 py-2.5 w-full text-sm"
          style={{ color: "var(--text)" }}
        />
      </div>

      {/* ── Audio options ─── */}
      <div className="glass2 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Volume2 size={15} style={{ color: "var(--brand)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--text)" }}>خيارات الصوت</span>
        </div>
        <Toggle
          label="كتم الصوت"
          desc="فيديو بدون صوت"
          value={muteAudio}
          onChange={(v) => { setMuteAudio(v); if (v) setAudioOnly(false); }}
        />
        <Toggle
          label="صوت فقط"
          desc="استخراج الصوت دون فيديو"
          value={audioOnly}
          onChange={(v) => { setAudioOnly(v); if (v) setMuteAudio(false); }}
        />
      </div>
    </div>
  );
}
