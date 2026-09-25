export const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
export const clock=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
export function sceneAt(project,time){return project.scenes[Math.min(project.scenes.length-1,Math.floor(clamp(time,0,project.duration)/60))];}
export function events(project){return project.scenes.flatMap(scene=>{
 if(!scene.interaction)return [];
 const main={...scene.interaction,key:`${scene.id}:main`,sceneId:scene.id,start:scene.start+scene.interaction.at};
 const extra=scene.interaction.additionalPause;
 return extra?[main,{...extra,type:extra.type||'sing',key:`${scene.id}:extra`,sceneId:scene.id,start:scene.start+extra.at,options:extra.options||[],reveal:extra.reveal||'Everyone belongs!',default:extra.default||0}]:[main];
});}
export function activeEvent(all,time){return all.find(e=>time>=e.start&&time<e.start+e.duration)||null;}
export function remaining(event,time){return clamp(Math.ceil(event.start+event.duration-time),0,event.duration);}
export function selectedOption(event,answer){return event.options?.[answer??event.default??0]||null;}
export function branchFor(event,answer,time){return event.type==='choice'&&time>=event.start+event.duration&&time<event.start+event.duration+10?selectedOption(event,answer)?.branch||'': '';}
export function replayEvent(all,time){return [...all].reverse().find(e=>e.start<=time)||all[0];}
