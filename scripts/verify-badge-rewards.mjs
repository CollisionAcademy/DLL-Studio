import { chromium, expect } from "@playwright/test";
import { characterBadges } from "../src/lib/membership/badge-catalog.ts";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 950 } });
    let state = {
      round: 1,
      earned: characterBadges.slice(0, 24).map((b) => b.id),
      lifetimePoints: 240,
      balanceCents: 0,
      trophies: [],
    };
    await page.route("**/api/member/rewards", async (route) => {
      if (route.request().method() === "GET")
        return route.fulfill({ json: state });
      const body = route.request().postDataJSON();
      if (body.action === "start")
        return route.fulfill({
          json: {
            id: "challenge",
            badgeId: body.badgeId,
            round: state.round,
            prompt:
              "The DLL crew has 3 balloons and finds 2 more. How many altogether?",
            choices: [4, 5, 6],
          },
        });
      if (body.answer !== 5)
        return route.fulfill({
          json: { correct: false, message: "Count together and try again." },
        });
      state = {
        round: 2,
        earned: [],
        lifetimePoints: 250,
        balanceCents: 1000,
        trophies: [{ round: 1, completed_at: "2026-09-27" }],
      };
      return route.fulfill({
        json: {
          correct: true,
          message:
            "All 25 badges collected! $10 in store credit is saved for your family.",
        },
      });
    });
    await page.goto(
      (process.env.TEST_URL || "http://localhost:3100") + "/member/badges",
    );
    await expect(page.getByText("Collection 1: 24 / 25 badges")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "✓ Collected", exact: true }),
    ).toHaveCount(24);
    await page
      .getByRole("button", { name: "Try the challenge", exact: true })
      .click();
    await page.getByRole("button", { name: "4", exact: true }).click();
    await expect(
      page.getByText("Count together and try again.", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "5", exact: true }).click();
    await expect(page.getByText("Collection 2: 0 / 25 badges")).toBeVisible();
    await expect(
      page.getByText("$10.00 store credit saved", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Try the challenge", exact: true }),
    ).toHaveCount(25);
    await page.reload();
    await expect(page.getByText("Collection 2: 0 / 25 badges")).toBeVisible();
    await page
      .getByText("🏆 Collection 1 · 25 badges · $10 reward earned", {
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Gramps: Story Keeper", { exact: true }),
    ).toBeVisible();
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    )
      throw Error("Horizontal overflow");
    await page.screenshot({
      path: `verification/badge-rewards-${width}.png`,
      fullPage: true,
    });
    await page.close();
    console.log(
      `${width}px: collection completion, reward, reset, reload and Trophy Book passed`,
    );
  }
} finally {
  await browser.close();
}
