import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const episode=JSON.parse(fs.readFileSync(new URL('public/adventures/captain-giggle/scenes.json',root)));
const plan=JSON.parse(fs.readFileSync(new URL('docs/captain-giggle/episode-segments.json',root)));
test('Leo is the established lead and appears in every scene',()=>{
 assert.equal(episode.characters.find(c=>c.id==='giggle').name,'Leo');
 for(const scene of episode.scenes){assert.ok(scene.characters.includes('giggle'),`Scene ${scene.id} missing Leo`);assert.ok(scene.consistency.some(c=>c.name==='Leo'));}
});
test('production segments cover the episode once, continuously, and each includes an established character',()=>{
 const established=new Set(['leo','luca','vienna','bianna','doo-wop-dog','gramps']);let end=0;
 for(const segment of plan.segments){assert.equal(segment.start,end);end+=segment.duration;assert.ok(segment.cast.some(id=>established.has(id)));}
 assert.equal(end,600);assert.deepEqual(plan.segments.flatMap(s=>s.sceneIds),episode.scenes.map(s=>s.id));
});
