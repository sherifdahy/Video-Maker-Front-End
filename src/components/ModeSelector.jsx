/** اختيار وضع المعالجة — يدوي أو ذكاء اصطناعي */
import { Scissors, Sparkles, Settings } from "lucide-react";

export default function ModeSelector({ onPick, videoTitle, hasGroqKey, onOpenSettings }) {
  return (
    <div className="flex flex-col gap-5 anim-slide" dir="rtl">
      <div className="text-center">
        <h3 className="font-black text-base mb-1" style={{ color: "var(--text)" }}>
          كيف تريد اختيار المقطع؟
        </h3>
        {videoTitle && (
          <p className="text-xs truncate px-4" style={{ color: "var(--muted)" }}>{videoTitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Manual mode */}
        <button
          onClick={() => onPick("manual")}
          className="glass rounded-2xl p-5 text-right flex flex-col gap-3 transition-all hover:scale-[1.02] active:scale-95 card-hover"
          style={{ border: "2px solid var(--brand)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, var(--brand-d), var(--brand))` }}
          >
            <Scissors size={22} className="text-white" />
          </div>
          <div>
            <div className="font-black text-sm mb-1" style={{ color: "var(--text)" }}>وضع يدوي</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              حدد وقت البداية والنهاية بنفسك
            </div>
          </div>
        </button>

        {/* AI mode */}
        <button
          onClick={() => onPick("ai")}
          className="glass rounded-2xl p-5 text-right flex flex-col gap-3 transition-all hover:scale-[1.02] active:scale-95 card-hover relative overflow-hidden"
          style={{ border: "2px solid #8b5cf6" }}
        >
          {/* Free badge */}
          <span
            className="absolute top-3 left-3 text-white text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--success)", fontSize: "10px" }}
          >
            مجاني
          </span>

          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
          >
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <div className="font-black text-sm mb-1" style={{ color: "var(--text)" }}>
              وضع الذكاء الاصطناعي
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              اكتشاف أفضل المقاطع تلقائياً
            </div>
            {!hasGroqKey && (
              <div className="text-xs mt-1.5" style={{ color: "#8b5cf6" }}>
                سيستخدم التحليل الذكي المحلي (بدون API)
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Settings hint */}
      <button
        onClick={onOpenSettings}
        className="flex items-center justify-center gap-1.5 text-xs mx-auto transition-all hover:opacity-80"
        style={{ color: "var(--muted)" }}
      >
        <Settings size={12} />
        إعداد مفتاح Groq للتحليل المتقدم
      </button>
    </div>
  );
}
