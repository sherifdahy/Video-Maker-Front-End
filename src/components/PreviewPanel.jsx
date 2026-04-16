/**
 * PreviewPanel — معاينة مباشرة بصيغة 9:16
 * يُحاكي شكل الريل النهائي بـ CSS بدون معالجة فيديو
 */

// خرائط ألوان الخلفيات المسبقة
const PRESET_GRADIENTS = {
  "islamic-dark":  "linear-gradient(180deg,#0a1628 0%,#1a3a2a 100%)",
  "deep-ocean":    "linear-gradient(180deg,#000814 0%,#003566 100%)",
  "emerald":       "linear-gradient(180deg,#0d2b1a 0%,#1a4a2e 100%)",
  "desert-dusk":   "linear-gradient(180deg,#2d1b0e 0%,#5a3010 100%)",
  "midnight":      "linear-gradient(180deg,#0d0221 0%,#190d3a 100%)",
  "dark-slate":    "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)",
  "warm-black":    "linear-gradient(180deg,#0c0a09 0%,#1c1917 100%)",
  "islamic-green": "linear-gradient(180deg,#052e16 0%,#14532d 100%)",
};

export default function PreviewPanel({
  videoInfo,
  bgType, bgColor, bgPreset, bgImageUrl, bgBlur, bgBrightness,
  videoScale, videoPosition, videoGlow,
  subtitleStyle, overlayText, overlayPos,
  speakerName, speakerTitle,
  watermarkText,
}) {
  // ── Calculate background CSS ──────────────────────
  let bgStyle = {};
  if (bgType === "color") {
    bgStyle.background = bgColor || "#0a1628";
  } else if (bgType === "preset") {
    bgStyle.background = PRESET_GRADIENTS[bgPreset] || PRESET_GRADIENTS["islamic-dark"];
  } else if (bgType === "image" && bgImageUrl) {
    bgStyle.backgroundImage = `url(${bgImageUrl})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
    if (bgBlur > 0)         bgStyle.filter  = `blur(${bgBlur * 0.6}px) brightness(${bgBrightness})`;
    else if (bgBrightness !== 1) bgStyle.filter = `brightness(${bgBrightness})`;
  } else if (bgType === "video") {
    bgStyle.background = "linear-gradient(180deg,#1a1a2e 0%,#16213e 100%)";
  } else {
    bgStyle.background = "#0a0a0a";
  }

  // ── Video thumbnail style ─────────────────────────
  const scale = (videoScale || 85) / 100;
  const thumbW = `${Math.round(scale * 100)}%`;
  let   thumbY = "50%";
  let   thumbTY = "-50%";

  if (videoPosition === "top")    { thumbY = "8%";  thumbTY = "0"; }
  if (videoPosition === "bottom") { thumbY = "auto"; thumbTY = "0"; }

  // ── Show position helper ──────────────────────────
  const isBottom = videoPosition === "bottom";

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>معاينة مباشرة</p>

      <div className="phone-frame">
        {/* Background layer */}
        <div className="absolute inset-0" style={bgType !== "image" ? bgStyle : {}} />

        {/* Image background (separate to allow blur without affecting content) */}
        {bgType === "image" && bgImageUrl && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(${(bgBlur || 0) * 0.5}px) brightness(${bgBrightness || 1})`,
              transform: "scale(1.05)",
            }}
          />
        )}
        {bgType === "video" && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(180deg,#1a1a2e,#16213e)" }}>
            <div className="text-2xl opacity-30">🎥</div>
          </div>
        )}

        {/* Glow ring around video */}
        {videoGlow && videoInfo && (
          <div
            className="absolute rounded-xl"
            style={{
              width: thumbW, left: "50%", top: thumbY,
              transform: `translateX(-50%) translateY(${thumbTY})`,
              aspectRatio: "16/9",
              background: "rgba(56,189,248,.25)",
              filter: "blur(12px)",
            }}
          />
        )}

        {/* Main video thumbnail */}
        {videoInfo ? (
          <div
            className="absolute rounded-xl overflow-hidden"
            style={{
              width: thumbW,
              left: "50%",
              top: isBottom ? "auto" : thumbY,
              bottom: isBottom ? "22%" : "auto",
              transform: isBottom
                ? "translateX(-50%)"
                : `translateX(-50%) translateY(${thumbTY})`,
              aspectRatio: "16/9",
              boxShadow: videoGlow ? "0 0 20px rgba(56,189,248,.5)" : "0 4px 20px rgba(0,0,0,.5)",
            }}
          >
            <img
              src={videoInfo.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="absolute rounded-xl flex items-center justify-center"
            style={{
              width: thumbW, left: "50%", top: thumbY,
              transform: `translateX(-50%) translateY(${thumbTY})`,
              aspectRatio: "16/9",
              background: "rgba(255,255,255,.08)",
              border: "1px dashed rgba(255,255,255,.2)",
            }}
          >
            <span className="text-xs text-white opacity-40">فيديو</span>
          </div>
        )}

        {/* Subtitle bar */}
        {subtitleStyle === "center-box" && (
          <div className="absolute left-0 right-0 flex justify-center"
            style={{ top: "55%", transform: "translateY(-50%)", padding: "0 8px" }}>
            <div
              className="text-white text-center rounded-lg px-2 py-1"
              style={{ fontSize: "7px", lineHeight: 1.5, background: "rgba(0,0,0,.7)", maxWidth: "85%" }}
            >
              ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
            </div>
          </div>
        )}
        {subtitleStyle === "bottom-captions" && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center px-2">
            <div
              className="text-white text-center"
              style={{ fontSize: "6px", lineHeight: 1.6, background: "rgba(0,0,0,.6)", padding: "3px 6px", borderRadius: "4px" }}
            >
              نص الترجمة سيظهر هنا
            </div>
          </div>
        )}

        {/* Overlay text */}
        {overlayText && (
          <div
            className="absolute left-0 right-0 flex justify-center px-2"
            style={{ top: overlayPos === "top" ? "8px" : "auto", bottom: overlayPos === "bottom" ? "8px" : "auto" }}
          >
            <div
              className="text-white text-center"
              style={{ fontSize: "7px", lineHeight: 1.6, background: "rgba(0,0,0,.6)", padding: "4px 8px", borderRadius: "4px", maxWidth: "90%" }}
            >
              {overlayText}
            </div>
          </div>
        )}

        {/* Speaker card */}
        {speakerName && (
          <div
            className="absolute left-0 right-0 bottom-4 flex justify-center px-3"
          >
            <div
              className="w-full rounded-lg px-2 py-1.5 text-center"
              style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}
            >
              <div className="text-white font-bold" style={{ fontSize: "7px" }}>{speakerName}</div>
              {speakerTitle && <div style={{ fontSize: "6px", color: "#94a3b8" }}>{speakerTitle}</div>}
            </div>
          </div>
        )}

        {/* Watermark */}
        {watermarkText && (
          <div
            className="absolute top-2 right-2 text-white"
            style={{ fontSize: "5.5px", opacity: .75, textShadow: "0 1px 3px rgba(0,0,0,.9)" }}
          >
            {watermarkText}
          </div>
        )}

        {/* Phone notch simulation */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,.15)" }} />
      </div>

      <p className="text-xs" style={{ color: "var(--muted)" }}>1080 × 1920 px · 9:16</p>
    </div>
  );
}
