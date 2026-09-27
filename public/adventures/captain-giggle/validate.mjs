import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sceneAt,events,activeEvent,remaining,selectedOption,branchFor,replayEvent} from './timeline.mjs';
const p=JSON.parse(fs.readFileSync(new URL('./scenes.json',import.meta.url)));
const all=events(p);
test('master timeline is continuous, exactly 10 minutes, and has complete prompt packages',()=>{
 assert.equal(p.scenes.length,10);assert.equal(p.duration,600);
 const ids=new Set(p.characters.map(c=>c.id));let end=0;
 for(const s of p.scenes){assert.equal(s.start,end);end+=s.duration;assert.equal(s.duration,60);assert.equal(s.beats.length,6);assert.equal(s.shotPrompts.length,6);s.beats.forEach((b,i)=>{assert.equal(b.start,i*10);assert.equal(b.duration,10);assert.ok(b.action.length>20);});for(const id of s.characters)assert.ok(ids.has(id));for(const key of ['visualPrompt','camera','motion','lighting','music','negativePrompt'])assert.ok(s[key].length>20);}
 assert.equal(end,600);assert.equal(sceneAt(p,600).id,10);assert.equal(sceneAt(p,60).id,2);
});
test('all required interaction types exist and response windows remain inside scenes',()=>{
 assert.equal(all.filter(e=>e.type==='choice').length,3);
 for(const type of ['spot','spot-choice','feelings','count','movement','sing','final'])assert.ok(all.some(e=>e.type===type),type);
 for(const e of all){assert.ok(e.duration>=8&&e.duration<=10);assert.ok(e.start+e.duration<=e.sceneId*60);assert.equal(activeEvent(all,e.start).key,e.key);assert.equal(remaining(e,e.start),e.duration);assert.equal(remaining(e,e.start+e.duration),0);assert.notEqual(activeEvent(all,e.start+e.duration)?.key,e.key);}
});
test('all three variants reconverge at the same boundary and missing answers have a default',()=>{
 for(const e of all.filter(e=>e.type==='choice')){assert.equal(e.options.length,3);assert.ok(selectedOption(e));for(let i=0;i<3;i++){assert.ok(branchFor(e,i,e.start+e.duration));assert.equal(branchFor(e,i,e.start+e.duration+10),'');}assert.ok(branchFor(e,undefined,e.start+e.duration));}
});
test('replay chooses the current or previous interaction, including the opening fallback',()=>{
 assert.equal(replayEvent(all,0).key,all[0].key);for(const e of all)assert.equal(replayEvent(all,e.start+1).key,e.key);
});
test('draft captions contain every scripted line and lyrics',()=>{
 const vtt=fs.readFileSync(new URL('./captions.vtt',import.meta.url),'utf8');assert.ok(vtt.startsWith('WEBVTT'));
 for(const s of p.scenes)for(const b of s.beats)for(const d of b.dialogue)assert.ok(vtt.includes(`${d.speaker}: ${d.text}`));assert.ok(vtt.includes('Everyone belongs!'));
});
test('public interface has no credentials, external script sources, telemetry or persistence',()=>{
 const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8'),js=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
 assert.ok(!/https?:\/\//.test(html));assert.ok(!/FAL_KEY|OPENAI_API_KEY|localStorage|sessionStorage|sendBeacon|WebSocket/.test(js));assert.ok(html.includes('aria-live="polite"'));assert.ok(html.includes('type="range"'));assert.ok(js.includes('URL.revokeObjectURL'));assert.ok(js.includes("fetch('./scenes.json')"));
});
test('spoken non-song lines fit a ten-second beat at approximately 125 words per minute',()=>{
 for(const s of p.scenes)if(s.id!==10)for(const b of s.beats){const n=b.dialogue.map(d=>d.text).join(' ').split(/\s+/).filter(Boolean).length;assert.ok(n<=21,`Scene ${s.id} beat ${b.start}: ${n} words`);}
});
