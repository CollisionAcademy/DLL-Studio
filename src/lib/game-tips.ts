export const gameTips = {
  "game-sequence": {
    prompt:
      "Give one playful strategy for Rocket code: remember 2 to 6 space symbols in order, then tap them. Suggest grouping symbols or saying their names. Practice keeps the code visible and Peek shows it again. You cannot see the code; never invent a specific answer. Do not invent game controls or rewards.",
    fallback:
      "Say the picture names in your head: star, moon, rocket! Try remembering two at a time. Use Peek whenever you need another look.",
  },
  "game-memory": {
    prompt:
      "Give one playful strategy for Picture detectives: flip two cards to match 3, 4, or 6 pairs. Mismatches stay visible until Turn these back is pressed. Suggest remembering pictures by position. You cannot see the board; never invent card positions or answers. Do not invent game controls or rewards.",
    fallback:
      "Remember a picture and its place, like ‘star in the top corner.’ When its twin appears, you’ll know where to look!",
  },
  "game-tic": {
    prompt:
      "Give one simple strategy for tic-tac-toe: the child is X, the character is O, three in a row wins. Suggest looking for two Xs to finish a line, then two Os to block. You cannot see the board; never name a specific square as the correct move. Do not invent game controls or rewards.",
    fallback:
      "Look for two Xs with an empty space in the same line. No winning move yet? Look for two Os and block their line!",
  },
} as const;
export function getGameTip(id: string) {
  return Object.hasOwn(gameTips, id)
    ? gameTips[id as keyof typeof gameTips]
    : undefined;
}
