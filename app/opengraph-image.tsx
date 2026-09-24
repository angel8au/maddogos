import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Mad Dogos — Dogos, burgers y alitas. Pide fácil por WhatsApp.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const [logoData, burgerData, fontData] = await Promise.all([
    readFile(join(process.cwd(), "public/images/logo-maddogos.png")),
    readFile(join(process.cwd(), "public/images/hero-burger.jpg")),
    readFile(join(process.cwd(), "public/fonts/Capriola-Regular.ttf")),
  ]);

  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;
  const burgerSrc = `data:image/jpeg;base64,${burgerData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#FAF6E6",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Burger photo — right side */}
        <img
          src={burgerSrc}
          alt=""
          width={620}
          height={630}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 620,
            height: 630,
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        {/* Soft fade from muted into the photo */}
        <div
          style={{
            position: "absolute",
            left: 480,
            top: 0,
            width: 200,
            height: 630,
            background:
              "linear-gradient(90deg, #FAF6E6 0%, rgba(250,246,230,0) 100%)",
          }}
        />

        {/* Logo — top-left corner */}
        <img
          src={logoSrc}
          alt=""
          width={148}
          height={148}
          style={{
            position: "absolute",
            top: 40,
            left: 48,
            width: 148,
            height: 148,
            borderRadius: 9999,
            boxShadow: "0 8px 24px rgba(40, 14, 7, 0.18)",
          }}
        />

        {/* Copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            paddingLeft: 56,
            paddingRight: 40,
            paddingBottom: 56,
            width: 620,
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Capriola",
              color: "#280E07",
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            <span>Dogos, burgers</span>
            <span>y alitas</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontFamily: "Capriola",
              color: "#F3AF04",
              fontSize: 44,
              lineHeight: 1.1,
            }}
          >
            — pide fácil
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 10,
              fontFamily: "Capriola",
              color: "#280E07",
              fontSize: 28,
              opacity: 0.85,
            }}
          >
            Por WhatsApp
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Capriola",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
