/**
 * مقطّع الفيديو v2 — واجهة المعالج خطوة بخطوة
 * 6 خطوات: رابط → وقت → خلفية → تخطيط → نصوص → تصدير
 */

import { useState, useEffect } from "react";
import {
  Sun, Moon, Scissors, History, Trash2, Download,
  Copy, CheckCircle2, ChevronRight, ChevronLeft,
} from "lucide-react";

import PreviewPanel     from "./components/PreviewPanel";
import Step1Url         from "./components/steps/Step1Url";
import Step2Time        from "./components/steps/Step2Time";
import Step3Background  from "./components/steps/Step3Background";
import Step4Layout      from "./components/steps/Step4Layout";
import Step5Subtitles   from "./components/steps/Step5Subtitles";
import Step6Export      from "./components/steps/Step6Export";

// ── API URL Configuration ──────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── مساعد: تحويل HH:MM:SS ↔ ثوانٍ ─────────────────
const timeToSec = (t = "") => {
  const p = t.split(":").map(Number);
  if (p.some(isNaN)) return 0;
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0];
};
const isValidTime = (t) => /^\d{2}:\d{2}:\d{2}$/.test(t);

// ── تعريف الخطوات ────────────────────────────────────
const STEPS = [
  { id: 1, label: "رابط يوتيوب" },
  { id: 2, label: "توقيت" },
  { id: 3, label: "خلفية" },
  { id: 4, label: "تخطيط" },
  { id: 5, label: "نصوص" },
  { id: 6, label: "تصدير" },
];

// ── بطاقة السجل ──────────────────────────────────────
function HistoryCard({ item, onDelete }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(`${API_URL}${item.downloadUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3 anim-fade card-hover">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>{item.title}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
          {item.startTime} ← {item.endTime} · {item.quality}p · {item.format}
        </p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <a href={`${API_URL}${item.downloadUrl}`} download={item.filename}
          className="p-1.5 rounded-lg text-white transition-transform hover:scale-110"
          style={{ background: "var(--brand)" }}>
          <Download size={13} />
        </a>
        <button onClick={copy} className="p-1.5 rounded-lg glass hover:scale-110 transition-transform">
          {copied ? <CheckCircle2 size={13} className="text-green-400" /> : <Copy size={13} style={{ color: "var(--brand)" }} />}
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg glass hover:scale-110 transition-transform">
          <Trash2 size={13} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
export default function App() {
  // Theme
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Wizard step
  const [step, setStep] = useState(1);

  // ── Step 1: URL
  const [url,       setUrl]       = useState("");
  const [videoInfo, setVideoInfo] = useState(null);

  // ── Step 2: Time & quality
  const [startTime,      setStartTime]      = useState("00:00:00");
  const [endTime,        setEndTime]        = useState("00:00:30");
  const [quality,        setQuality]        = useState("720");
  const [durationPreset, setDurationPreset] = useState(null);
  const [timeErrors,     setTimeErrors]     = useState({});

  // ── Step 3: Background
  const [bgEnabled,    setBgEnabled]    = useState(null); // null = not asked
  const [bgType,       setBgType]       = useState("preset");
  const [bgColor,      setBgColor]      = useState("#0a1628");
  const [bgPreset,     setBgPreset]     = useState("islamic-dark");
  const [bgImageUrl,   setBgImageUrl]   = useState(null);
  const [bgImagePath,  setBgImagePath]  = useState(null);
  const [bgVideoUrl,   setBgVideoUrl]   = useState(null);
  const [bgVideoPath,  setBgVideoPath]  = useState(null);
  const [bgBlur,       setBgBlur]       = useState(0);
  const [bgBrightness, setBgBrightness] = useState(1);

  // ── Step 4: Layout
  const [videoScale,    setVideoScale]    = useState(85);
  const [videoPosition, setVideoPosition] = useState("center");
  const [videoGlow,     setVideoGlow]     = useState(false);
  const [layoutPreset,  setLayoutPreset]  = useState("center-card");

  // ── Step 5: Subtitles & overlays
  const [subtitleStyle, setSubtitleStyle] = useState("none");
  const [subtitleLang,  setSubtitleLang]  = useState("ar");
  const [srtJobId,      setSrtJobId]      = useState(null);
  const [transcript,    setTranscript]    = useState(null);
  const [overlayText,   setOverlayText]   = useState("");
  const [overlayPos,    setOverlayPos]    = useState("bottom");
  const [speakerName,   setSpeakerName]   = useState("");
  const [speakerTitle,  setSpeakerTitle]  = useState("");
  const [watermarkText, setWatermarkText] = useState("");
  const [muteAudio,     setMuteAudio]     = useState(false);
  const [audioOnly,     setAudioOnly]     = useState(false);

  // ── History
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reelHistory") || "[]"); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  useEffect(() => { localStorage.setItem("reelHistory", JSON.stringify(history)); }, [history]);

  // ── Validation ────────────────────────────────────
  const validateStep = () => {
    if (step === 1) return !!videoInfo;
    if (step === 2) {
      const errs = {};
      if (!isValidTime(startTime)) errs.start = "صيغة غير صحيحة";
      if (!isValidTime(endTime))   errs.end   = "صيغة غير صحيحة";
      if (!errs.start && !errs.end) {
        if (timeToSec(endTime) <= timeToSec(startTime)) errs.end = "يجب أن يكون بعد وقت البداية";
      }
      setTimeErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (step === 3) return bgEnabled !== null;
    return true;
  };

  const goNext = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 6)); };
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const stepLabels = {
    1: "الصق رابط فيديو يوتيوب للمتابعة",
    2: "حدد توقيت المقطع وجودته",
    3: "اختر خلفية للريل",
    4: "تحكم في موضع وحجم الفيديو",
    5: "أضف ترجمة ونصوصاً ومتحدثاً",
    6: "اختر منصة التصدير وابدأ",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }} dir="rtl">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl anim-pulse"
          style={{ background: "radial-gradient(circle, var(--brand), transparent)" }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-8 blur-3xl anim-pulse"
          style={{ background: "radial-gradient(circle, #818cf8, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6 flex flex-col gap-0" style={{ zIndex: 1 }}>

        {/* ─── Header ─── */}
        <header className="flex items-center justify-between mb-6 anim-fade">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11">
              <div className="ripple-ring absolute inset-0 rounded-full opacity-40"
                style={{ border: "2px solid var(--brand)" }} />
              <div className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, var(--brand-d), var(--brand))` }}>
                <Scissors size={20} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>مقطّع الريل</h1>
              <p className="text-xs" style={{ color: "var(--muted)" }}>صانع ريلز احترافي من يوتيوب</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory((h) => !h)}
              className="p-2 rounded-xl glass transition-all hover:scale-110 active:scale-95 relative"
              title="سجل التنزيلات"
            >
              <History size={18} style={{ color: "var(--brand)" }} />
              {history.length > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
                  style={{ fontSize: "9px", background: "var(--brand)" }}>
                  {history.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-xl glass transition-all hover:scale-110 active:scale-95"
            >
              {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} style={{ color: "var(--brand)" }} />}
            </button>
          </div>
        </header>

        {/* ─── History panel ─── */}
        {showHistory && (
          <div className="glass rounded-2xl p-4 mb-5 flex flex-col gap-3 anim-slide">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm" style={{ color: "var(--text)" }}>
                سجل التنزيلات ({history.length})
              </span>
              <div className="flex gap-2">
                <button onClick={() => setHistory([])} className="text-xs text-red-400 hover:underline">
                  مسح الكل
                </button>
                <button onClick={() => setShowHistory(false)} className="text-xs" style={{ color: "var(--muted)" }}>
                  إغلاق
                </button>
              </div>
            </div>
            {history.length === 0 && (
              <p className="text-xs text-center" style={{ color: "var(--muted)" }}>لا يوجد سجل بعد</p>
            )}
            {history.map((item) => (
              <HistoryCard key={item.id} item={item}
                onDelete={(id) => setHistory((h) => h.filter((i) => i.id !== id))} />
            ))}
          </div>
        )}

        {/* ─── Main layout: wizard + preview ─── */}
        <div className="flex gap-6 items-start">

          {/* Left: Wizard */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Step indicator */}
            <div className="flex items-center gap-0 anim-fade">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? "1" : "none" }}>
                  <button
                    onClick={() => { if (s.id < step || (s.id === step + 1 && validateStep())) setStep(s.id); }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`step-dot ${step === s.id ? "active" : step > s.id ? "done" : ""}`}>
                      {step > s.id ? "✓" : s.id}
                    </div>
                    <span className="text-xs font-medium hidden sm:block"
                      style={{ color: step === s.id ? "var(--brand)" : "var(--muted)", whiteSpace: "nowrap" }}>
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`step-connector ${step > s.id ? "done" : ""}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step card */}
            <div className="glass rounded-2xl p-5 anim-slide" key={step}>
              <div className="mb-4">
                <h2 className="font-black text-base" style={{ color: "var(--text)" }}>
                  الخطوة {step} / {STEPS.length} — {STEPS[step - 1].label}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{stepLabels[step]}</p>
              </div>

              {/* Render active step */}
              {step === 1 && (
                <Step1Url url={url} setUrl={setUrl} videoInfo={videoInfo} setVideoInfo={setVideoInfo} />
              )}
              {step === 2 && (
                <Step2Time
                  videoInfo={videoInfo}
                  startTime={startTime} setStartTime={setStartTime}
                  endTime={endTime}     setEndTime={setEndTime}
                  quality={quality}     setQuality={setQuality}
                  durationPreset={durationPreset} setDurationPreset={setDurationPreset}
                  timeErrors={timeErrors} setTimeErrors={setTimeErrors}
                />
              )}
              {step === 3 && (
                <Step3Background
                  bgEnabled={bgEnabled}    setBgEnabled={setBgEnabled}
                  bgType={bgType}          setBgType={setBgType}
                  bgColor={bgColor}        setBgColor={setBgColor}
                  bgPreset={bgPreset}      setBgPreset={setBgPreset}
                  bgImageUrl={bgImageUrl}  setBgImageUrl={setBgImageUrl}
                  setBgImagePath={setBgImagePath}
                  bgVideoUrl={bgVideoUrl}  setBgVideoUrl={setBgVideoUrl}
                  setBgVideoPath={setBgVideoPath}
                  bgBlur={bgBlur}          setBgBlur={setBgBlur}
                  bgBrightness={bgBrightness} setBgBrightness={setBgBrightness}
                />
              )}
              {step === 4 && (
                <Step4Layout
                  videoScale={videoScale}      setVideoScale={setVideoScale}
                  videoPosition={videoPosition} setVideoPosition={setVideoPosition}
                  videoGlow={videoGlow}         setVideoGlow={setVideoGlow}
                  layoutPreset={layoutPreset}   setLayoutPreset={setLayoutPreset}
                />
              )}
              {step === 5 && (
                <Step5Subtitles
                  url={url}
                  subtitleStyle={subtitleStyle} setSubtitleStyle={setSubtitleStyle}
                  subtitleLang={subtitleLang}   setSubtitleLang={setSubtitleLang}
                  srtJobId={srtJobId}           setSrtJobId={setSrtJobId}
                  transcript={transcript}       setTranscript={setTranscript}
                  overlayText={overlayText}     setOverlayText={setOverlayText}
                  overlayPos={overlayPos}       setOverlayPos={setOverlayPos}
                  speakerName={speakerName}     setSpeakerName={setSpeakerName}
                  speakerTitle={speakerTitle}   setSpeakerTitle={setSpeakerTitle}
                  watermarkText={watermarkText} setWatermarkText={setWatermarkText}
                  muteAudio={muteAudio}         setMuteAudio={setMuteAudio}
                  audioOnly={audioOnly}         setAudioOnly={setAudioOnly}
                />
              )}
              {step === 6 && (
                <Step6Export
                  url={url} startTime={startTime} endTime={endTime} quality={quality}
                  muteAudio={muteAudio} audioOnly={audioOnly}
                  bgType={bgType} bgColor={bgColor} bgPreset={bgPreset}
                  bgImagePath={bgImagePath} bgVideoPath={bgVideoPath}
                  bgBlur={bgBlur} bgBrightness={bgBrightness}
                  videoScale={videoScale} videoPosition={videoPosition} videoGlow={videoGlow}
                  subtitleStyle={subtitleStyle} subtitleLang={subtitleLang} srtJobId={srtJobId}
                  watermarkText={watermarkText} overlayText={overlayText} overlayPos={overlayPos}
                  speakerName={speakerName} speakerTitle={speakerTitle}
                  videoInfo={videoInfo}
                  onSaveHistory={(entry) => setHistory((h) => [entry, ...h].slice(0, 20))}
                />
              )}

              {/* Navigation buttons */}
              <div className={`flex mt-6 gap-3 ${step === 1 ? "justify-end" : "justify-between"}`}>
                {step > 1 && (
                  <button
                    onClick={goPrev}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold glass transition-all hover:opacity-80 active:scale-95"
                    style={{ color: "var(--muted)" }}
                  >
                    <ChevronRight size={16} />
                    السابق
                  </button>
                )}
                {step < 6 && (
                  <button
                    onClick={goNext}
                    disabled={step === 1 && !videoInfo}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                    style={{ background: `linear-gradient(135deg, var(--brand-d), var(--brand))` }}
                  >
                    التالي
                    <ChevronLeft size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="hidden lg:flex flex-col gap-4 sticky top-6">
            <PreviewPanel
              videoInfo={videoInfo}
              bgType={bgEnabled === false ? "none" : bgType}
              bgColor={bgColor}
              bgPreset={bgPreset}
              bgImageUrl={bgImageUrl}
              bgBlur={bgBlur}
              bgBrightness={bgBrightness}
              videoScale={videoScale}
              videoPosition={videoPosition}
              videoGlow={videoGlow}
              subtitleStyle={subtitleStyle}
              overlayText={overlayText}
              overlayPos={overlayPos}
              speakerName={speakerName}
              speakerTitle={speakerTitle}
              watermarkText={watermarkText}
            />
            {/* Step mini-guide */}
            <div className="glass rounded-xl p-3 w-44">
              <p className="text-xs font-bold mb-2" style={{ color: "var(--text)" }}>الخطوة الحالية:</p>
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 py-1 text-xs"
                  style={{ color: step === s.id ? "var(--brand)" : step > s.id ? "var(--success)" : "var(--muted)" }}
                >
                  <span>{step > s.id ? "✓" : step === s.id ? "▶" : "○"}</span>
                  <span className={step === s.id ? "font-bold" : ""}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs mt-6 pb-2" style={{ color: "var(--muted)" }}>
          يعمل بـ yt-dlp + ffmpeg · للاستخدام الشخصي فقط · v2.0
        </footer>
      </div>
    </div>
  );
}
