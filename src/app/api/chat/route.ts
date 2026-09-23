import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getCharacter, chatPrompts } from "@/lib/characters";
import { validateChatInput, isSuitableReply } from "@/lib/chat-policy.mjs";
import { storybookReply } from "@/lib/storybook";
export const runtime = "nodejs";
export const maxDuration = 30;
const cache = new Map<string, { reply: string; expires: number }>();
const active = new Map<string, Promise<string | null>>();
const requests = new Map<string, { count: number; until: number }>();
function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
function limit(key: string, max: number) {
  const now = Date.now();
  if (requests.size > 5000) {
    for (const [k, v] of requests) if (v.until < now) requests.delete(k);
    if (requests.size > 5000) return false;
  }
  const current = requests.get(key);
  if (!current || current.until < now) {
    requests.set(key, { count: 1, until: now + 60_000 });
    return true;
  }
  current.count++;
  return current.count <= max;
}
async function readBody(request: NextRequest) {
  const stream = request.body?.getReader();
  if (!stream) throw Error("body");
  let length = 0;
  let value = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value: chunk } = await stream.read();
      if (done) break;
      length += chunk.length;
      if (length > 512) {
        await stream.cancel();
        throw Error("body");
      }
      value += decoder.decode(chunk, { stream: true });
    }
    value += decoder.decode();
    return JSON.parse(value);
  } finally {
    stream.releaseLock();
  }
}
async function generate(
  characterId: string,
  promptId: string,
): Promise<string | null> {
  const character = getCharacter(characterId)!;
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(14000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
        store: false,
        max_output_tokens: 220,
        instructions: `You write short, wholesome fictional dialogue for DLL Studio, a children's cartoon world for ages 5-9. You are the fictional ${character.animal} character ${character.name}. Personality: ${character.bio}. Be warm, playful and simple. Reply in first person, 2-4 short sentences, at most 75 words, plain text. This is a preset topic selected by a child, not free text. Never ask for personal information, names, locations, school, contact details, photos or secrets. Never claim you are real, human, a therapist, or a replacement for friends, family or trusted adults. Never encourage dependency, secrecy, dangerous activity, leaving home, purchases or use of tools/electricity/chemicals. No links, contact info, frightening/violent/sexual content, insults, medical advice or copyrighted characters. Challenges must be safe seated imagination or observation, never physical exertion. If telling a joke use gentle wordplay. Stories should feature these fictional animal friends and simple kindness. Gramps can be mildly grumbly but is never mean or ageist. Do not ask a follow-up question or invite typing.`,
        input: chatPrompts.find((p) => p.id === promptId)!.label,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const reply = (data.output ?? [])
      .flatMap(
        (o: { content?: { type: string; text?: string }[] }) => o.content ?? [],
      )
      .filter((c: { type: string }) => c.type === "output_text")
      .map((c: { text: string }) => c.text)
      .join("")
      .trim();
    if (!isSuitableReply(reply)) return null;
    const moderation = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({ model: "omni-moderation-latest", input: reply }),
    });
    if (!moderation.ok) return null;
    const safety = await moderation.json();
    if (
      !safety.results?.length ||
      safety.results.some((r: { flagged: boolean }) => r.flagged)
    )
      return null;
    return reply;
  } catch {
    return null;
  }
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowed = new Set([
    request.nextUrl.origin,
    "https://dll-studio.com",
    "https://www.dll-studio.com",
  ]);
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }
  if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    allowed.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  if (!origin || !allowed.has(origin))
    return json({ error: "Please chat from the DLL Studio website." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "Please choose a question." }, 415);
  let body;
  try {
    body = await readBody(request);
  } catch {
    return json({ error: "Please choose one of the question buttons." }, 400);
  }
  if (!validateChatInput(body))
    return json({ error: "Please choose one of the question buttons." }, 400);
  const character = getCharacter(body.characterId)!;
  const fallback = () =>
    json({
      reply: storybookReply(character, body.promptId),
      source: "storybook",
    });
  const address =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    "local";
  const hash = createHash("sha256").update(address).digest("hex");
  if (!limit(`visitor:${hash}`, 12) || !limit("global", 90)) return fallback();
  const cacheKey = `${body.characterId}:${body.promptId}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now())
    return json({ reply: cached.reply, source: "ai" });
  let pending = active.get(cacheKey);
  if (!pending) {
    pending = generate(body.characterId, body.promptId);
    active.set(cacheKey, pending);
  }
  let reply;
  try {
    reply = await pending;
  } finally {
    active.delete(cacheKey);
  }
  if (!reply) return fallback();
  cache.set(cacheKey, { reply, expires: Date.now() + 86_400_000 });
  return json({ reply, source: "ai" });
}
