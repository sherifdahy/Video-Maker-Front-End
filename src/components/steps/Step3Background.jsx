/** Step 3 — نظام الخلفية */
import { useRef } from "react";
import { Upload, Palette, Image, Video, Layers } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const BG_TYPES = [
  { id: "none",   label: "بدون خلفية",    icon: <Layers size={16} /> },
  { id: "preset", label: "خلفية مسبقة",   icon: <Palette size={16} /> },
  { id: "color",  label: "لون ثابت",      icon: <div className="w-4 h-4 rounded-full bg-sky-400" /> },
  { id: "image",  label: "صورة",           icon: <Image size={16} /> },
  { id: "video",  label: "فيديو حلقي",    icon: <Video size={16} /> },
];

const PRESETS = [
  { id: "islamic-dark",  label: "إسلامي داكن",  from: "#0a1628", to: "#1a3a2a" },
  { id: "deep-ocean",    label: "عمق المحيط",   from: "#000814", to: "#003566" },
  { id: "emerald",       label: "الزمرد",        from: "#0d2b1a", to: "#1a4a2e" },
  { id: "desert-dusk",   label: "غسق الصحراء",  from: "#2d1b0e", to: "#5a3010" },
  { id: "midnight",      label: "منتصف الليل",  from: "#0d0221", to: "#190d3a" },
  { id: "dark-slate",    label: "رمادي داكن",   from: "#0f172a", to: "#1e293b" },
  { id: "warm-black",    label: "أسود دافئ",    from: "#0c0a09", to: "#1c1917" },
  { id: "islamic-green", label: "أخضر إسلامي",  from: "#052e16", to: "#14532d" },
];

function SliderRow({ label, value, min, max, step = 1, onChange, unit = "" }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs" style={{ color: "var(--muted)" }}>
        <span>{label}</span>
        <span className="font-bold" style={{ color: "var(--brand)" }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none"
        style={{ background: `linear-gradient(to left, var(--border) ${100 - ((value - min) / (max - min)) * 100}%, var(--brand) 0)` }}
      />
    </div>
  );
}

export default function Step3Background({
  bgEnabled, setBgEnabled,
  bgType, setBgType,
  bgColor, setBgColor,
  bgPreset, setBgPreset,
  bgImageUrl, setBgImageUrl, setBgImagePath,
  bgVideoUrl, setBgVideoUrl, setBgVideoPath,
  bgBlur, setBgBlur,
  bgBrightness, setBgBrightness,
}) {
  const imgRef = useRef(null);
  const vidRef = useRef(null);

  const handleUpload = async (file, isVideo) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API_URL}/api/upload-bg`, { method: "POST", body: fd });
      const data = await res.json();
      if (isVideo) {
        setBgVideoPath(data.path);
        setBgVideoUrl(`${API_URL}${data.url}`);
        setBgType("video");
      } else {
        setBgImagePath(data.path);
        setBgImageUrl(URL.createObjectURL(file));
        setBgType("image");
      }
    } catch {
      alert("فشل رفع الملف");
    }
  };

  // ── Prompt: do you want a background? ────────────
  if (bgEnabled === null) {
    return (
      <div className="flex flex-col items-center gap-8 py-6 anim-slide">
        <div className="text-center">
          <div className="text-5xl mb-4">🎨</div>
          <h2 className="text-xl font-black mb-2" style={{ color: "var(--text)" }}>
            هل تريد إضافة خلفية؟
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            أضف خلفية إسلامية أو لونية أو صورة لجعل الريل احترافياً
          </p>
        </div>
        <div className="flex gap-4 w-full max-w-xs">
          <button
            onClick={() => { setBgEnabled(true); setBgType("preset"); }}
            className="flex-1 py-4 rounded-2xl font-black text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, var(--brand-d), var(--brand))` }}
          >
            نعم، أضف خلفية
          </button>
          <button
            onClick={() => { setBgEnabled(false); setBgType("none"); }}
            className="flex-1 py-4 rounded-2xl font-bold transition-all hover:opacity-80 active:scale-95 glass"
            style={{ color: "var(--muted)" }}
          >
            لا، بدون خلفية
          </button>
        </div>
      </div>
    );
  }

  if (!bgEnabled) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="text-3xl opacity-30">🚫</div>
        <p className="text-sm" style={{ color: "var(--muted)" }}>لا توجد خلفية — سيُصدَّر الفيديو بخلفية سوداء</p>
        <button
          onClick={() => setBgEnabled(null)}
          className="text-sm font-semibold"
          style={{ color: "var(--brand)" }}
        >
          تغيير الاختيار
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Type selector */}
      <div className="grid grid-cols-5 gap-1.5">
        {BG_TYPES.filter((t) => t.id !== "none").map((t) => (
          <button
            key={t.id}
            onClick={() => setBgType(t.id)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={bgType === t.id
              ? { background: "var(--brand)", color: "#fff" }
              : { background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }
            }
          >
            {t.icon}
            <span style={{ fontSize: "10px" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Preset grid */}
      {bgType === "preset" && (
        <div className="flex flex-col gap-3 anim-fade">
          <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>اختر خلفية</label>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setBgPreset(p.id)}
                className="flex flex-col gap-1 rounded-xl overflow-hidden transition-all active:scale-95 hover:scale-105"
                style={{
                  outline: bgPreset === p.id ? "2px solid var(--brand)" : "none",
                  outlineOffset: "2px",
                }}
              >
                <div
                  className="w-full h-12 rounded-lg"
                  style={{ background: `linear-gradient(180deg, ${p.from}, ${p.to})` }}
                />
                <span className="text-xs pb-1 text-center" style={{ color: "var(--muted)", fontSize: "9px" }}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Solid color */}
      {bgType === "color" && (
        <div className="flex items-center gap-4 anim-fade">
          <label className="text-sm font-semibold" style={{ color: "var(--muted)" }}>اختر اللون</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-14 h-10 rounded-xl cursor-pointer border"
            style={{ borderColor: "var(--border)" }}
          />
          <span className="text-sm font-mono" style={{ color: "var(--muted)" }}>{bgColor}</span>
        </div>
      )}

      {/* Image upload */}
      {bgType === "image" && (
        <div className="flex flex-col gap-3 anim-fade">
          <input ref={imgRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleUpload(e.target.files[0], false)} />
          <button
            onClick={() => imgRef.current?.click()}
            className="glass2 rounded-xl py-6 flex flex-col items-center gap-2 border-dashed transition-all hover:opacity-80"
            style={{ border: "2px dashed var(--border)" }}
          >
            <Upload size={24} style={{ color: "var(--brand)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
              {bgImageUrl ? "تم الرفع ✓ — انقر لتغيير الصورة" : "ارفع صورة خلفية"}
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>JPG / PNG / WebP</span>
          </button>
          {bgImageUrl && (
            <img src={bgImageUrl} alt="preview" className="w-full h-28 object-cover rounded-xl" />
          )}
        </div>
      )}

      {/* Video upload */}
      {bgType === "video" && (
        <div className="flex flex-col gap-3 anim-fade">
          <input ref={vidRef} type="file" accept="video/*" className="hidden"
            onChange={(e) => handleUpload(e.target.files[0], true)} />
          <button
            onClick={() => vidRef.current?.click()}
            className="glass2 rounded-xl py-6 flex flex-col items-center gap-2 border-dashed transition-all hover:opacity-80"
            style={{ border: "2px dashed var(--border)" }}
          >
            <Upload size={24} style={{ color: "var(--brand)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
              {bgVideoUrl ? "تم الرفع ✓ — انقر لتغيير الفيديو" : "ارفع فيديو خلفية (حلقي)"}
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>MP4 / MOV / WebM · حتى 100 ميجابايت</span>
          </button>
        </div>
      )}

      {/* Adjustments (for image/video) */}
      {(bgType === "image" || bgType === "video") && (
        <div className="glass2 rounded-xl p-4 flex flex-col gap-4 anim-fade">
          <SliderRow label="ضبابية الخلفية" value={bgBlur} min={0} max={20} onChange={setBgBlur} unit="" />
          <SliderRow label="سطوع الخلفية" value={Math.round(bgBrightness * 100)} min={30} max={150} onChange={(v) => setBgBrightness(v / 100)} unit="%" />
        </div>
      )}

      {/* Reset choice */}
      <button onClick={() => setBgEnabled(null)} className="text-xs self-center"
        style={{ color: "var(--muted)" }}>
        ← تغيير الاختيار (بدون / مع خلفية)
      </button>
    </div>
  );
}
