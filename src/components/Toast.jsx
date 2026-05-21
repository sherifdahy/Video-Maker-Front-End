/** نظام الإشعارات (Toast) — بديل لـ alert() */
import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 size={18} className="text-green-400 shrink-0" />,
  error:   <XCircle     size={18} className="text-red-400   shrink-0" />,
  info:    <Info        size={18} className="shrink-0" style={{ color: "var(--brand)" }} />,
};

const BORDERS = {
  success: "rgba(34,197,94,0.3)",
  error:   "rgba(239,68,68,0.3)",
  info:    "var(--brand-glow)",
};

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, msg, ttl = 3500) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), ttl);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div
        className="fixed bottom-6 left-1/2 flex flex-col gap-2 z-50"
        style={{ transform: "translateX(-50%)", minWidth: "280px", maxWidth: "90vw" }}
        dir="rtl"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg"
              style={{ border: `1px solid ${BORDERS[t.type]}` }}
            >
              {ICONS[t.type]}
              <span className="flex-1 text-sm font-medium" style={{ color: "var(--text)" }}>
                {t.msg}
              </span>
              <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                <X size={14} style={{ color: "var(--muted)" }} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const add = useContext(ToastContext);
  if (!add) throw new Error("useToast must be used inside ToastProvider");
  return {
    success: (msg, ttl) => add("success", msg, ttl),
    error:   (msg, ttl) => add("error",   msg, ttl),
    info:    (msg, ttl) => add("info",    msg, ttl),
  };
}
