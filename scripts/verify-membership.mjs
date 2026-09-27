import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.TEST_URL || "http://localhost:3100";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
try {
  await fs.mkdir("verification", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const response = await page.goto(base + "/membership");
    assert.equal(response.status(), 200);
    await page
      .getByRole("heading", { name: "There’s more to DLL than watching." })
      .waitFor();
    assert.equal(await page.locator(".plan-card").count(), 4);
    assert.match(await page.locator(".plan-super").innerText(), /MOST POPULAR/);
    for (const [key, price] of [
      ["crew", "Free"],
      ["adventure", "$4.99"],
      ["super", "$12.99"],
      ["family", "$29.99"],
    ])
      assert.ok(
        (await page.locator(".plan-" + key).innerText()).includes(price),
      );
    assert.equal(await page.locator("main input,main textarea").count(), 0);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: `verification/membership-${width}-full.png`,
      fullPage: true,
    });
    await page
      .getByText("Can we keep watching for free?", { exact: true })
      .click();
    assert.equal(await page.locator("details[open]").count(), 1);
    results.push(
      `${width}px: four prices, featured plan, no child typing, no overflow, FAQ works`,
    );
  }
  for (const path of [
    "/shop",
    "/parents/safety",
    "/parent",
    "/member",
    "/member/play",
    "/login",
  ]) {
    const response = await page.goto(base + path);
    assert.equal(response.status(), 200, path);
    assert.equal(await page.locator("h1").count(), 1, path);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      path,
    );
  }
  for (const path of [
    "/api/member/dashboard",
    "/api/member/parent",
    "/api/member/content",
    "/api/member/media/activity-sheet",
    "/api/admin/videos",
  ]) {
    const response = await page.request.get(base + path);
    assert.ok(
      [401, 403, 503].includes(response.status()),
      `${path}: ${response.status()}`,
    );
  }
  const foreign = await page.request.post(base + "/api/member/video", {
    headers: { Origin: "https://unrelated.example" },
    data: { script: "x" },
  });
  assert.equal(foreign.status(), 403);
  const local = await page.request.post(base + "/api/member/video", {
    headers: { Origin: base },
    data: { script: "x" },
  });
  assert.ok(
    [401, 503].includes(local.status()),
    `same-origin auth guard: ${local.status()}`,
  );
  const worker = await page.request.post(base + "/api/jobs/videos");
  assert.equal(worker.status(), 401);
  results.push(
    "Shop/safety/account states render; unauthenticated content/media/admin denied; foreign-origin mutations and unauthorized worker denied",
  );
  const robots = await (await page.request.get(base + "/robots.txt")).text();
  assert.ok(!robots.includes("Disallow: /membership"));
  assert.deepEqual(errors, []);
  await fs.writeFile(
    "verification/membership-results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
}
