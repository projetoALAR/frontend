import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1E3A8A",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "white",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          A
          <div
            style={{
              marginTop: 8,
              width: 72,
              height: 6,
              background: "rgba(255,255,255,0.85)",
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
