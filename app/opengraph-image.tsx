import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Olymp'Game — Tournois multi-jeux vidéo entre amis";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg,#0A1F2E 0%,#0085C7 60%,#F4C300 130%)",
          color: "white",
          padding: 80,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 32,
            opacity: 0.9,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg,#0085C7 0%,#0A1F2E 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            O
          </div>
          <span>
            OLYMP<span style={{ color: "#F4C300" }}>&apos;</span>GAME
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              fontSize: 28,
              opacity: 0.85,
              textTransform: "uppercase",
              letterSpacing: 5,
              marginBottom: 24,
            }}
          >
            🏅 Saison ouverte
          </div>
          <div
            style={{
              fontSize: 130,
              fontWeight: 800,
              lineHeight: 0.95,
              marginBottom: 24,
            }}
          >
            Les jeux,<br />la rivalité,<br />
            <span style={{ color: "#F4C300" }}>la gloire.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            opacity: 0.85,
          }}
        >
          <span>Tournois multi-jeux vidéo · entre amis · 100% gratuit</span>
          <span>olympgame.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
