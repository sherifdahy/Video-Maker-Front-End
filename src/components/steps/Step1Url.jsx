/** Step 1 — رابط يوتيوب */
import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { Link2, Loader2, X, Play, CheckCircle2 } from "lucide-react";

export default function Step1Url({ url, setUrl, videoInfo, setVideoInfo }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const timerRef = useRef(null);

  const fetchInfo = useCallback(async (u) => {
    if (!u || !/youtube\.com|youtu\.be/i.test(u)) return;
    setLoading(true);
    setVideoInfo(null);
    setError("");
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/info`, { url: u });
      setVideoInfo(data);
    } catch (e) {
      setError(e.response?.data?.error || "تعذّر جلب معلومات الفيديو");
    } finally {
      setLoading(false);
    }
  }, [setVideoInfo]);

  const handleChange = (v) => {
    setUrl(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchInfo(v), 900);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* URL field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
          رابط الفيديو على يوتيوب
        </label>
        <div
          className="glass rounded-2xl flex items-center gap-3 px-4 transition-all"
          style={{ border: "1px solid var(--border)" }}
        >
          <Link2 size={18} style={{ color: "var(--brand)", flexShrink: 0 }} />
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 bg-transparent py-4 text-sm"
            style={{ color: "var(--text)" }}
            dir="ltr"
          />
          {loading && <Loader2 size={18} className="anim-spin" style={{ color: "var(--brand)" }} />}
          {url && !loading && (
            <button onClick={() => { setUrl(""); setVideoInfo(null); setError(""); }}
              className="hover:opacity-70 transition-opacity">
              <X size={16} style={{ color: "var(--muted)" }} />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-3 flex items-start gap-2 border border-red-400/30 anim-fade">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Video card */}
      {videoInfo && (
        <div className="glass rounded-2xl overflow-hidden anim-slide card-hover">
          <div className="relative" style={{ aspectRatio: "16/9" }}>
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full p-3" style={{ background: "rgba(0,0,0,.55)" }}>
                <Play size={28} className="text-white" fill="white" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 rounded-lg px-2 py-0.5 text-xs font-bold text-white"
              style={{ background: "rgba(0,0,0,.75)" }} dir="ltr">
              {videoInfo.durationStr}
            </div>
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg px-2 py-0.5"
              style={{ background: "rgba(0,0,0,.65)" }}>
              <CheckCircle2 size={12} className="text-green-400" />
              <span className="text-xs text-green-300 font-medium">تم التحقق</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-sm line-clamp-2 mb-1" style={{ color: "var(--text)" }}>
              {videoInfo.title}
            </h3>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{videoInfo.channel}</p>
            {videoInfo.hasSubtitles && (
              <p className="text-xs mt-2 text-green-400 font-medium">
                ✓ ترجمة متاحة: {videoInfo.availableLangs.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      {!videoInfo && !loading && (
        <div className="glass2 rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
          style={{ border: "1px dashed var(--border)" }}>
          <div className="text-4xl opacity-20">📺</div>
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            الصق رابط يوتيوب أعلاه لتبدأ
          </p>
        </div>
      )}
    </div>
  );
}
