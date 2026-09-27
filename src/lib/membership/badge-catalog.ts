const themes = [
  {
    character: "luca",
    name: "Luca",
    object: "footballs",
    badges: ["Team Player", "Goal Getter", "Fair Play", "Team Captain"],
  },
  {
    character: "leo",
    name: "Leo",
    object: "building blocks",
    badges: ["Little Builder", "Tower Maker", "Bridge Builder", "Inventor"],
  },
  {
    character: "vienna",
    name: "Vienna",
    object: "trail markers",
    badges: ["Trail Finder", "Map Reader", "Explorer", "Adventure Guide"],
  },
  {
    character: "bianna",
    name: "Bianna",
    object: "ribbons",
    badges: [
      "Creative Spark",
      "Color Collector",
      "Pattern Maker",
      "Imagination Star",
    ],
  },
  {
    character: "doo-wop-dog",
    name: "Doo Wop Dog",
    object: "musical notes",
    badges: ["Beat Keeper", "Melody Maker", "Rhythm Friend", "Music Star"],
  },
  {
    character: "gramps",
    name: "Gramps",
    object: "story books",
    badges: ["Story Listener", "Wise Friend", "Tale Teller", "Story Keeper"],
  },
];
export const characterBadges = [
  ...themes.flatMap((theme) =>
    theme.badges.map((title, index) => ({
      id: `${theme.character}-${index + 1}`,
      title,
      character: theme.character,
      name: theme.name,
      object: theme.object,
    })),
  ),
  {
    id: "crew-together",
    title: "Together Champion",
    character: "luca",
    name: "The DLL crew",
    object: "party balloons",
  },
];
export const COLLECTION_SIZE = 25;
export type BadgeRewards = {
  round: number;
  earned: string[];
  lifetimePoints: number;
  balanceCents: number;
  trophies: { round: number; completed_at: string }[];
};
