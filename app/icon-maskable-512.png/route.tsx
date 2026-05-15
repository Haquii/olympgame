import { ImageResponse } from "next/og";


export async function GET() {
  // Maskable : zone "safe" centrale, padding extérieur pour les masques système
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A1F2E",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            background:
              "linear-gradient(135deg,#0085C7 0%,#0A1F2E 100%)",
            borderRadius: 80,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 220,
            fontWeight: 800,
            letterSpacing: -8,
          }}
        >
          O
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
