"use client";

import { X } from "lucide-react";
import { type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  titleColorClass = "text-rocam-yellow",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  titleColorClass?: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-rocam-card border border-rocam-border rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-oswald text-base font-bold ${titleColorClass}`}>{title}</h3>
          <button
            onClick={onClose}
            className="text-rocam-muted hover:text-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
