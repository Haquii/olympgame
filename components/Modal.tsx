"use client";

import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-oly-black/50 backdrop-blur-sm grid place-items-center animate-fadeIn p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl2 p-7 max-w-[520px] w-full max-h-[85vh] overflow-auto shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="font-display text-[28px] leading-tight mb-4">{title}</h3>
        )}
        <div>{children}</div>
        {footer && <div className="flex gap-2.5 justify-end mt-6">{footer}</div>}
      </div>
    </div>
  );
}
