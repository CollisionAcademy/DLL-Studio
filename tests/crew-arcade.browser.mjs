import { chromium, expect } from "@playwright/test";
const url = process.env.GAMEPLAY_TEST_URL;
if (!url)
  throw Error(
    "Set GAMEPLAY_TEST_URL to an authenticated play page or a local component fixture.",
  );
const browser = await chromium.launch({ headless: true, channel: "msedge" });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page
    .getByRole("button", { name: "Start rocket mission", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Challenge · remember the code", exact: true })
    .click();
  const code = () =>
    page
      .locator(".rocket-code li")
      .evaluateAll((items) =>
        items.map((i) => i.getAttribute("aria-label").split(": ")[1]),
      );
  for (let round = 1; round <= 5; round++) {
    const answer = await code();
    expect(answer.length).toBe(round + 1);
    await page
      .getByRole("button", { name: "Hide code — my turn!", exact: true })
      .click();
    expect(await code()).toEqual(Array(round + 1).fill("hidden"));
    if (round === 1) {
      const wrong = ["Star", "Moon", "Rocket", "Planet"].find(
        (s) => s !== answer[0],
      );
      await page.getByRole("button", { name: wrong, exact: true }).click();
      await expect(page.getByRole("status").first()).toContainText("Nearly!");
      await page
        .getByRole("button", { name: "Peek at the code", exact: true })
        .click();
      expect(await code()).toEqual(answer);
      await page
        .getByRole("button", { name: "Hide code — my turn!", exact: true })
        .click();
    }
    for (const symbol of answer)
      await page.getByRole("button", { name: symbol, exact: true }).click();
    await expect(page.getByRole("status").first()).toContainText(
      round === 5 ? "Lift-off!" : "Code cracked!",
    );
    if (round < 5)
      await page.getByRole("button", { name: new RegExp("Next code") }).click();
  }
  await page
    .getByRole("button", { name: "Start a new mission", exact: true })
    .click();
  expect((await code()).length).toBe(2);
  await page.getByRole("button", { name: /Picture detectives Find/ }).click();
  await page
    .getByRole("button", { name: "Super · 6 pairs", exact: true })
    .click();
  const cards = page.locator(".memory-board button");
  await expect(cards).toHaveCount(12);
  const seen = new Map();
  for (let i = 0; i < 12; i += 2) {
    for (const index of [i, i + 1]) {
      await cards.nth(index).click();
      const picture = await cards.nth(index).textContent();
      seen.set(picture, [...(seen.get(picture) || []), index]);
    }
    const back = page.getByRole("button", {
      name: "Turn these back",
      exact: true,
    });
    if (await back.count()) {
      await expect(cards.nth((i + 2) % 12)).toBeDisabled();
      await back.click();
    }
  }
  for (const positions of seen.values()) {
    if (!(await cards.nth(positions[0]).isDisabled()))
      for (const index of positions) await cards.nth(index).click();
  }
  await expect(page.getByRole("status").first()).toContainText(
    "Case cracked! 6 pairs",
  );
  await expect(
    page.getByRole("progressbar", { name: "Pairs found" }),
  ).toHaveAttribute("value", "6");
  await page
    .getByRole("button", { name: "Shuffle a new board", exact: true })
    .click();
  await expect(page.getByRole("status").first()).toContainText(
    "0 / 6 pairs · 0 turns",
  );
  await page.getByRole("button", { name: /Three in a row Outthink/ }).click();
  await page
    .getByRole("button", { name: "Row 1, column 1: empty", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Row 2, column 2: O", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "New game", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Row \d, column \d: empty/ }),
  ).toHaveCount(9);
  let request;
  await page.route("**/api/chat", (route) => {
    request = route.request().postDataJSON();
    return route.fulfill({
      status: 200,
      json: {
        reply: "Check for two Xs in a line before you move.",
        source: "ai",
      },
    });
  });
  await page
    .getByRole("button", { name: "Give me a game tip", exact: true })
    .click();
  await expect(
    page.getByText("AI character tip", { exact: true }),
  ).toBeVisible();
  expect(request).toEqual({ characterId: "luca", promptId: "game-tic" });
  await page.unroute("**/api/chat");
  await page.route("**/api/chat", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page
    .getByRole("button", { name: "Give me a game tip", exact: true })
    .click();
  await expect(page.getByText("Storybook tip", { exact: true })).toBeVisible();
  await page.locator(".crew-pal-picker summary").click();
  await page.getByRole("button", { name: "Leo", exact: true }).click();
  await page.locator(".crew-pal-picker summary").click();
  await expect(
    page.getByRole("heading", { name: "Your X. Leo’s O.", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Rocket code Remember/ }).click();
  await page.screenshot({
    path: "output/gameplay/desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Start rocket mission", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Enter the code", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "output/gameplay/mobile.png", fullPage: true });
  expect(errors).toEqual([]);
  console.log(
    "PASS: five rocket levels, wrong answers, peek, restart, 6-pair completion, reset, tactical opponent, coach success/fallback, character switching, keyboard and mobile layout; no browser errors.",
  );
} finally {
  await browser.close();
}
