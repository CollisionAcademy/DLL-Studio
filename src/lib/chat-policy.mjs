export const characterIds = new Set([
  "luca",
  "leo",
  "vienna",
  "bianna",
  "doo-wop-dog",
  "gramps",
]);
export const promptIds = new Set([
  "hello",
  "story",
  "joke",
  "challenge",
  "teamwork",
  "try-again",
]);
/** No arbitrary text or conversation history is accepted from a child's browser. */
export function validateChatInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (Object.keys(value).sort().join(",") !== "characterId,promptId")
    return false;
  return characterIds.has(value.characterId) && promptIds.has(value.promptId);
}
/** Extra output filter; moderation must also pass before generated text is used. */
export function isSuitableReply(text) {
  return (
    typeof text === "string" &&
    text.length >= 8 &&
    text.length <= 1200 &&
    !/(https?:\/\/|www\.|\b(password|phone number|email address|home address|your address|your school|your full name|keep (it|this) secret|don't tell (your )?(parents|mom|dad)|only friend|credit card)\b)/i.test(
      text,
    )
  );
}
