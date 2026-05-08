import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = ++_id;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-sm transition-all animate-in",
              t.type === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
              t.type === "error"   && "border-red-500/30 bg-red-500/10 text-red-300",
              t.type === "info"    && "border-blue-500/30 bg-blue-500/10 text-blue-300",
              t.type === "warning" && "border-orange-500/30 bg-orange-500/10 text-orange-300",
            ].filter(Boolean).join(" ")}
          >
            <span className="mt-0.5 text-base leading-none">
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "ℹ"}
            </span>
            <span className="flex-1 text-sm font-semibold">{t.message}</span>
            <button onClick={() => remove(t.id)} className="shrink-0 text-xs opacity-50 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
