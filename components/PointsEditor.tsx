"use client";

import { useState } from "react";
import type { PointEntry } from "@/lib/types";

export default function PointsEditor({ initial, onChange }: { initial: PointEntry[]; onChange?: (next: PointEntry[]) => void }) {
  const [rows, setRows] = useState<PointEntry[]>(initial);

  const update = (next: PointEntry[]) => {
    setRows(next);
    onChange?.(next);
  };

  const addRow = () => update([...rows, { rank: rows.length + 1, points: 0 }]);

  const removeRow = (i: number) => {
    const next = rows.filter((_, idx) => idx !== i).map((r, idx) => ({ rank: idx + 1, points: r.points }));
    update(next);
  };

  const setPoints = (i: number, v: string) => {
    const n = parseInt(v) || 0;
    update(rows.map((r, idx) => (idx === i ? { ...r, points: n } : r)));
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((p, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="w-12 font-bold text-ink-soft text-sm">#{p.rank}</div>
          <input type="number" min={0} value={p.points} onChange={(e) => setPoints(i, e.target.value)} className="field-input flex-1" />
          <span className="text-sm text-ink-soft">pts</span>
          <button type="button" onClick={() => removeRow(i)} className="btn btn-ghost btn-sm" aria-label="Supprimer cette place">×</button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="btn btn-ghost btn-sm self-start mt-1">+ Ajouter une place</button>
    </div>
  );
}
