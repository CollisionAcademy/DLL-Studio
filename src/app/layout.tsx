import type { Metadata } from "next";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/nunito-sans/400.css";
import "@fontsource/nunito-sans/600.css";
import "@fontsource/nunito-sans/700.css";
import "@fontsource/nunito-sans/800.css";
import "./globals.css";
import "./membership.css";
import { Header, Footer } from "@/components/shell";
import { AuthShell } from "@/components/membership/auth-shell";
import { authConfigured } from "@/lib/membership/access";
export const metadata: Metadata = {
  metadataBase: new URL("https://dll-studio.com"),
  title: {
    default: "DLL Studio — Today’s short is ready to play",
    template: "%s | DLL Studio",
  },
  description:
    "Six friends. Fresh shorts. A free Story Vault you can watch together — no account needed. Meet Luca, Leo, Vienna, Bianna, Doo Wop Dog, and Gramps.",
  openGraph: {
    siteName: "DLL Studio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
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
    </>
  );
  return (
    <html lang="en">
      <body>{enabled ? <AuthShell>{content}</AuthShell> : content}</body>
    </html>
  );
}
