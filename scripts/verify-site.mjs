import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.TEST_URL || "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(15000);
page.setDefaultNavigationTimeout(30000);
const errors = [];
const results = [];
page.on("pageerror", (error) => errors.push(error.message));
const ids = ["luca", "leo", "vienna", "bianna", "doo-wop-dog", "gramps"];
await fs.mkdir("verification", { recursive: true });
async function visit(path) {
  const response = await page.goto(base + path);
  assert.equal(response.status(), 200, path);
  await page.waitForLoadState("networkidle");
}
await visit("/");
assert.equal(await page.locator(".character-card").count(), 6);
await page.getByRole("button", { name: "Sports", exact: true }).click();
assert.equal(await page.locator(".character-card").count(), 1);
assert.match(await page.locator(".character-card").innerText(), /Luca/);
await page.getByRole("button", { name: "Everyone", exact: true }).click();
await page.screenshot({
  path: "verification/home-desktop-full.png",
  fullPage: true,
});
results.push(
  "Home: all six characters, working category filters, desktop screenshot",
);
for (const id of ids) {
  await visit(`/characters/${id}`);
  assert.equal(await page.locator("h1").count(), 1);
  await page.locator(".character-portrait img").evaluate((img) => {
    if (!img.complete || img.naturalWidth === 0)
      throw Error("Image not loaded");
  });
  await page.getByRole("button", { name: /five-second intro/ }).click();
  await page.locator("video").evaluate(
    (v) =>
      new Promise((resolve, reject) => {
        if (v.readyState >= 1) resolve();
        else {
          v.addEventListener("loadedmetadata", resolve, { once: true });
          v.addEventListener("error", () => reject(Error("video error")), {
            once: true,
          });
        }
      }),
  );
  const media = await page
    .locator("video")
    .evaluate((v) => ({
      duration: v.duration,
      width: v.videoWidth,
      height: v.videoHeight,
    }));
  assert.ok(
    media.duration >= 4.9 && media.duration <= 5.1,
    `${id} duration ${media.duration}`,
  );
  assert.ok(media.width > 0);
  await page.locator("video").evaluate((v) => {
    v.currentTime = 2.5;
    v.pause();
  });
  await page.waitForTimeout(200);
  await page
    .locator(".intro-dialog")
    .screenshot({ path: `verification/intro-${id}.png` });
  await page.getByRole("button", { name: "Close intro" }).click();
  await page.getByRole("button", { name: /Start playing/ }).click();
  results.push(
    `${id}: image, intro video ${media.duration}s, captions and game start`,
  );
}
await visit("/characters/luca#game");
await page.getByRole("button", { name: /Start playing/ }).click();
for (let i = 0; i < 5; i++) {
  await page.getByRole("button", { name: /Shoot left/ }).click();
  await page.waitForTimeout(1150);
}
assert.match(await page.locator(".game-win").innerText(), /goals/);
await page.getByRole("button", { name: "Play again", exact: true }).click();
assert.equal(await page.locator(".goal-field").count(), 1);
results.push("Luca: five shots, score, completion, restart");
await visit("/characters/vienna#game");
await page.getByRole("button", { name: /Start playing/ }).click();
for (const direction of [
  "down",
  "down",
  "right",
  "down",
  "right",
  "right",
  "up",
  "right",
  "up",
  "up",
  "down",
  "down",
  "down",
])
  await page
    .getByRole("button", { name: `Move ${direction}`, exact: true })
    .click();
assert.match(await page.locator(".game-win").innerText(), /3 of 3/);
results.push("Vienna: blocked rock, movement, all stars, camp completion");
await visit("/characters/leo#game");
await page.getByRole("button", { name: /Start playing/ }).click();
await page.getByRole("button", { name: "Choose sock", exact: true }).click();
assert.match(
  await page.locator(".game-status").innerText(),
  /imaginative choice/,
);
for (const part of ["battery", "wheel", "light bulb"])
  await page
    .getByRole("button", { name: `Choose ${part}`, exact: true })
    .click();
assert.match(
  await page.locator(".game-win").innerText(),
  /Invention powered up/,
);
results.push(
  "Leo: incorrect choice recovery, three building stages, completion",
);
await visit("/characters/bianna#game");
await page.getByRole("button", { name: /Start playing/ }).click();
const before = await page.locator(".story-result").innerText();
for (let i = 0; i < 3; i++)
  await page.getByRole("button", { name: /Make it sillier/ }).click();
assert.notEqual(await page.locator(".story-result").innerText(), before);
assert.match(
  await page.locator(".game-status").innerText(),
  /official giggle maker/,
);
results.push("Bianna: three story mixes and milestone");
await visit("/characters/gramps#game");
await page.getByRole("button", { name: /Start playing/ }).click();
await page.getByRole("button", { name: "Laugh and walk away" }).click();
assert.match(await page.locator(".game-status").innerText(), /kinder choice/);
await page
  .getByRole("button", { name: "Show him slowly, one step at a time" })
  .click();
await page.getByRole("button", { name: /Next little lesson/ }).click();
await page.getByRole("button", { name: "Ask Gramps to show him" }).click();
await page.getByRole("button", { name: /Next little lesson/ }).click();
await page.getByRole("button", { name: "Try each other’s games" }).click();
await page.getByRole("button", { name: /Finish/ }).click();
assert.match(await page.locator(".game-win").innerText(), /Kindness Club/);
results.push(
  "Gramps: feedback for wrong answer, three mutual-learning lessons, completion",
);
await visit("/characters/doo-wop-dog#game");
await page.getByRole("button", { name: /Start playing/ }).click();
const known = new Map();
const matched = new Set();
for (let turn = 0; turn < 16 && matched.size < 8; turn++) {
  const groups = {};
  for (const [index, symbol] of known) {
    if (!matched.has(index)) (groups[symbol] ??= []).push(index);
  }
  const pair = Object.values(groups).find((group) => group.length === 2);
  let a, b;
  if (pair) {
    [a, b] = pair;
  } else {
    const fresh = Array.from({ length: 8 }, (_, i) => i).filter(
      (i) => !known.has(i) && !matched.has(i),
    );
    a =
      fresh[0] ??
      Array.from({ length: 8 }, (_, i) => i).find((i) => !matched.has(i));
    await page.locator(".memory-card").nth(a).click();
    const first = await page.locator(".memory-card").nth(a).innerText();
    known.set(a, first);
    b =
      [...known].find(
        ([index, symbol]) =>
          index !== a && !matched.has(index) && symbol === first,
      )?.[0] ??
      fresh.find((i) => i !== a) ??
      Array.from({ length: 8 }, (_, i) => i).find(
        (i) => i !== a && !matched.has(i),
      );
  }
  if (pair) await page.locator(".memory-card").nth(a).click();
  await page.locator(".memory-card").nth(b).click();
  if (await page.locator(".game-win").count()) {
    matched.add(a);
    matched.add(b);
    break;
  }
  known.set(b, await page.locator(".memory-card").nth(b).innerText());
  if (known.get(a) === known.get(b)) {
    matched.add(a);
    matched.add(b);
  } else await page.waitForTimeout(1200);
}
assert.match(await page.locator(".game-win").innerText(), /Case closed/);
results.push("Doo Wop Dog: reveal, mismatch reset, four matches, completion");
await visit("/characters/leo#chat");
const chatResponse = page.waitForResponse(
  (r) => r.url().endsWith("/api/chat") && r.request().method() === "POST",
  { timeout: 30000 },
);
await page.getByRole("button", { name: /Tell me a tiny story/ }).click();
const live = await (await chatResponse).json();
assert.equal(live.source, "ai", "Expected live OpenAI reply, not fallback");
await page
  .getByText("AI character reply", { exact: true })
  .waitFor({ timeout: 30000 });
assert.ok(live.reply.length > 20);
await page.screenshot({
  path: "verification/leo-page-desktop.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Start fresh" }).click();
assert.equal(await page.locator(".chat-message").count(), 1);
results.push(
  "Live chat: UI selection → API → OpenAI → moderation → visible AI reply; clear chat",
);
const invalid = await page.request.post(base + "/api/chat", {
  headers: { Origin: base },
  data: {
    characterId: "leo",
    promptId: "story",
    message: "My name is private",
  },
});
assert.equal(invalid.status(), 400);
const cross = await page.request.post(base + "/api/chat", {
  headers: { Origin: "https://unrelated.example" },
  data: { characterId: "leo", promptId: "story" },
});
assert.equal(cross.status(), 403);
const oversized = await page.request.post(base + "/api/chat", {
  headers: { Origin: base, "Content-Type": "application/json" },
  data: "x".repeat(1000),
});
assert.equal(oversized.status(), 400);
results.push("API: rejects free text, foreign origins, oversized bodies");
for (const route of ["/play", "/grown-ups", "/privacy"]) await visit(route);
const missing = await page.goto(base + "/characters/not-a-character");
assert.equal(missing.status(), 404);
results.push("Playroom, parent/privacy pages and unknown-character 404");
await page.setViewportSize({ width: 390, height: 844 });
await visit("/");
assert.equal(
  await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  ),
  false,
);
await page.screenshot({ path: "verification/home-mobile.png", fullPage: true });
await page.getByRole("button", { name: "Open menu" }).click();
await page.getByRole("link", { name: "The playroom", exact: true }).click();
await page.waitForURL("**/play");
await visit("/characters/gramps");
assert.equal(
  await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  ),
  false,
);
await page.screenshot({
  path: "verification/gramps-mobile.png",
  fullPage: true,
});
results.push(
  "390px mobile: no horizontal overflow, menu navigation, character layout",
);
assert.deepEqual(errors, []);
await fs.writeFile(
  "verification/results.json",
  JSON.stringify({ base, results, errors }, null, 2),
);
console.log(JSON.stringify({ results, errors }, null, 2));
await browser.close();
