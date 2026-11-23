export type StudioSocial = {
  platform: "YouTube" | "Instagram" | "TikTok";
  url: string;
};

export function studioSocialLinks(): StudioSocial[] {
  return (
    [
      {
        platform: "YouTube",
        url: process.env.DLL_YOUTUBE_URL || "https://www.youtube.com/@DLL-Studio",
      },
      {
        platform: "Instagram",
        url:
          process.env.DLL_INSTAGRAM_URL ||
          "https://www.instagram.com/dll.studi0/",
      },
      {
        platform: "TikTok",
        url: process.env.DLL_TIKTOK_URL || "https://www.tiktok.com/@dll_studios",
      },
    ] as const
  ).flatMap(({ platform, url }) => {
    if (!url) return [];
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return [];
      return [{ platform, url: parsed.href }];
    } catch {
      return [];
    }
  });
}
