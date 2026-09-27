import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, rm } from "node:fs/promises";
// A temporary development-only harness renders the real component. API payloads
// are inspected without submitting child data or bypassing production membership.
const fixture = new URL("../src/app/activity-verification/", import.meta.url);
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  await mkdir(fixture, { recursive: true });
  await writeFile(new URL("page.tsx", fixture), 'import { notFound } from "next/navigation"; import { ActivityRoom } from "@/components/membership/activity-room"; export default function Page(){ if(process.env.NODE_ENV!=="development") notFound(); return <main className="page-wrap member-page"><h1>The imagination room.</h1><ActivityRoom /></main>; }');
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const payloads=[];
    await page.route("**/api/chat", route => {
      const data=route.request().postDataJSON();payloads.push(data);
      return route.fulfill({json:{reply:`A cheerful ${data.characterId} story about sharing crayons.`,source:"ai"}});
    });
    await page.goto("http://localhost:3100/activity-verification");
    await expect(page.getByRole("heading",{name:"Chat with Leo",exact:true})).toBeVisible();
    await page.getByRole("button",{name:"Make me giggle",exact:false}).click();
    await expect(page.getByText("A cheerful leo story about sharing crayons.")).toBeVisible();
    if(JSON.stringify(Object.keys(payloads[0]).sort())!==JSON.stringify(["characterId","promptId"]))throw Error("Unexpected chat payload");
    await expect(page.locator('input,textarea,[contenteditable="true"]')).toHaveCount(0);
    await page.getByRole("button",{name:"Color 4: Berry pink",exact:true}).click();
    await page.getByRole("button",{name:"Shape 1, color 4",exact:true}).press("Enter");
    await expect(page.getByText("1 / 7 shapes colored",{exact:true})).toBeVisible();
    await page.getByRole("button",{name:"Shape 2, color 1",exact:true}).press("Enter");
    await expect(page.getByText("1 / 7 shapes colored",{exact:true})).toBeVisible();
    await page.getByRole("button",{name:"Tic-tac-toe",exact:false}).click();
    await page.getByRole("button",{name:"Row 1, column 1: empty",exact:true}).click();
    await expect(page.getByRole("button",{name:"Row 1, column 1: X",exact:true})).toBeDisabled();
    await expect(page.getByRole("button",{name:"Row 2, column 2: O",exact:true})).toBeDisabled();
    await page.getByRole("button",{name:"New game",exact:true}).click();
    await expect(page.getByRole("button",{name:/Row .*empty/})).toHaveCount(9);
    await page.getByRole("button",{name:"Matching friends",exact:false}).click();
    for(const i of [1,5,2,4,3,6])await page.getByRole("button",{name:`Card ${i}: face down`,exact:true}).click();
    await expect(page.getByText("All three pairs found! A wonderful bit of noticing.")).toBeVisible();
    await page.getByRole("button",{name:"Vienna The trail explorer",exact:true}).click();
    await expect(page.getByRole("heading",{name:"Chat with Vienna",exact:true})).toBeVisible();
    await expect(page.getByText("A cheerful leo story about sharing crayons.")).toHaveCount(0);
    await page.getByRole("button",{name:"Tell me a tiny story",exact:false}).click();
    await expect(page.getByText("A cheerful vienna story about sharing crayons.")).toBeVisible();
    if(payloads.at(-1).characterId!=="vienna")throw Error("Wrong identity");
    await page.getByRole("button",{name:"Color with me",exact:false}).click();
    await expect(page.getByText("0 / 7 shapes colored",{exact:true})).toBeVisible();
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error("Overflow");
    await page.getByRole("heading",{name:"Chat with Vienna",exact:true}).scrollIntoViewIfNeeded();
    await page.screenshot({path:`verification/activity-room-${width}.png`});
    await page.close();
    console.log(`${width}px: preset chat, identity switch, color matching, tic-tac-toe and memory passed`);
  }
} finally {
  await browser.close();
  await rm(new URL("page.tsx", fixture), {force:true});
  // Only this exact temporary page is removed; never delete an app subtree.
}
