import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

export const alt = "DLL Studio — Today’s short is ready to play";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function shareCard() {
  const [fredoka, nunito, luca] = await Promise.all([
    readFile(
      join(
        process.cwd(),
        "node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff",
      ),
    ),
    readFile(
      join(
        process.cwd(),
        "node_modules/@fontsource/nunito-sans/files/nunito-sans-latin-700-normal.woff",
      ),
    ),
    sharp(join(process.cwd(), "public/characters/luca.png"))
      .resize(560, 630, { fit: "cover", position: "top" })
      .png()
      .toBuffer(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fffdf8",
          color: "#182e3e",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 680,
            padding: "64px 56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: "#2949d5",
                color: "#ffdb56",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 46,
                fontFamily: "Fredoka",
              }}
            >
              D
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 16,
                fontSize: 36,
                fontFamily: "Fredoka",
              }}
            >
              DLL Studio
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 68,
              lineHeight: 0.98,
              letterSpacing: -2,
              fontFamily: "Fredoka",
            }}
          >
            Today’s short is ready to play.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 28,
              color: "#56616b",
              fontFamily: "Nunito",
            }}
          >
            Six friends. A free Story Vault. Made for kids.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 520,
            height: 630,
            background: "#d8f3de",
          }}
        >
          {/* satori renders a plain img; next/image is not available here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${luca.toString("base64")}`}
            width={520}
            height={630}
            alt=""
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fredoka", data: fredoka, weight: 700, style: "normal" },
        { name: "Nunito", data: nunito, weight: 700, style: "normal" },
      ],
    },
  );
}
