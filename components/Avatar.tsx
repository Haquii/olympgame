import clsx from "clsx";
import type { User } from "@/lib/types";

type Size = "sm" | "md" | "lg";

export default function Avatar({
  user,
  size = "md",
  className,
}: {
  user: User | null | undefined;
  size?: Size;
  className?: string;
}) {
  if (!user) return null;
  const sizes = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-9 h-9 text-sm",
    lg: "w-16 h-16 text-[22px]",
  };
  return (
    <div
      className={clsx(
        "rounded-full grid place-items-center font-bold text-white border-2 border-white shadow-soft shrink-0",
        sizes[size],
        className
      )}
      style={{ backgroundColor: user.color || "#0085C7" }}
      aria-label={user.name}
    >
      {(user.avatar || user.name.charAt(0)).toUpperCase()}
    </div>
  );
}
