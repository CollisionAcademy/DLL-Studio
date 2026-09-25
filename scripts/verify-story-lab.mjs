import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.TEST_URL||'https://dll-studio.com';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:950});
  assert.equal((await page.goto(base+'/story-lab')).status(),200);
  await page.getByRole('heading',{name:'Captain Giggle',exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
  if(width===390){await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('navigation').getByRole('link',{name:'Story Lab',exact:true}).click();}
  await fs.mkdir('verification',{recursive:true});
  await page.screenshot({path:`verification/story-lab-${width}.png`,fullPage:true});
  await page.getByRole('link',{name:'Enter the adventure'}).click();
  await page.getByRole('button',{name:'Play story',exact:true}).waitFor({state:'visible'});
  await page.getByRole('button',{name:'Play story',exact:true}).click();
  await page.getByRole('button',{name:'Pause story',exact:true}).waitFor();
 }
 await page.goto(base+'/');
 await page.getByRole('link',{name:'Explore Story Lab'}).click();
 await page.waitForURL('**/story-lab');
 assert.match(page.url(),/story-lab/);
 assert.deepEqual(errors,[]);
 console.log('Production desktop/tablet/mobile Story Lab, navigation, adventure playback and homepage entry passed.');
} finally {await browser.close();}

