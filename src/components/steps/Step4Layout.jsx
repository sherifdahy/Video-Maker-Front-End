/** Step 4 — تحكم في التخطيط والموضع */
import { LayoutGrid, Zap, ZoomIn } from "lucide-react";

const LAYOUT_PRESETS = [
  {
    id: "center-card",
    label: "بطاقة وسطى",
    desc: "ريلز TikTok الكلاسيكي",
    videoScale: 85,
    videoPosition: "center",
    videoGlow: false,
  },
  {
    id: "top-speaker",
    label: "متحدث أعلى",
    desc: "فيديو بالأعلى + ترجمة",
    videoScale: 75,
    videoPosition: "top",
    videoGlow: false,
  },
  {
    id: "bottom-focus",
    label: "تركيز أسفل",
    desc: "اقتباسات وآيات",
    videoScale: 70,
    videoPosition: "bottom",
    videoGlow: true,
  },
  {
    id: "glow-center",
    label: "توهج وسط",
    desc: "تأثير احترافي",
    videoScale: 80,
    videoPosition: "center",
    videoGlow: true,
  },
];

function SliderRow({ label, value, min, max, step = 1, onChange, unit = "" }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs" style={{ color: "var(--muted)" }}>
        <span>{label}</span>
        <span className="font-bold" style={{ color: "var(--brand)" }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className={`toggle-track ${value ? "on" : ""}`} onClick={() => onChange(!value)}>
        <div className="toggle-thumb" />
      </div>
      <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</span>
    </label>
  );
}

export default function Step4Layout({
  videoScale, setVideoScale,
  videoPosition, setVideoPosition,
  videoGlow, setVideoGlow,
  layoutPreset, setLayoutPreset,
}) {
  const applyPreset = (p) => {
    setLayoutPreset(p.id);
    setVideoScale(p.videoScale);
    setVideoPosition(p.videoPosition);
    setVideoGlow(p.videoGlow);
  };

  const POSITIONS = [
    { id: "top",    label: "أعلى"  },
    { id: "center", label: "وسط"   },
    { id: "bottom", label: "أسفل"  },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Layout presets */}
      <div>
        <label className="text-xs font-semibold block mb-2" style={{ color: "var(--muted)" }}>
          قوالب تخطيط جاهزة
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUT_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="rounded-xl p-3 text-right transition-all active:scale-95"
              style={layoutPreset === p.id
                ? { background: "var(--brand)", color: "#fff", border: "1px solid var(--brand)" }
                : { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }
              }
            >
              <div className="font-bold text-sm">{p.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual controls */}
      <div className="glass2 rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <ZoomIn size={15} style={{ color: "var(--brand)" }} />
          <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>ضبط يدوي</span>
        </div>

        {/* Scale */}
        <SliderRow
          label="حجم الفيديو داخل الريل"
          value={videoScale}
          min={40} max={100} step={5}
          onChange={setVideoScale}
          unit="%"
        />

        {/* Position */}
        <div>
          <label className="text-xs font-semibold block mb-2" style={{ color: "var(--muted)" }}>
            موضع الفيديو الرأسي
          </label>
          <div className="grid grid-cols-3 gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos.id}
                onClick={() => { setVideoPosition(pos.id); setLayoutPreset(null); }}
                className="py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={videoPosition === pos.id
                  ? { background: "var(--brand)", color: "#fff" }
                  : { background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }
                }
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* Glow */}
        <Toggle
          label="تأثير توهج حول الفيديو"
          value={videoGlow}
          onChange={(v) => { setVideoGlow(v); setLayoutPreset(null); }}
        />
      </div>

      {/* Hint */}
      <div className="flex items-start gap-2 text-xs" style={{ color: "var(--muted)" }}>
        <LayoutGrid size={13} className="mt-0.5 shrink-0" />
        <span>جميع الريلز تُصدَّر بصيغة عمودية 9:16 (1080×1920 بكسل) مناسبة لإنستغرام وتيك توك ويوتيوب شورتس</span>
      </div>
    </div>
  );
}
