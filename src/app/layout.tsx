import type { Metadata } from "next";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/nunito-sans/400.css";
import "@fontsource/nunito-sans/600.css";
import "@fontsource/nunito-sans/800.css";
import "./globals.css";
import { Header, Footer } from "@/components/shell";
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
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to the fun
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
