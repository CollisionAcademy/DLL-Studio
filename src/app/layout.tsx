import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/nunito-sans/400.css";
import "@fontsource/nunito-sans/600.css";
import "@fontsource/nunito-sans/800.css";
import "./globals.css";
import "./membership.css";
import { Header, Footer } from "@/components/shell";
import { AuthShell } from "@/components/membership/auth-shell";
import { authConfigured } from "@/lib/membership/access";
export const metadata: Metadata = {
  metadataBase: new URL("https://dll-studio.com"),
  title: {
    default: "DLL Studio — A little world of big adventures",
    template: "%s | DLL Studio",
  },
  description:
    "Meet Luca, Leo, Vienna, Bianna, Doo Wop Dog, and Gramps. Play mini-games, watch their introductions, and explore a world of imagination.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const enabled = authConfigured();
  const socialLinks = ([
    { platform: "YouTube", url: process.env.DLL_YOUTUBE_URL || "https://www.youtube.com/@DLL-Studio" },
    { platform: "Instagram", url: process.env.DLL_INSTAGRAM_URL || "https://www.instagram.com/dll.studi0/" },
    { platform: "TikTok", url: process.env.DLL_TIKTOK_URL || "https://www.tiktok.com/@dll_studios" },
  ] as const).flatMap(({ platform, url }) => {
    if (!url) return [];
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return [];
      return [{ platform, url: parsed.href }];
    } catch {
      return [];
    }
  });
  const content = (
    <>
      <a className="skip-link" href="#main">
        Skip to the fun
      </a>
      <Header authenticationEnabled={enabled} />
      {children}
      <Footer socialLinks={socialLinks} />
      <Analytics />
      <SpeedInsights />
    </>
  );
  return (
    <html lang="en">
      <body>{enabled ? <AuthShell>{content}</AuthShell> : content}</body>
    </html>
  );
}
