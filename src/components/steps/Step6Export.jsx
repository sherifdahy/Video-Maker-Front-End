/** Step 6 — التصدير النهائي */
import { useState } from "react";
import axios from "axios";
import { Download, Copy, CheckCircle2, Loader2, Instagram, Smartphone } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const OUTPUT_FORMATS = [
  { id: "reels",   label: "Instagram Reels",  icon: "📸", desc: "1080×1920 · H.264" },
  { id: "tiktok",  label: "TikTok",           icon: "🎵", desc: "1080×1920 · H.264" },
  { id: "shorts",  label: "YouTube Shorts",   icon: "▶️",  desc: "1080×1920 · H.264" },
];

function ProgressBar({ progress, message }) {
  return (
    <div className="flex flex-col gap-3 anim-fade">
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: "var(--muted)" }}>{message}</span>
        <span className="font-bold" style={{ color: "var(--brand)" }}>{progress}%</span>
      </div>
      <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full progress-stripe transition-all duration-500"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, var(--brand-d), var(--brand))` }}
        />
      </div>
    </div>
  );
}

export default function Step6Export({
  url, startTime, endTime, quality,
  muteAudio, audioOnly,
  bgType, bgColor, bgPreset, bgImagePath, bgVideoPath, bgBlur, bgBrightness,
  videoScale, videoPosition, videoGlow,
  subtitleStyle, subtitleLang, srtJobId,
  watermarkText, overlayText, overlayPos,
  speakerName, speakerTitle,
  videoInfo,
  onSaveHistory,
}) {
  const [outputFormat, setOutputFormat] = useState("reels");
  const [processing,   setProcessing]   = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [progressMsg,  setProgressMsg]  = useState("");
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState("");
  const [copied,       setCopied]       = useState(false);

  const PROGRESS_MSGS = [
    "جاري تنزيل المقطع من يوتيوب...",
    "جاري تحضير الخلفية...",
    "جاري دمج الطبقات...",
    "جاري إضافة الترجمة والنصوص...",
    "جاري التصدير النهائي...",
  ];

  const handleExport = async () => {
    setError("");
    setResult(null);
    setProcessing(true);
    setProgress(5);
    setProgressMsg(PROGRESS_MSGS[0]);

    let msgIdx = 0;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 88) { clearInterval(timer); return p; }
        return p + Math.random() * 7;
      });
      msgIdx = (msgIdx + 1) % PROGRESS_MSGS.length;
      setProgressMsg(PROGRESS_MSGS[msgIdx]);
    }, 1800);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/clip`, {
        url, startTime, endTime, quality,
        muteAudio, audioOnly,
        bgType, bgColor, bgPreset,
        bgImagePath, bgVideoPath,
        bgBlur, bgBrightness,
        videoScale, videoPosition, videoGlow,
        subtitleStyle, subtitleLang, srtJobId,
        watermarkText, overlayText, overlayPos,
        speakerName, speakerTitle,
        outputFormat,
      });

      clearInterval(timer);
      setProgress(100);
      setProgressMsg("اكتمل بنجاح! 🎉");
      setResult(data);
      onSaveHistory?.({
        id: data.jobId,
        title: videoInfo?.title || url,
        startTime, endTime, quality,
        downloadUrl: data.downloadUrl,
        filename: data.filename,
        format: outputFormat,
        date: new Date().toLocaleString("ar-EG"),
      });
    } catch (e) {
      clearInterval(timer);
      setError(e.response?.data?.error || "حدث خطأ غير متوقع أثناء المعالجة");
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${API_URL}${result.downloadUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Format selector */}
      <div>
        <label className="text-xs font-semibold block mb-2" style={{ color: "var(--muted)" }}>
          منصة التصدير
        </label>
        <div className="grid grid-cols-3 gap-2">
          {OUTPUT_FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setOutputFormat(f.id)}
              className="rounded-xl p-3 text-center transition-all active:scale-95"
              style={outputFormat === f.id
                ? { background: "var(--brand)", color: "#fff", border: "1px solid var(--brand)" }
                : { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }
              }
            >
              <div className="text-xl mb-1">{f.icon}</div>
              <div className="font-bold text-xs">{f.label}</div>
              <div className="text-xs opacity-60 mt-0.5">{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary card */}
      <div className="glass2 rounded-xl p-4 flex flex-col gap-2 text-xs" style={{ color: "var(--muted)" }}>
        <div className="font-bold text-sm mb-1" style={{ color: "var(--text)" }}>ملخص الإعدادات</div>
        {[
          ["الوقت", `${startTime} ← ${endTime}`],
          ["الجودة", `${quality}p`],
          ["الخلفية", bgType === "none" ? "بدون" : bgType === "preset" ? bgPreset : bgType],
          ["حجم الفيديو", `${videoScale}%`],
          ["الموضع", videoPosition],
          ["الترجمة", subtitleStyle === "none" ? "بدون" : subtitleStyle],
          ["المتحدث", speakerName || "—"],
          ["العلامة المائية", watermarkText || "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span>{k}</span>
            <span className="font-medium" dir="ltr" style={{ color: "var(--text)" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-3 border border-red-400/30 anim-fade">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Progress */}
      {processing && <ProgressBar progress={Math.round(progress)} message={progressMsg} />}

      {/* Result */}
      {result && !processing && (
        <div className="glass rounded-2xl p-5 flex flex-col gap-4 border border-green-400/20 anim-slide">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-400" />
            <span className="font-bold" style={{ color: "var(--text)" }}>الريل جاهز للتنزيل!</span>
          </div>
          <div className="flex gap-3">
            <a
              href={`${API_URL}${result.downloadUrl}`}
              download={result.filename}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: `linear-gradient(135deg, var(--brand-d), var(--brand))` }}
            >
              <Download size={18} />
              تنزيل الريل
            </a>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold glass transition-all hover:opacity-80 active:scale-95"
              style={{ color: "var(--brand)" }}
            >
              {copied ? <CheckCircle2 size={17} className="text-green-400" /> : <Copy size={17} />}
              {copied ? "تم النسخ" : "نسخ"}
            </button>
          </div>
          <button
            onClick={() => { setResult(null); setProgress(0); }}
            className="text-xs self-center"
            style={{ color: "var(--muted)" }}
          >
            تصدير ريل آخر بنفس الإعدادات
          </button>
        </div>
      )}

      {/* Export button */}
      {!result && (
        <button
          onClick={handleExport}
          disabled={processing || !url}
          className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, var(--brand-d), var(--brand))`,
            boxShadow: "0 8px 32px var(--brand-glow)",
          }}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="anim-spin" />
              جاري إنشاء الريل...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              ✂️ قصّ وتصدير الريل
            </span>
          )}
        </button>
      )}
    </div>
  );
}
