import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const base = process.env.TEST_URL || "http://localhost:3100";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
try {
  await page.goto(base + "/login");
  await page.locator('input[name="identifier"]').waitFor({ timeout: 30000 });
  assert.equal(await page.locator('header a[href="/signup"]').count(), 0);
  console.log("Login form loaded; header has one account entry.");
  await page.goto(base + "/signup");
  await page.waitForURL("**/login");
  console.log("Legacy signup redirects to unified login.");
  await page.goto(base + "/parent");
  await page.locator("main [role=alert]").waitFor();
  assert.match(await page.locator("main [role=alert]").innerText(), /Sign in/);
  assert.equal(
    await page.getByRole("button", { name: "Unlock parent controls" }).count(),
    0,
  );
  console.log("Anonymous parent access still requires login.");
  // Mock only dashboard data to exercise the client regression without accessing a real account.
  await page.route("**/api/member/parent", (r) =>
    r.fulfill({
      json: {
        plan: "crew",
        isAdmin: false,
        credits: { remaining: 0, video_limit: 0 },
        badges: [],
        boxes: [],
        videos: [],
        parent: {
          parent_confirmed_at: "2026-09-27",
          timezone: "America/New_York",
        },
        cancelAtPeriodEnd: false,
      },
    }),
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + "/parent");
    await page.getByRole("heading", { name: "Your video shelf." }).waitFor();
    assert.equal(await page.locator("main [role=alert]").count(), 0);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: `verification/account-fixed-${width}.png`,
      fullPage: true,
    });
  }
  console.log(
    "Parent dashboard auto-loads at desktop/mobile widths without json error (mock data).",
  );
} finally {
  await browser.close();
}
