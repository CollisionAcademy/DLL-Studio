"""Cloud episode renderer. One paid submission per shot; never automatically retry POST.
Scene outputs are production candidates until a human audiovisual review passes.
"""
import argparse, base64, hashlib, json, os, pathlib, subprocess, time, urllib.request, urllib.error

ROOT=pathlib.Path(__file__).resolve().parents[2]
BASE=ROOT/'episode-renders'/'cloud'
ENDPOINT='https://queue.fal.run/fal-ai/kling-video/v3/turbo/standard/image-to-video'

def save(path, data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding='utf-8')

def run(args):
    result=subprocess.run(args,capture_output=True,text=True)
    if result.returncode: raise RuntimeError(result.stderr[-4000:])
    return result.stdout

def probe(path):
    return json.loads(run(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]))

def api(url, payload=None):
    if not url.startswith('https://queue.fal.run/'): raise RuntimeError('Unexpected queue URL')
    headers={'Authorization':'Key '+os.environ['FAL_KEY']}
    if payload is not None: headers['Content-Type']='application/json'
    request=urllib.request.Request(url,data=json.dumps(payload).encode() if payload is not None else None,headers=headers)
    # GET is safe to retry. Never retry a paid submission, even on timeout.
    for attempt in range(5 if payload is None else 1):
        try:
            with urllib.request.urlopen(request,timeout=90) as response: return json.load(response)
        except (urllib.error.URLError,TimeoutError):
            if attempt == (4 if payload is None else 0): raise
            time.sleep(10)

def download(url,path):
    from urllib.parse import urlparse
    host=urlparse(url).hostname or ''
    if not url.startswith('https://') or not(host=='fal.media' or host.endswith('.fal.media')):raise RuntimeError('Unexpected media URL')
    temporary=path.with_suffix('.partial')
    with urllib.request.urlopen(url,timeout=180) as source,temporary.open('wb') as out:
        while chunk:=source.read(1024*1024):out.write(chunk)
    temporary.replace(path)

def render_scene(scene_id,dry=False):
    plan=json.loads((ROOT/'docs/independent-video/cloud-shot-plan.json').read_text(encoding='utf-8'))
    scene=next(s for s in plan['scenes'] if s['id']==scene_id)
    if plan['total_seconds']!=600 or plan['estimated_video_usd']>100:raise RuntimeError('Production limit exceeded')
    if len(scene['shots'])!=6:raise RuntimeError('Each scene must contain six ten-second shots')
    source=ROOT/scene['keyframe']
    if not source.is_file():raise RuntimeError('Missing reviewed scene keyframe')
    if dry:
        print(json.dumps({'scene':scene_id,'shots':6,'seconds':60,'estimated_usd':6.72,'keyframe':str(source)}));return
    if os.environ.get('GITHUB_RUN_ATTEMPT','1')!='1':raise RuntimeError('Paid render reruns disabled; reconcile saved jobs first')
    directory=BASE/f'scene-{scene_id:02d}';directory.mkdir(parents=True,exist_ok=True)
    for index,shot in enumerate(scene['shots'],1):
        prefix=directory/f'shot-{index:02d}'
        intent=prefix.with_suffix('.intent.json');jobpath=prefix.with_suffix('.job.json')
        output=prefix.with_suffix('.mp4');resultpath=prefix.with_suffix('.result.json')
        if not output.exists():
            if not jobpath.exists():
                if intent.exists():raise RuntimeError('Unreconciled submission intent; refusing duplicate spend')
                payload={'image_url':'data:image/png;base64,'+base64.b64encode(source.read_bytes()).decode(),'duration':'10','prompt':shot['prompt']}
                if len(payload['prompt'])>2500:raise RuntimeError('Prompt too long')
                save(intent,{'scene':scene_id,'shot':index,'estimate_usd':1.12,'state':'submission_started','endpoint':ENDPOINT})
                job=api(ENDPOINT,payload);save(jobpath,job)
                print(f"Scene {scene_id} shot {index}: submitted {job['request_id']}",flush=True)
            job=json.loads(jobpath.read_text());deadline=time.monotonic()+3600
            while True:
                status=api(job['status_url'])
                if status.get('status')=='COMPLETED':
                    if status.get('error'):raise RuntimeError('Provider job failed; no paid retry')
                    break
                if time.monotonic()>deadline:raise RuntimeError('Provider still running; saved request can be resumed without resubmission')
                time.sleep(25)
            result=api(job['response_url']);save(resultpath,result);download(result['video']['url'],output)
        media=probe(output);video=next(s for s in media['streams'] if s['codec_type']=='video')
        audio=next((s for s in media['streams'] if s['codec_type']=='audio'),None)
        if not audio:raise RuntimeError('Provider returned no audio; do not substitute silent finished episode')
        if abs(video['width']/video['height']-16/9)>.06:raise RuntimeError('Landscape output required')
        if not 9.8<=float(media['format']['duration'])<=10.6:raise RuntimeError('Unexpected shot duration')
        # Video-frame extraction preserves motion continuity inside a scene.
        source=directory/f'continuity-{index:02d}.png'
        if not source.exists():run(['ffmpeg','-v','error','-nostdin','-n','-sseof','-0.12','-i',str(output),'-frames:v','1',str(source)])
        save(prefix.with_suffix('.verified.json'),{'duration':media['format']['duration'],'width':video['width'],'height':video['height'],'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'artistic_review':'pending'})
        print(f'Scene {scene_id} shot {index}: downloaded and structurally checked',flush=True)
    save(directory/'scene-status.json',{'scene':scene_id,'status':'rendered_candidate','shots':6,'artistic_review':'pending','estimated_generation_usd':6.72})

def assemble():
    assembled=BASE/'delivery';assembled.mkdir(parents=True,exist_ok=True)
    normalized=BASE/'normalized';normalized.mkdir(exist_ok=True)
    plan=json.loads((ROOT/'docs/independent-video/cloud-shot-plan.json').read_text(encoding='utf-8'))
    files=[];captions=['WEBVTT',''];reviews=[]
    for scene in plan['scenes']:
        directory=BASE/f"scene-{scene['id']:02d}"
        if not (directory/'scene-status.json').exists():raise RuntimeError('Missing complete source scene')
        for index,shot in enumerate(scene['shots'],1):
            source=directory/f'shot-{index:02d}.mp4';target=normalized/f"{scene['id']:02d}-{index:02d}.mp4"
            if not target.exists():
                # Native model footage is lower resolution; this is a documented 1080p upscale.
                run(['ffmpeg','-v','error','-nostdin','-n','-i',str(source),'-t','10','-vf','scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=24,setsar=1','-af','aresample=48000,apad','-map','0:v:0','-map','0:a:0','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-ac','2',str(target)])
            files.append(target)
            if shot['dialogue']:
                start=(scene['id']-1)*60+(index-1)*10
                fmt=lambda n:f'{n//3600:02d}:{n%3600//60:02d}:{n%60:02d}.000'
                captions.extend([f'{fmt(start)} --> {fmt(start+10)}',' '.join(d['text'] for d in shot['dialogue']),''])
            reviews.append({'scene':scene['id'],'shot':index,'time':(scene['id']-1)*60+(index-1)*10,'check':['identity','articulation','dialogue accuracy','voice continuity','sound transitions','prop continuity']})
    def concat(inputs,out):
        listing=out.with_suffix('.concat.txt');listing.write_text('\n'.join("file '"+str(f.resolve()).replace('\\','/')+"'" for f in inputs))
        run(['ffmpeg','-v','error','-nostdin','-n','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(out)])
    # The one master contains all sixty distinct performed shots exactly once.
    master=assembled/'leo-captain-giggle-10min-review.mp4'
    concat(files,master)
    for number,(a,b) in enumerate([(0,18),(18,36),(36,54),(54,60)],1):concat(files[a:b],assembled/f'segment-{number:02d}.mp4')
    media=probe(master)
    if abs(float(media['format']['duration'])-600)>.5:raise RuntimeError('Master timing failed')
    run(['ffmpeg','-v','error','-nostdin','-i',str(master),'-f','null','-'])
    (assembled/'captions-DRAFT.vtt').write_text('\n'.join(captions),encoding='utf-8')
    save(assembled/'review-checklist.json',reviews)
    save(assembled/'delivery-status.json',{'status':'rendered_review_copy','seconds':media['format']['duration'],'frame':'1920x1080 upscale from model-native landscape output','fps':24,'unique_shots':60,'estimated_generation_usd':67.20,'billing_total_verified':False,'full_decode':'passed','artistic_and_caption_review':'pending'})
    (assembled/'README.txt').write_text('Continuous ten-minute animated episode REVIEW COPY. Sixty separately performed shots, three 3-minute sections plus a 1-minute ending. Native generated dialogue/audio; do not describe voice consistency or captions as approved until playback review. This export is upscaled to 1080p from model-native resolution. Inspect all scene joins, anatomy, prop continuity, spoken lines, song and captions before publishing the film. The website companion is unchanged.\n',encoding='utf-8')
    print('Continuous ten-minute review master exported and decoded successfully.',flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--scene',type=int);p.add_argument('--dry-run',action='store_true');p.add_argument('--assemble',action='store_true');args=p.parse_args()
    if args.assemble:assemble()
    elif args.scene:render_scene(args.scene,args.dry_run)
    else:p.error('Choose --scene N or --assemble')
