import {clamp,clock,sceneAt,events,activeEvent,remaining,selectedOption,branchFor,replayEvent} from './timeline.mjs';
const $=id=>document.getElementById(id);
let project,all=[],time=0,playing=false,muted=false,captions=true,videoURL=null,lastFrame=0,shownScene=-1,shownBeat='',shownEvent='',lastActive=null;
const answers=new Map(),found=new Map();
const video=$('video');
const colors={giggle:'#8cbcff',zip:'#f3b981',luna:'#d6b9ee',boomer:'#b3dddd',snapper:'#b2df9b'};
const speech=document.createElement('div');speech.className='stage-speech';speech.setAttribute('aria-hidden','true');$('board').append(speech);
const spriteColumns={zip:25,luna:50,boomer:75,snapper:100};
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function stageCharacters(scene,beat,offset){
 const line=beat.dialogue.find(d=>!d.speaker.includes('Narrator'));
 speech.textContent=line?line.speaker+': '+line.text:'';speech.hidden=!line;
 const thoughtful=[3,4,5,11,12].includes(scene.id)||Math.floor(offset/10)%3===1;
 $('cast').querySelectorAll('.character').forEach((el,i)=>{
  const id=el.dataset.character;
  el.classList.toggle('speaking',Boolean(line&&(id==='giggle'?line.speaker.includes('Leo'):line.speaker.toLowerCase().includes(id))));
  el.style.setProperty('--bob',reducedMotion.matches?'0px':Math.sin(offset*1.5+i)*3+'px');
  el.style.setProperty('--lean',reducedMotion.matches?'0deg':Math.sin(offset*.7+i)*1.3+'deg');
  if(id!=='giggle')el.querySelector('.character-art').style.backgroundPosition=spriteColumns[id]+'% '+(thoughtful?100:0)+'%';
 });
}
function text(id,value){$(id).textContent=value;}
function button(label,handler,cls=''){const b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls;b.addEventListener('click',handler);return b;}
function setPlaying(value){
 if(value&&time>=project.duration) seek(0);
 playing=value;lastFrame=0;
 text('play',playing?'Pause story':'Play story');
 if(videoURL){if(playing)video.play().catch(()=>{playing=false;text('play','Play story');text('video-note','Playback did not start. Try Play again or choose another local video.');});else video.pause();}
}
function seek(value){time=clamp(Number(value)||0,0,project.duration);if(videoURL)video.currentTime=time;shownEvent='';render();}
function celebrate(){const el=$('celebration');el.hidden=false;window.clearTimeout(celebrate.timeout);celebrate.timeout=window.setTimeout(()=>{el.hidden=true;},1800);}
function choose(event,index){
 if(!activeEvent(all,time)||activeEvent(all,time).key!==event.key)return;
 answers.set(event.key,index);text('feedback',event.options[index].feedback);
 $('answers').querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-pressed',String(i===index));});
 if(index===event.answer)celebrate();
}
function drawPuzzle(event){
 const area=$('puzzle');area.replaceChildren();area.hidden=!event||!['spot','spot-choice','count'].includes(event.type);if(area.hidden)return;
 const h=document.createElement('h3');h.textContent=event.prompt;area.append(h);
 if(event.type==='spot'){
  const seen=found.get(event.key)||new Set();found.set(event.key,seen);
  event.targets.forEach((target,i)=>{
   const b=button('★',()=>{if(!activeEvent(all,time)||activeEvent(all,time).key!==event.key)return;seen.add(i);b.classList.add('found');b.setAttribute('aria-pressed','true');text('feedback',`You found ${seen.size} of 3 stars. ${seen.size===3?'All three! We will reveal them together.':'Keep looking, or wait for the reveal.'}`);if(seen.size===3)celebrate();},'target');
   b.style.left=`${target.x}%`;b.style.top=`${target.y}%`;b.setAttribute('aria-label',target.label);b.setAttribute('aria-pressed',String(seen.has(i)));b.classList.toggle('found',seen.has(i));const label=document.createElement('small');label.textContent=target.label.replace('Star on the ','');b.append(label);area.append(b);
  });
 }else if(event.type==='count'){
  const wrap=document.createElement('div');wrap.className='count-bubbles';wrap.setAttribute('aria-label','Three cupcake bubbles');for(let i=0;i<3;i++){const bubble=document.createElement('span');bubble.className='cupcake';bubble.textContent='🧁';bubble.setAttribute('aria-label',`Cupcake bubble ${i+1}`);wrap.append(bubble);}area.append(wrap);
 }else{
  const wrap=document.createElement('div');wrap.className='key-pockets';event.options.forEach((o,i)=>{const b=button('',()=>choose(event,i),'target pocket');b.setAttribute('aria-label',`${o.label}${i===1?', with a key symbol':''}`);const symbol=document.createElement('span');symbol.className='key-symbol';symbol.textContent=['●','⚿','★'][i];const label=document.createElement('small');label.textContent=o.label;b.append(symbol,label);wrap.append(b);});area.append(wrap);
 }
}
function reveal(event){
 if(event.type==='spot'){text('feedback',event.reveal);$('puzzle').querySelectorAll('button').forEach(b=>{b.classList.add('found');b.disabled=true;});}
 else if(event.options.length){const index=answers.get(event.key);text('feedback',index===undefined?`No choice needed. ${selectedOption(event)?.feedback||''}`:selectedOption(event,index).feedback);}
 else text('feedback',event.reveal||'You can join in your own way.');
 text('timer','0');$('timer').hidden=false;
 $('answers').querySelectorAll('button').forEach(b=>b.disabled=true);
 $('puzzle').querySelectorAll('button').forEach(b=>b.disabled=true);
}
function showEvent(event){
 $('answers').replaceChildren();text('feedback','');text('branch','');
 text('question',event.prompt);text('activity-label',event.type==='choice'?'CHOOSE OUR NEXT STEP':'YOUR TURN');
 text('instructions',event.options.length?'Choose A, B, or C. You can change your mind during the countdown—or just watch.':'Point, say, imagine, or use the buttons when shown. Watching is welcome too.');
 event.options.forEach((option,index)=>{
  const b=button('',()=>choose(event,index),'answer');const letter=document.createElement('strong');letter.textContent='ABC'[index];const label=document.createElement('span');label.textContent=option.label;b.append(letter,label);b.setAttribute('aria-label',`Choose ${'ABC'[index]}: ${option.label}`);b.setAttribute('aria-pressed',String(answers.get(event.key)===index));b.classList.toggle('selected',answers.get(event.key)===index);$('answers').append(b);
 });
 if(answers.has(event.key))text('feedback',selectedOption(event,answers.get(event.key)).feedback);
 drawPuzzle(event);$('timer').hidden=false;
}
function render(){
 if(!project)return;
 const scene=sceneAt(project,time),offset=time-scene.start;
 if(scene.id!==shownScene){
  shownScene=scene.id;text('scene-number',`${String(scene.id).padStart(2,'0')} / ${project.scenes.length}`);text('scene-title',scene.name);text('location',scene.location);$('chapters').value=String(scene.start);$('cast').replaceChildren();
  scene.characters.forEach(id=>{const c=project.characters.find(c=>c.id===id),el=document.createElement('figure');el.className='character';el.dataset.character=id;const art=document.createElement('div');art.className='character-art';art.setAttribute('role','img');art.setAttribute('aria-label',id==='giggle'?'Leo, DLL Studio’s Spinosaurus superhero':c.name);if(id==='giggle'){const img=document.createElement('img');img.src='/characters/leo.png';img.alt='';art.append(img);}const label=document.createElement('figcaption');label.textContent=id==='giggle'?'Leo · Captain Giggle':c.name;el.append(art,label);$('cast').append(el);});
 }
 const beat=scene.beats[Math.min(5,Math.floor(offset/10))];
 stageCharacters(scene,beat,offset);
 const key=`${scene.id}:${beat.start}`;
 if(key!==shownBeat){shownBeat=key;text('action',beat.action);text('caption',beat.dialogue.length?beat.dialogue.map(d=>`${d.speaker}: ${d.text}`).join('  '):beat.onScreen||`[${beat.sfx}]`);}
 const active=activeEvent(all,time);
 const recent=[...all].reverse().find(e=>e.sceneId===scene.id&&time>=e.start+e.duration);
 const eventKey=active?active.key:recent?`${recent.key}:reveal`:`idle:${scene.id}`;
 if(eventKey!==shownEvent){
  shownEvent=eventKey;
  if(active){showEvent(active);lastActive=active;}
  else if(recent){showEvent(recent);reveal(recent);lastActive=recent;}
  else{text('activity-label','YOUR PART IN THE STORY');text('question',time===0?'Ready for an adventure?':'Enjoy the story');text('instructions','A question or game will appear here when it is time. You can pause or jump to any scene.');text('feedback','');text('branch','');$('answers').replaceChildren();$('timer').hidden=true;drawPuzzle(null);}
 }
 if(active)text('timer',String(remaining(active,time)));
 if(recent){text('branch',branchFor(recent,answers.get(recent.key),time));if(recent.type==='choice'&&time<recent.start+recent.duration+10)text('caption',branchFor(recent,answers.get(recent.key),time));}
 text('time',`${clock(time)} / ${clock(project.duration)}`);$('seek').value=String(time);$('seek').setAttribute('aria-valuetext',`${clock(time)} of ${project.duration/60} minutes`);$('progress').value=time;
 if(time>=project.duration){setPlaying(false);text('question','Everyone belongs. Thanks for watching!');text('instructions','Replay a choice or start the story again whenever you like.');}
}
function frame(now){
 if(playing&&project){
  if(videoURL)time=clamp(video.currentTime,0,project.duration);
  else if(lastFrame)time=clamp(time+(now-lastFrame)/1000,0,project.duration);
  render();
 }lastFrame=now;requestAnimationFrame(frame);
}
$('play').addEventListener('click',()=>setPlaying(!playing));
$('seek').addEventListener('input',e=>seek(e.target.value));
$('chapters').addEventListener('change',e=>seek(e.target.value));
$('replay').addEventListener('click',()=>{const e=replayEvent(all,time);answers.delete(e.key);found.delete(e.key);seek(e.start);setPlaying(true);});
$('mute').addEventListener('click',()=>{muted=!muted;video.muted=muted;text('mute',muted?'Unmute':'Mute');$('mute').setAttribute('aria-pressed',String(muted));});
$('captions').addEventListener('click',()=>{captions=!captions;$('caption').classList.toggle('off',!captions);text('captions',captions?'Captions on':'Captions off');$('captions').setAttribute('aria-pressed',String(captions));});
function clearVideo(){setPlaying(false);video.removeAttribute('src');video.load();if(videoURL)URL.revokeObjectURL(videoURL);videoURL=null;video.hidden=true;$('board').hidden=false;$('clear-video').hidden=true;$('file').value='';text('mode','ILLUSTRATED EPISODE PREVIEW');text('video-note','Local video removed. This is the silent storyboard, with no uploaded data.');seek(0);}
$('file').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;setPlaying(false);if(videoURL)URL.revokeObjectURL(videoURL);videoURL=URL.createObjectURL(file);video.src=videoURL;video.muted=muted;video.hidden=false;$('board').hidden=true;$('clear-video').hidden=false;text('mode','LOCAL LINEAR VIDEO REVIEW');time=0;text('video-note','Local file only. Choices show storyboard feedback; this player does not splice alternate video clips.');video.load();render();});
$('clear-video').addEventListener('click',clearVideo);
video.addEventListener('loadedmetadata',()=>{if(videoURL&&Number.isFinite(video.duration))text('video-note',Math.abs(video.duration-project.duration)>1?`This video is ${clock(video.duration)}; choices are scripted for 10:00 and may not align. Local review only, no upload.`:'10-minute local master loaded. Draft captions and choice timing still need final editorial review.');if(video.textTracks[0])video.textTracks[0].mode='hidden';});
video.addEventListener('ended',()=>{setPlaying(false);text('video-note','Local video ended. Return to the storyboard to review the full script.');});
video.addEventListener('error',()=>{if(videoURL){setPlaying(false);text('video-note','This local video could not play. Try another file, or return to the storyboard.');}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)setPlaying(false);});
window.addEventListener('pagehide',()=>{if(videoURL)URL.revokeObjectURL(videoURL);});
document.addEventListener('keydown',e=>{if(e.target!==document.body)return;if(e.code==='Space'){e.preventDefault();setPlaying(!playing);}const active=activeEvent(all,time);const index='abc'.indexOf(e.key.toLowerCase());if(active&&index>=0&&active.options[index])choose(active,index);});
try{
 const response=await fetch('./scenes.json');if(!response.ok)throw Error('Scene data is unavailable.');project=await response.json();all=events(project);$('seek').max=String(project.duration);$('progress').max=project.duration;
 for(const s of project.scenes){const option=document.createElement('option');option.value=s.start;option.textContent=`${String(s.id).padStart(2,'0')} · ${s.name}`;$('chapters').append(option);}
 $('play').disabled=false;render();requestAnimationFrame(frame);
}catch(error){text('error',`Could not load this storyboard. Open it through the local server. ${error.message}`);$('error').hidden=false;}
