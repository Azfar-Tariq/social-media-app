"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl text-xs"
        >
          <div className="flex items-center space-x-2.5">
            {t.type === "success" && (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            {t.type === "error" && (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            {t.type === "info" && (
              <Info className="h-4 w-4 text-blue-400 shrink-0" />
            )}
            <span className="font-medium text-slate-200">{t.message}</span>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
