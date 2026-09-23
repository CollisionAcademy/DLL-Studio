import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.goto('http://localhost:3000/characters/gramps');
await page.waitForLoadState('networkidle');
console.log(JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right,left:e.getBoundingClientRect().left,width:e.getBoundingClientRect().width})).filter(e=>e.right>391||e.left<0)),null,2));
await page.screenshot({path:'verification/gramps-mobile.png',fullPage:true});
await browser.close();
