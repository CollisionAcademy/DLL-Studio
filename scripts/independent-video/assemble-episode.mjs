// Usage: node scripts/captain-giggle/assemble-episode.mjs [--check]
// Requires FFmpeg/FFprobe on PATH (or FFMPEG_PATH / FFPROBE_PATH).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const plan=JSON.parse(fs.readFileSync(path.join(root,'docs/independent-video/episode-segments.json'),'utf8'));
const established=new Set(['leo','luca','vienna','bianna','doo-wop-dog','gramps']);
let end=0;
for(const s of plan.segments){if(s.start!==end||!s.cast.some(c=>established.has(c)))throw Error(`Invalid timeline or missing DLL Studio character: ${s.id}`);end+=s.duration;}
if(end!==600)throw Error('The current episode must total 10:00.');
const inputs=plan.segments.map(s=>({...s,absolute:path.resolve(root,s.file)}));
const missing=inputs.filter(s=>!fs.existsSync(s.absolute));
if(missing.length){console.error('No assembly performed. Rendered source segments are missing:\n'+missing.map(s=>`${s.id}: ${s.file} (${s.duration}s; cast: ${s.cast.join(', ')})`).join('\n'));process.exit(2);}
function run(exe,args){const r=spawnSync(exe,args,{encoding:'utf8',maxBuffer:16*1024*1024,windowsHide:true});if(r.error)throw r.error;if(r.status!==0)throw Error(r.stderr||`${exe} failed`);return r.stdout;}
const ffprobe=process.env.FFPROBE_PATH||'ffprobe',ffmpeg=process.env.FFMPEG_PATH||'ffmpeg';
function probe(file){return JSON.parse(run(ffprobe,['-v','error','-show_format','-show_streams','-of','json',file]));}
let signature;
for(const s of inputs){
 const p=probe(s.absolute),v=p.streams.find(s=>s.codec_type==='video'),a=p.streams.find(s=>s.codec_type==='audio');
 if(!v||!a)throw Error(`${s.id}: requires both finished video and an audio track.`);
 if(v.width!==1920||v.height!==1080||v.avg_frame_rate!=='24/1')throw Error(`${s.id}: deliver 1920×1080 at 24fps.`);
 if(Math.abs(Number(p.format.duration)-s.duration)>.15)throw Error(`${s.id}: duration does not match planned ${s.duration}s.`);
 const current=JSON.stringify([v.codec_name,v.pix_fmt,v.time_base,a.codec_name,a.sample_rate,a.channels,a.channel_layout]);
 if(signature&&current!==signature)throw Error(`${s.id}: normalize stream formats to match the first segment before joining.`);signature=current;
 if(/[\r\n']/.test(s.absolute))throw Error('Unsupported input path characters.');
}
if(process.argv.includes('--check')){console.log('All four source segments pass media/timeline checks. Review dialogue, music and visual continuity at every join before the final export.');process.exit(0);}
const outputDir=path.join(root,'episode-renders/independent-video');fs.mkdirSync(outputDir,{recursive:true});
const output=path.join(outputDir,'leo-captain-giggle-full-episode.mp4');
if(fs.existsSync(output))throw Error('Final output already exists. Archive or rename it before another export.');
const list=path.join(outputDir,'concat-inputs.txt');fs.writeFileSync(list,inputs.map(s=>`file '${s.absolute.replaceAll('\\','/')}'`).join('\n'));
run(ffmpeg,['-nostdin','-n','-f','concat','-safe','0','-i',list,'-map','0:v:0','-map','0:a:0','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',output]);
const final=probe(output);if(Math.abs(Number(final.format.duration)-600)>.5)throw Error('Export exists but final duration failed verification. Inspect before use.');
fs.copyFileSync(path.join(root,'docs/independent-video/captions.vtt'),path.join(outputDir,'captions-DRAFT-needs-final-audio-alignment.vtt'));
console.log(`Exported one continuous 10-minute episode: ${output}\nInspect the final audiovisual export and align captions before publishing.`);

