/** Step 2 — توقيت المقطع والجودة */
import { useEffect } from "react";
import { Clock } from "lucide-react";

const QUALITY_OPTIONS = ["144", "360", "480", "720", "1080"];
const DURATION_PRESETS = [
  { label: "بدون", value: null },
  { label: "30 ث", value: 30 },
  { label: "60 ث", value: 60 },
  { label: "90 ث", value: 90 },
  { label: "3 د", value: 180 },
];

const secToTime = (s) => {
  s = Math.max(0, Math.floor(s || 0));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((v) => String(v).padStart(2, "0")).join(":");
};
const timeToSec = (t = "") => {
  const p = t.split(":").map(Number);
  if (p.some(isNaN)) return 0;
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2]
       : p.length === 2 ? p[0] * 60 + p[1] : p[0];
};

function TimeInput({ label, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{label}</label>
      <input
        type="text"
        placeholder="00:00:00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={8}
        className="glass rounded-xl px-3 py-3 text-center text-base font-bold tracking-widest w-full"
        style={{ color: "var(--text)", borderColor: error ? "var(--danger)" : "var(--border)" }}
        dir="ltr"
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export default function Step2Time({
  videoInfo, startTime, setStartTime, endTime, setEndTime,
  quality, setQuality, durationPreset, setDurationPreset, timeErrors, setTimeErrors,
}) {
  useEffect(() => {
    if (durationPreset) {
      const s = timeToSec(startTime);
      setEndTime(secToTime(s + durationPreset));
    }
  }, [durationPreset, startTime]);

  const clipSec = Math.max(0, timeToSec(endTime) - timeToSec(startTime));

  return (
    <div className="flex flex-col gap-5">
      {/* Duration presets */}
      <div>
        <label className="text-xs font-semibold block mb-2" style={{ color: "var(--muted)" }}>
          مدة الريل المسبقة
        </label>
        <div className="flex gap-2 flex-wrap">
          {DURATION_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setDurationPreset(p.value)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={durationPreset === p.value
                ? { background: "var(--brand)", color: "#fff" }
                : { background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time inputs */}
      <div className="grid grid-cols-2 gap-3">
        <TimeInput
          label="وقت البداية"
          value={startTime}
          onChange={(v) => { setStartTime(v); setTimeErrors((e) => ({ ...e, start: null })); }}
          error={timeErrors.start}
        />
        <TimeInput
          label="وقت النهاية"
          value={endTime}
          onChange={(v) => { setEndTime(v); setTimeErrors((e) => ({ ...e, end: null })); }}
          error={timeErrors.end}
        />
      </div>

      {/* Info bar */}
      <div className="glass2 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          مدة المقطع:
          <span className="font-bold ms-1" style={{ color: "var(--brand)" }}>{secToTime(clipSec)}</span>
        </span>
        {videoInfo && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            الفيديو الكامل:
            <span className="font-bold ms-1" dir="ltr">{videoInfo.durationStr}</span>
          </span>
        )}
      </div>

      {/* Quality */}
      <div>
        <label className="text-xs font-semibold block mb-2" style={{ color: "var(--muted)" }}>
          جودة الفيديو
        </label>
        <div className="grid grid-cols-5 gap-2">
          {QUALITY_OPTIONS.map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className="py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={quality === q
                ? { background: "var(--brand)", color: "#fff" }
                : { background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }
              }
            >
              {q}p
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
        <Clock size={13} />
        720p هي الجودة الموصى بها للريلز — مناسبة للحجم والوضوح
      </div>
    </div>
  );
}
