import type { TournamentStatus } from "@/lib/types";

const MAP: Record<TournamentStatus, { label: string; className: string }> = {
  open: { label: "● Inscriptions ouvertes", className: "bg-green-100 text-green-700" },
  in_progress: { label: "● En cours", className: "bg-blue-100 text-blue-700" },
  completed: { label: "● Terminé", className: "bg-slate-200 text-slate-600" },
};

export default function StatusBadge({ status }: { status: TournamentStatus }) {
  const m = MAP[status];
  return <span className={`badge ${m.className}`}>{m.label}</span>;
}
