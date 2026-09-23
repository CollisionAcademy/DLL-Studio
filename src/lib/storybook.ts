import type { Character } from "./characters";
const jokes: Record<string, string> = {
  luca: "Why did the soccer ball bring a suitcase? It was going on a kick-cation! I’ll see myself off the field.",
  leo: "What do you call a dinosaur with a toolbox? A fix-it-saurus! Okay, back to the blueprint.",
  vienna:
    "Why did the map go to school? It wanted to find its way through geography!",
  bianna:
    "What do you call a duck wearing a saucepan? Me! What do you call two ducks wearing saucepans? A very noisy kitchen!",
  "doo-wop-dog":
    "Why did the detective bring a pencil to the park? To draw a conclusion! But first, we check the clues.",
  gramps:
    "I told my old chair a joke. It cracked up! Hmph. That was a perfectly good chair, too.",
};
const stories: Record<string, string> = {
  luca: "Our team was one player short. I spotted a shy turtle watching and invited her in. She made the best pass of the day! Speed is fun, but a team needs every kind of player.",
  leo: "My new rover rolled backward! Instead of giving up, I turned the blueprint around and checked one part at a time. Soon it worked. Even a superhero gets better by trying again.",
  vienna:
    "A winding path led me to a very small puddle. I almost walked past—until I saw the whole sky reflected in it! Sometimes the tiniest discoveries are the most wonderful.",
  bianna:
    "I put on my best hat and went to breakfast. “Where’s the saucepan?” asked Gramps. I looked up. Oh! Breakfast was on my head. We laughed, washed the pan, and made pancakes.",
  "doo-wop-dog":
    "The picnic blanket had disappeared! I followed a trail of tiny leaves to the washing line. Vienna had washed it after a spill. Mystery solved—and a clean picnic for everyone.",
  gramps:
    "I said my old paper map was all we needed. Vienna showed me her compass, and together we found a lovely new path. Well, well. Turns out an old bird can learn a new trick.",
};
const challenges: Record<string, string> = {
  luca: "Try a pretend victory pose right where you are. Now invent a cheer for someone else! A kind word is a great way to help a team.",
  leo: "Imagine an invention made from three shapes: a circle, a square, and a triangle. What could it do? You can draw it on paper with a grown-up nearby.",
  vienna:
    "Look around from where you’re sitting. Can you spot three different colors? Explorers notice little details. No need to go anywhere!",
  bianna:
    "Make your silliest duck face. Now try to say “wobbly waffle” three times without giggling. Quack! I couldn’t do it either.",
  "doo-wop-dog":
    "Pick an object you can see. Notice its color, shape, and one tiny detail. You just practiced a detective’s most important skill: looking carefully!",
  gramps:
    "Think of one kind thing you could say to a younger or older person. A simple “Thank you for helping” goes a long way. Even I like hearing it.",
};
export function storybookReply(c: Character, prompt: string): string {
  switch (prompt) {
    case "hello":
      return `I’m ${c.name}, ${c.role.toLowerCase()}! ${c.short} ${c.motto}`;
    case "joke":
      return jokes[c.id];
    case "story":
      return stories[c.id];
    case "challenge":
      return challenges[c.id];
    case "teamwork":
      return `A good friend listens, takes turns, and makes room for others. ${c.id === "gramps" ? "Even when their idea is different from mine! I’m practicing that part." : "You don’t have to like all the same things to have fun together."}`;
    case "try-again":
      return `Everyone makes mistakes—even ${c.name}! Take a little breath, think about what you learned, and try one small step again. If you need help, ask a trusted grown-up.`;
    default:
      return c.greeting;
  }
}
