import type { MetadataRoute } from "next";
import { characters } from "@/lib/characters";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/play",
    "/grown-ups",
    "/privacy",
    "/membership",
    "/shop",
    "/parents/safety",
    ...characters.map((c) => `/characters/${c.id}`),
  ].map((path) => ({ url: `https://dll-studio.com${path}` }));
}
