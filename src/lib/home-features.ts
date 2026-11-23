import type { CharacterId } from "./characters";
import { youtubeVideos, type YouTubeVideo } from "./youtube-videos";

export type HomeShort = {
  video: YouTubeVideo;
  characterId: CharacterId;
  pill: string;
  caption: string;
};

function short(
  id: string,
  characterId: CharacterId,
  pill: string,
  caption: string,
): HomeShort {
  const video = youtubeVideos.find((item) => item.id === id);
  if (!video) throw new Error(`Missing Story Vault video ${id}`);
  return { video, characterId, pill, caption };
}

export const homeShorts: HomeShort[] = [
  short("ZVPQu1L-Nug", "luca", "Sports", "Luca · everybody gets a turn"),
  short(
    "bAY5G8xrOT8",
    "doo-wop-dog",
    "Mystery",
    "Doo Wop Dog · follow the clues",
  ),
  short(
    "2KDh63guWD4",
    "bianna",
    "Silliness",
    "Bianna & friends · a wobbly plan",
  ),
];

export const featuredShort = homeShorts[0];

export const vaultPicks: HomeShort[] = [
  short(
    "jksEOv3y9zw",
    "doo-wop-dog",
    "Mysteries",
    "Clues, crumbs, and a case that ends happily.",
  ),
  short(
    "vlI0XqdVEBE",
    "luca",
    "Sports",
    "Fast feet, big heart, everybody gets a turn.",
  ),
  short(
    "M7eBI4HHOjo",
    "vienna",
    "Mysteries",
    "Vienna packs curiosity. The trail stays tidy.",
  ),
];
