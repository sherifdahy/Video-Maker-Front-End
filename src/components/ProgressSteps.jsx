/** شريط تقدم التصدير — يستعلم عن حالة الجوب كل 2 ثانية */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const PHASE_ORDER = ["queued", "downloading", "preparing-bg", "merging-layers", "adding-subs", "exporting", "done"];

const STEP_MAP = [
  { phases: ["queued", "downloading"],           label: "جاري التنزيل من يوتيوب..." },
  { phases: ["preparing-bg"],                    label: "جاري تجهيز الخلفية..."     },
  { phases: ["merging-layers"],                  label: "جاري دمج الطبقات..."        },
  { phases: ["adding-subs"],                     label: "جاري إضافة الترجمة..."      },
  { phases: ["exporting", "done"],               label: "التصدير النهائي..."          },
];

function phaseToStepIndex(phase) {
  for (let i = 0; i < STEP_MAP.length; i++) {
    if (STEP_MAP[i].phases.includes(phase)) return i;
  }
  return -1;
}

export default function ProgressSteps({ jobId, onDone, onError, pollIntervalMs = 2000, subtitleStyle }) {
  const [status, setStatus] = useState({ status: "queued", progress: 0, message: "في الانتظار..." });
  const intervalRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!jobId) return;
    doneRef.current = false;

    const poll = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/clip-status/${jobId}`);
        setStatus(data);
        if (data.status === "done") {
          doneRef.current = true;
          clearInterval(intervalRef.current);
          onDone?.(data);
        } else if (data.status === "error") {
          doneRef.current = true;
          clearInterval(intervalRef.current);
          onError?.(data.message);
        }
      } catch {
        // 404 after GC — treat as done if we already got done once
        if (doneRef.current) clearInterval(intervalRef.current);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, pollIntervalMs);
    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  const activeStepIdx = phaseToStepIndex(status.status);
  const isError = status.status === "error";

  const steps = STEP_MAP.filter((s) =>
    subtitleStyle === "none" ? !s.phases.includes("adding-subs") : true
  );

  return (
    <div className="flex flex-col gap-3 anim-fade" dir="rtl">
      <div className="flex items-center justify-between text-xs mb-1">
        <span style={{ color: "var(--muted)" }}>{status.message}</span>
        <span className="font-black" style={{ color: isError ? "var(--danger)" : "var(--brand)" }}>
          {status.progress >= 0 ? `${status.progress}%` : "خطأ"}
        </span>
      </div>

      {/* Mini progress bar */}
      <div className="w-full rounded-full h-1.5 overflow-hidden mb-1" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.max(0, status.progress)}%`,
            background: isError
              ? "var(--danger)"
              : `linear-gradient(90deg, var(--brand-d), var(--brand))`,
          }}
        />
      </div>

      {/* Step list */}
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => {
          const originalIdx = STEP_MAP.indexOf(step);
          const isDone     = activeStepIdx > originalIdx || status.status === "done";
          const isActive   = activeStepIdx === originalIdx && !isDone;
          const isPending  = activeStepIdx < originalIdx && status.status !== "done";

          return (
            <div
              key={i}
              className="flex items-center gap-3 text-sm transition-all"
              style={{ color: isDone ? "var(--success)" : isActive ? "var(--text)" : "var(--muted)" }}
            >
              {isDone && <CheckCircle2 size={16} className="text-green-400 shrink-0" />}
              {isActive && <Loader2 size={16} className="anim-spin shrink-0" style={{ color: "var(--brand)" }} />}
              {isPending && <Circle size={16} className="shrink-0 opacity-40" />}
              <span className={isActive ? "font-bold" : ""}>{step.label}</span>
              {isDone && <span className="text-xs mr-auto" style={{ color: "var(--success)" }}>✅ تم</span>}
              {isActive && <span className="text-xs mr-auto" style={{ color: "var(--brand)" }}>⏳ جارٍ</span>}
              {isPending && <span className="text-xs mr-auto opacity-40">○ انتظار</span>}
            </div>
          );
        })}
      </div>

      {isError && (
        <p className="text-xs text-red-400 mt-1">{status.message}</p>
      )}
    </div>
  );
}
