import { ImageResponse } from "next/og";


export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 320,
          background:
            "linear-gradient(135deg,#0A1F2E 0%,#0085C7 60%,#F4C300 130%)",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          letterSpacing: -12,
        }}
      >
        O
      </div>
    ),
    { width: 512, height: 512 }
  );
}
