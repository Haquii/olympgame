"use client";

import { useToasts } from "@/lib/store";
import clsx from "clsx";

export default function ToastHost() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            "px-5 py-3.5 rounded-xl shadow-pop text-white text-sm font-medium animate-toastIn",
            t.type === "success" && "bg-oly-green",
            t.type === "error" && "bg-oly-red",
            !t.type && "bg-oly-black"
          )}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
