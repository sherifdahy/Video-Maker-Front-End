/** إعدادات التطبيق — مفتاح Groq وخيارات التحليل */
import { useState } from "react";
import axios from "axios";
import { X, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Settings } from "lucide-react";
import { useToast } from "./Toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function SettingsModal({
  open, onClose,
  groqApiKey, setGroqApiKey,
  analysisMode, setAnalysisMode,
}) {
  const toast = useToast();
  const [showKey, setShowKey]     = useState(false);
  const [testing,  setTesting]    = useState(false);
  const [testResult, setTestResult] = useState(null); // 'ok' | 'fail' | null

  if (!open) return null;

  const save = (key, mode) => {
    setGroqApiKey(key);
    setAnalysisMode(mode);
    localStorage.setItem("groqApiKey",    key);
    localStorage.setItem("analysisMode",  mode);
  };

  const handleKeyChange = (val) => {
    save(val, analysisMode);
    setTestResult(null);
  };

  const handleModeChange = (mode) => {
    save(groqApiKey, mode);
  };

  const testConnection = async () => {
    if (!groqApiKey) { toast.error("أدخل مفتاح Groq أولاً"); return; }
    setTesting(true);
    setTestResult(null);
    try {
      await axios.post(`${API_URL}/api/analyze`, {
        transcript: "1\n00:00:01,000 --> 00:00:05,000\nاختبار الاتصال بـ Groq AI",
        duration: 60,
        groqApiKey,
      });
      setTestResult("ok");
      toast.success("✅ الاتصال بـ Groq ناجح!");
    } catch {
      setTestResult("fail");
      toast.error("❌ فشل الاتصال — تحقق من المفتاح");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-40 px-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      dir="rtl"
    >
      <div className="glass rounded-2xl p-6 w-full max-w-md flex flex-col gap-5 anim-slide">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} style={{ color: "var(--brand)" }} />
            <h2 className="font-black text-base" style={{ color: "var(--text)" }}>الإعدادات</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg glass hover:scale-110 transition-transform">
            <X size={16} style={{ color: "var(--muted)" }} />
          </button>
        </div>

        {/* Groq API Key */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold" style={{ color: "var(--text)" }}>
            مفتاح Groq API
          </label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center glass rounded-xl px-3 gap-2"
              style={{ border: "1px solid var(--border)" }}>
              <input
                type={showKey ? "text" : "password"}
                value={groqApiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                style={{ color: "var(--text)" }}
                dir="ltr"
              />
              <button onClick={() => setShowKey((s) => !s)} className="opacity-50 hover:opacity-100">
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              onClick={() => navigator.clipboard.readText().then(handleKeyChange).catch(() => toast.error("تعذّر قراءة الحافظة"))}
              className="px-3 rounded-xl glass text-xs font-bold transition-all hover:opacity-80 active:scale-95"
              style={{ color: "var(--brand)", border: "1px solid var(--border)" }}
            >
              لصق
            </button>
          </div>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{ color: "var(--brand)" }}
          >
            احصل على مفتاح مجاني من console.groq.com ←
          </a>
        </div>

        {/* Analysis Mode */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold" style={{ color: "var(--text)" }}>
            وضع التحليل
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "groq",  icon: "🤖", title: "Groq AI",       desc: "يتطلب مفتاح API" },
              { id: "local", icon: "📊", title: "تحليل ذكي",    desc: "مجاني دائماً" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                disabled={m.id === "groq" && !groqApiKey}
                className="rounded-xl p-3 text-right transition-all active:scale-95 disabled:opacity-40"
                style={analysisMode === m.id
                  ? { background: "var(--brand)", color: "#fff", border: "1px solid var(--brand)" }
                  : { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }
                }
              >
                <div className="text-lg mb-1">{m.icon}</div>
                <div className="font-bold text-xs">{m.title}</div>
                <div className="text-xs opacity-70 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Test connection */}
        <button
          onClick={testConnection}
          disabled={testing || !groqApiKey}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-80 active:scale-95 disabled:opacity-40"
          style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}
        >
          {testing
            ? <><Loader2 size={15} className="anim-spin" /> جاري الاختبار...</>
            : testResult === "ok"
            ? <><CheckCircle2 size={15} className="text-green-400" /> الاتصال ناجح</>
            : testResult === "fail"
            ? <><XCircle size={15} className="text-red-400" /> فشل الاتصال</>
            : "اختبار الاتصال"
          }
        </button>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: `linear-gradient(135deg, var(--brand-d), var(--brand))` }}
        >
          حفظ وإغلاق
        </button>
      </div>
    </div>
  );
}
