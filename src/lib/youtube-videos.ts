import { XMLParser } from "fast-xml-parser";

export type YouTubeVideo = { id: string; title: string };
const channelId = "UCzpsv9_xB1Ke28QIsFSDYKA";
const existingVideos: YouTubeVideo[] = [
  { id: "ZVPQu1L-Nug", title: "Championship Heart | Football Cartoon for Kids" },
  { id: "bAY5G8xrOT8", title: "A little mystery, a lot of fun!" },
  { id: "Ed8iX_fDBDA", title: "The Halloween Ghost | A Funny DLL Studio Halloween Adventure" },
  { id: "YP0ex4JjTD4", title: "Sneak Peek: The Halloween Ghost!" },
  { id: "2KDh63guWD4", title: "The Complete Cookie Heist! | DLL Studio Kids Mystery Cartoon" },
  { id: "nXJgJFxyQ9Y", title: "Cookie Heist 3: The Final Clue!" },
  { id: "LsU10Hqli8E", title: "The Cookie Heist 2!" },
  { id: "jksEOv3y9zw", title: "The Great Cookie Mystery! | DLL Studio Kids Cartoon Adventure" },
  { id: "tD6BF_c9I6E", title: "The Great Cookie Mystery! | DLL Studio Kids Cartoon Adventure" },
  { id: "M7eBI4HHOjo", title: "DLL Studio Mystery 3 | The Missing Map!" },
  { id: "2RjEiXycR0A", title: "DLL Studio Mystery 2 | The Squirrel's Secret!" },
  { id: "n3867VtYb14", title: "DLL Studio Mystery 1 | The Cookie Clue!" },
  { id: "zbzR_6i0Yos", title: "Doowop Detective & The Missing Treat!" },
  { id: "w88rpd8fAG8", title: "Nobody Expected THAT Play" },
  { id: "vlI0XqdVEBE", title: "POV: The DLL Crew Plays Football" },
  { id: "4G-HGoF9bSs", title: "Detective Doggy's First Mystery!" },
];

export async function youtubeVideos(): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return existingVideos;
    const data = new XMLParser().parse(await response.text());
    const rawEntries = data?.feed?.entry;
    const entries = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : [];
    const recent: YouTubeVideo[] = entries.flatMap((entry) => {
      const id = entry["yt:videoId"];
      return typeof id === "string" && /^[\w-]{11}$/.test(id) && typeof entry.title === "string"
        ? [{ id, title: entry.title }]
        : [];
    });
    // YouTube's feed contains only recent uploads; retain the verified back catalog.
    const ids = new Set(recent.map((video) => video.id));
    return [...recent, ...existingVideos.filter((video) => !ids.has(video.id))];
  } catch {
    return existingVideos;
  }
}
