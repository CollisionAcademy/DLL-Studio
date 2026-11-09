export const vaultCategories = [
  "All adventures",
  "Mysteries",
  "Sports",
  "Spooky fun",
] as const;
export type VaultCategory = (typeof vaultCategories)[number];
export type YouTubeVideo = {
  id: string;
  title: string;
  category: Exclude<VaultCategory, "All adventures">;
};

// Explicit DLL Studio catalog. Verify ownership and thumbnails with
// scripts/verify-vault-sources.mjs before adding videos. No live upload feed.
export const youtubeVideos: YouTubeVideo[] = [
  { id: "ZVPQu1L-Nug", title: "Championship Heart", category: "Sports" },
  {
    id: "bAY5G8xrOT8",
    title: "A Little Mystery, a Lot of Fun!",
    category: "Spooky fun",
  },
  { id: "Ed8iX_fDBDA", title: "The Halloween Ghost", category: "Spooky fun" },
  {
    id: "YP0ex4JjTD4",
    title: "The Halloween Ghost: Sneak Peek",
    category: "Spooky fun",
  },
  {
    id: "2KDh63guWD4",
    title: "The Complete Cookie Heist!",
    category: "Mysteries",
  },
  {
    id: "nXJgJFxyQ9Y",
    title: "Cookie Heist 3: The Final Clue!",
    category: "Mysteries",
  },
  { id: "LsU10Hqli8E", title: "The Cookie Heist 2!", category: "Mysteries" },
  {
    id: "jksEOv3y9zw",
    title: "The Great Cookie Mystery!",
    category: "Mysteries",
  },
  {
    id: "tD6BF_c9I6E",
    title: "The Great Cookie Mystery! (Short)",
    category: "Mysteries",
  },
  {
    id: "M7eBI4HHOjo",
    title: "Mystery 3: The Missing Map!",
    category: "Mysteries",
  },
  {
    id: "2RjEiXycR0A",
    title: "Mystery 2: The Squirrel’s Secret!",
    category: "Mysteries",
  },
  {
    id: "n3867VtYb14",
    title: "Mystery 1: The Cookie Clue!",
    category: "Mysteries",
  },
  {
    id: "zbzR_6i0Yos",
    title: "Doowop Detective & the Missing Treat!",
    category: "Mysteries",
  },
  { id: "w88rpd8fAG8", title: "Nobody Expected That Play", category: "Sports" },
  {
    id: "vlI0XqdVEBE",
    title: "The DLL Crew Plays Football",
    category: "Sports",
  },
  {
    id: "4G-HGoF9bSs",
    title: "Detective Doggy’s First Mystery!",
    category: "Mysteries",
  },
];

const supportedLanguages = new Set([
  "en",
  "es",
  "fr",
  "pt",
  "de",
  "hi",
  "zh-CN",
  "ja",
  "ar",
  "ru",
  "uk",
]);
export function vaultEmbedUrl(id: string, language = "en") {
  if (!youtubeVideos.some((video) => video.id === id))
    throw new Error("Unknown vault video");
  const lang = supportedLanguages.has(language) ? language : "en";
  const params = new URLSearchParams({
    autoplay: "0",
    playsinline: "1",
    rel: "0",
    controls: "1",
    hl: lang,
    cc_lang_pref: lang,
  });
  if (lang !== "en") params.set("cc_load_policy", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
