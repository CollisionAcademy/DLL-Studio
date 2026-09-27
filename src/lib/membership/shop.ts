export const products = [
  {
    id: "crew-stickers",
    name: "Little Crew sticker pack",
    cents: 799,
    description: "A little character joy for notebooks and family projects.",
    icon: "✳",
  },
  {
    id: "adventure-notebook",
    name: "My Adventure notebook",
    cents: 1499,
    description: "A place for big ideas, tiny doodles, and wobbly inventions.",
    icon: "▤",
  },
  {
    id: "crew-tote",
    name: "Bring the Crew tote",
    cents: 2499,
    description: "A cheerful carry-along for your next family adventure.",
    icon: "♡",
  },
] as const;
export function discountedCents(cents: number, percent: number) {
  return Math.round((cents * (100 - percent)) / 100);
}
