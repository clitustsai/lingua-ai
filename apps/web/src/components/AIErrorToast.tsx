"use client";
import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, X, Wifi } from "lucide-react";

interface Props {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function AIErrorToast({ error, onRetry, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(t);
    }
  }, [error]);

  if (!error || !visible) return null;

  const isNetwork = error.includes("kết nối") || error.includes("mạng");

  return (
    <div className="fixed top-16 right-4 z-[150] max-w-sm animate-fade-in-up"
      style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}>
      <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", backdropFilter: "blur(12px)" }}>
        {isNetwork
          ? <Wifi className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          : <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
        <div className="flex-1">
          <p className="text-red-300 text-sm font-medium">{error}</p>
          {onRetry && (
            <button onClick={() => { onRetry(); setVisible(false); }}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-1 transition-colors">
              <RefreshCw className="w-3 h-3" /> Thử lại
            </button>
          )}
        </div>
        <button onClick={() => { setVisible(false); onDismiss?.(); }}
          className="text-red-500 hover:text-red-300 transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
