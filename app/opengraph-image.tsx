import { ImageResponse } from "next/og";

export const alt = "Mad Dogos Hotdogs — Hot dogs a domicilio en Culiacán";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #CC1717 0%, #8B0F0F 55%, #1A0A00 100%)",
          color: "#FFFFFF",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#F5C800",
            }}
          />
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Mad Dogos
          </span>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1,
            textTransform: "uppercase",
            maxWidth: 900,
          }}
        >
          Hot dogs a domicilio en Culiacán
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#F5C800",
            fontWeight: 600,
          }}
        >
          Hamburguesas · Alitas · Boneless · WhatsApp
        </div>
      </div>
    ),
    { ...size },
  );
}
