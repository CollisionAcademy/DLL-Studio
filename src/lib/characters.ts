export type CharacterId =
  "luca" | "leo" | "vienna" | "bianna" | "doo-wop-dog" | "gramps";
export type Character = {
  id: CharacterId;
  name: string;
  animal: string;
  role: string;
  theme: string;
  color: string;
  pale: string;
  emoji: string;
  motto: string;
  short: string;
  bio: string;
  facts: string[];
  game: string;
  gameDescription: string;
  greeting: string;
  intro: string;
};
export const characters: Character[] = [
  {
    id: "luca",
    name: "Luca",
    animal: "Cheetah",
    role: "The team player",
    theme: "Sports",
    color: "#087b64",
    pale: "#d8f3de",
    emoji: "⚽",
    motto: "Every day is game day.",
    short: "Fast feet. Big heart. Everybody gets a turn.",
    bio: "Luca loves a good game almost as much as he loves his team. This speedy cheetah is learning that the best wins happen when everyone gets to play. Lace up—there’s always room for one more!",
    facts: [
      "Cheers for both teams",
      "Always wears number 10",
      "Practicing his victory dance",
    ],
    game: "Goal Getter",
    gameDescription: "Pick your spot and shoot past the keeper!",
    greeting:
      "Hey, teammate! I’m Luca. Ready for a little fun? Pick something to ask me!",
    intro: "I’m Luca! Grab a ball. Let’s play together!",
  },
  {
    id: "leo",
    name: "Leo",
    animal: "Spinosaurus",
    role: "The super builder",
    theme: "Superheroes",
    color: "#2661dd",
    pale: "#dceaff",
    emoji: "⚡",
    motto: "Big ideas. Super possibilities.",
    short: "A mighty dinosaur with an even mightier imagination.",
    bio: "Meet Leo: inventor, problem-solver, and Spinosaurus superhero! He builds his own gadgets and armor. When a plan wobbles, he tries again—because his greatest power is a good idea.",
    facts: [
      "Builds his own superhero gear",
      "Has a spectacular blue sail",
      "Believes mistakes are discoveries",
    ],
    game: "Super Builder",
    gameDescription: "Match the blueprint to power Leo’s invention.",
    greeting:
      "Super-builder Leo reporting for fun! What should we imagine together?",
    intro: "I’m Leo! Let’s build something super!",
  },
  {
    id: "vienna",
    name: "Vienna",
    animal: "Red panda",
    role: "The trail explorer",
    theme: "Adventure",
    color: "#8552c7",
    pale: "#eee2ff",
    emoji: "🧭",
    motto: "There’s wonder around every corner.",
    short: "One curious panda. A whole world to discover.",
    bio: "Vienna packs her map, her compass, and a pocketful of curiosity. From winding woodland paths to hidden waterfalls, she explores with care and always makes time to notice the little things.",
    facts: [
      "Never leaves her map behind",
      "Finds shapes in the clouds",
      "Leaves every trail tidy",
    ],
    game: "Trail Quest",
    gameDescription: "Follow the trail, gather stars, find your camp.",
    greeting:
      "Hello, explorer! I’m Vienna. Shall we discover something wonderful?",
    intro: "I’m Vienna! There’s an adventure around every corner!",
  },
  {
    id: "bianna",
    name: "Bianna",
    animal: "Duck",
    role: "The giggle maker",
    theme: "Silliness",
    color: "#c5507c",
    pale: "#ffe2ec",
    emoji: "🎉",
    motto: "A little silly goes a long way.",
    short: "Big laughs. Wobbly plans. Absolutely quackers.",
    bio: "Bianna can turn making breakfast into a spectacularly silly adventure. Her ideas don’t always go to plan, but this cheerful duck knows how to laugh, help clean up, and give it another go.",
    facts: [
      "Thinks a saucepan is a perfect hat",
      "Expert at accidental dance moves",
      "Has a very contagious giggle",
    ],
    game: "Silly Story Machine",
    gameDescription: "Mix up a wonderfully wacky little story.",
    greeting:
      "Quack-a-doodle-hello! I’m Bianna. My hat is a saucepan. Obviously. What shall we do?",
    intro: "I’m Bianna! Let’s get a little bit silly!",
  },
  {
    id: "doo-wop-dog",
    name: "Doo Wop Dog",
    animal: "Beagle",
    role: "The curious detective",
    theme: "Mysteries",
    color: "#ad6721",
    pale: "#ffedce",
    emoji: "🔎",
    motto: "Little clues. Big discoveries.",
    short: "A nose for clues and a knack for helping.",
    bio: "A missing picnic basket? A mysterious trail of paw prints? Doo Wop Dog is on the case! He listens carefully, checks the clues, and never jumps to conclusions. Every mystery is a chance to help a neighbor.",
    facts: [
      "Notices the tiniest clues",
      "Always listens before guessing",
      "Loves a mystery with a happy ending",
    ],
    game: "Clue Crew",
    gameDescription: "Remember the clues and find all four pairs.",
    greeting:
      "Hello, detective! I’m Doo Wop Dog. What shall we investigate today?",
    intro: "I’m Doo Wop Dog! Let’s sniff out a mystery!",
  },
  {
    id: "gramps",
    name: "Gramps",
    animal: "Falcon",
    role: "The wise old bird",
    theme: "Life lessons",
    color: "#a95331",
    pale: "#f5e5d5",
    emoji: "🌱",
    motto: "Never too old for a new idea.",
    short: "A gruff little grumble. A great big heart.",
    bio: "Gramps has a story for everything—and a strong opinion about most things! Beneath his grumbles is a caring falcon who shares what he knows and learns a thing or two from his younger friends.",
    facts: [
      "Proud of his blue Italia cap",
      "Gives great advice (and sometimes needs it)",
      "Always shows up for his friends",
    ],
    game: "Kindness Club",
    gameDescription: "Help young and old friends learn from each other.",
    greeting:
      "Well, hello there! Pull up a chair. This old bird has a story or two. What’s on your mind?",
    intro: "They call me Gramps. You can teach an old bird new tricks!",
  },
];
export function getCharacter(id: string) {
  return characters.find((c) => c.id === id);
}
export const chatPrompts = [
  { id: "hello", label: "Tell me about you", emoji: "👋" },
  { id: "story", label: "Tell me a tiny story", emoji: "📖" },
  { id: "joke", label: "Make me giggle", emoji: "😄" },
  { id: "challenge", label: "Give me a fun challenge", emoji: "✨" },
  { id: "teamwork", label: "How can I be a good friend?", emoji: "💛" },
  { id: "try-again", label: "What if I make a mistake?", emoji: "🌈" },
] as const;
