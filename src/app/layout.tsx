import type { Metadata } from "next";
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
  const content = (
    <>
      <a className="skip-link" href="#main">
        Skip to the fun
      </a>
      <Header authenticationEnabled={enabled} />
      {children}
      <Footer />
      <SpeedInsights />
    </>
  );
  return (
    <html lang="en">
      <body>{enabled ? <AuthShell>{content}</AuthShell> : content}</body>
    </html>
  );
}
