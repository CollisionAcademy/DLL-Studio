"""Standalone motion pilot; no website writes. Dry-run is the default.
Use --submit once; --status checks an existing job without resubmission.
Requires FAL_KEY in the environment or repository .env.local.
"""
import argparse,base64,json,os,pathlib,urllib.request,urllib.error

ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'episode-renders'/'independent-video'/'leo-motion-test'
ENDPOINT='https://queue.fal.run/fal-ai/kling-video/v3/turbo/standard/image-to-video'
PROMPT=('A single continuous ten-second character acting test. Preserve the exact established DLL Studio Leo from the reference: orange Spinosaurus, long orange snout, teal eyes, cream jaw, spectacular blue sail with orange ribs, blue and orange armored suit, lightning chest emblem, silver wrist guards and tool belt. Full body visible, same simple studio setting. Seconds 0–3: Leo looks toward the viewer, lifts his hand from his belt and takes one deliberate step with a visible weight shift and natural tail counterbalance. Seconds 3–6: he bends his knees and leans forward to investigate an imaginary clue, turns his head and eyes downward, then looks up with a curious raised brow. Seconds 6–10: he stands smoothly, smiles and gives a clear articulated hand wave, settling into a balanced pose. Arms, fingers, knees, feet, head, eyes and tail must actually articulate. Locked camera; not a moving still picture, not a bobbing cutout, no zoom-only motion. Polished friendly colorful 3D children\'s animation. No new characters, extra limbs, costume changes, threatening expression, text or logos. No dialogue or music; this is a motion-only test, not finished episode footage.')

def key(env_path=None):
 value=os.environ.get('FAL_KEY','').strip()
 if value:return value
 env=pathlib.Path(env_path) if env_path else ROOT/'.env.local'
 if env.exists():
  for line in env.read_text(encoding='utf-8-sig').splitlines():
   name,sep,value=line.partition('=')
   if sep and name.strip()=='FAL_KEY':return value.strip().strip('\"\'')
 return ''

def api(url,credential,payload=None):
 if not url.startswith('https://queue.fal.run/'):raise RuntimeError('Unexpected queue URL; stopped.')
 headers={'Authorization':'Key '+credential}
 if payload is not None:headers['Content-Type']='application/json'
 req=urllib.request.Request(url,headers=headers,data=json.dumps(payload).encode() if payload is not None else None)
 try:
  with urllib.request.urlopen(req,timeout=60) as response:return json.load(response)
 except urllib.error.HTTPError as error:
  raise RuntimeError(f'FAL HTTP {error.code}. No automatic resubmission; inspect account access or the existing job.') from None

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--env-file');group=parser.add_mutually_exclusive_group();group.add_argument('--submit',action='store_true');group.add_argument('--status',action='store_true');args=parser.parse_args()
 credential=key(args.env_file)
 print(json.dumps({'mode':'submit' if args.submit else 'status' if args.status else 'dry-run','credential_configured':bool(credential),'character':'Leo','duration_seconds':10,'estimated_generation_usd':1.12,'automatic_paid_retries':0,'website_modified':False}))
 if not args.submit and not args.status:return
 if not credential:raise RuntimeError('Set FAL_KEY in your environment or repository .env.local. Never put it in frontend code.')
 OUT.mkdir(parents=True,exist_ok=True);jobfile=OUT/'job.json';intent=OUT/'submission-intent.json'
 if args.submit:
  if jobfile.exists() or intent.exists():raise RuntimeError('Submission already recorded. Use --status or reconcile the existing request; do not submit twice.')
  payload={'image_url':'data:image/png;base64,'+base64.b64encode((ROOT/'public/characters/leo.png').read_bytes()).decode(),'duration':'10','prompt':PROMPT}
  with intent.open('x',encoding='utf-8') as f:json.dump({'endpoint':ENDPOINT,'duration':10,'estimate_usd':1.12,'state':'submission_started'},f)
  job=api(ENDPOINT,credential,payload)
  jobfile.write_text(json.dumps(job,indent=2),encoding='utf-8')
  (OUT/'prompt.txt').write_text(PROMPT,encoding='utf-8')
  print(json.dumps({'request_id':job.get('request_id'),'state':'submitted','next':'Run --status. Do not submit again.'}));return
 if not jobfile.exists():raise RuntimeError('No known submitted request. If an intent file exists, reconcile with FAL before another submission.')
 job=json.loads(jobfile.read_text());status=api(job['status_url'],credential)
 print(json.dumps({'state':status.get('status')}))
 if status.get('status')!='COMPLETED':return
 if status.get('error'):raise RuntimeError('Provider reported job failure; no automatic retry.')
 result=api(job['response_url'],credential);(OUT/'result.json').write_text(json.dumps(result,indent=2))
 url=result['video']['url']
 from urllib.parse import urlparse
 host=urlparse(url).hostname or ''
 if not url.startswith('https://') or not (host=='fal.media' or host.endswith('.fal.media')):raise RuntimeError('Unexpected media host; inspect provider result before downloading.')
 dest=OUT/'leo-motion-test.mp4'
 if not dest.exists():
  with urllib.request.urlopen(url,timeout=120) as response,dest.open('xb') as target:
   while chunk:=response.read(1024*1024):target.write(chunk)
 print('Saved '+str(dest))

if __name__=='__main__':
 try:main()
 except Exception as error:raise SystemExit(str(error))
