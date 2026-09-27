import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
let remaining = 1;
let admin = false;
await page.route("**/api/member/parent", (r) =>
  r.fulfill({
    json: {
      plan: "super",
      isAdmin: admin,
      credits: { remaining, video_limit: 1, ends_at: "2026-10-27" },
      badges: [],
      boxes: [],
      videos: [],
      parent: { parent_confirmed_at: "2026-09-27" },
      cancelAtPeriodEnd: false,
    },
  }),
);
await page.route("**/api/member/video", (r) => {
  remaining = 0;
  return r.fulfill({
    json: {
      id: "test",
      message:
        "Submission sent! Your video will appear on your shelf automatically.",
    },
  });
});
try {
  await page.goto("http://localhost:3100/parent");
  await expect(
    page.getByRole("button", { name: "Submit story · 1 credit" }),
  ).toBeEnabled();
  await page
    .getByLabel("A gentle adventure idea")
    .fill("Leo builds a wobbly tower and learns to use a wider base.");
  await page.getByRole("button", { name: "Submit story · 1 credit" }).click();
  await expect(page.locator(".story-submission")).toHaveClass(/is-exhausted/);
  await expect(page.getByLabel("A gentle adventure idea")).toBeDisabled();
  await expect(page.locator("main")).toContainText("Submission sent!");
  await expect(page.locator("main")).toContainText(
    "allowance for this billing month is used",
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `verification/video-limit-${width}.png`,
      fullPage: true,
    });
  }
  await page.reload();
  await expect(page.getByLabel("A gentle adventure idea")).toBeDisabled();
  admin = true;
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Submit story · administrator" }),
  ).toBeEnabled();
  console.log(
    "PASS: submission confirmation, immediate and persistent monthly limit, disabled/faded form, administrator exemption. Mock APIs only.",
  );
} finally {
  await browser.close();
}
