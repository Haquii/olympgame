import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Olymp'Game — Tournois entre amis";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OG({ params }: { params: { id: string } }) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%", width: "100%", display: "flex", flexDirection: "column",
          background: "linear-gradient(135deg,#0A1F2E 0%,#0085C7 60%,#F4C300 130%)",
          color: "white", padding: 80, fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, opacity: 0.85 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#0085C7 0%,#0A1F2E 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800 }}>O</div>
          <span>OLYMP<span style={{ color: "#F4C300" }}>&apos;</span>GAME</span>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 60 }}>
          <div style={{ fontSize: 240, lineHeight: 1 }}>🏆</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 24, opacity: 0.85, textTransform: "uppercase", letterSpacing: 4 }}>🏅 Tournoi en cours</div>
            <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.95, maxWidth: 700 }}>Rejoins la compétition</div>
            <div style={{ fontSize: 32, opacity: 0.9, maxWidth: 700, marginTop: 8 }}>Des potes, des jeux, un podium.</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, opacity: 0.85 }}>
          <span>🎮 Multi-jeux · 🥇 Médailles · 100% gratuit</span>
          <span>olympgame.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
