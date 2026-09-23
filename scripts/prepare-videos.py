import json, pathlib, urllib.request, subprocess, concurrent.futures
import imageio_ffmpeg
root=pathlib.Path(__file__).resolve().parents[1]
ff=imageio_ffmpeg.get_ffmpeg_exe()
jobs=json.loads((root/'docs/media-manifest.json').read_text())
captions={'luca':'I’m Luca! Grab a ball. Let’s play together!','leo':'I’m Leo! Let’s build something super!','vienna':'I’m Vienna! There’s an adventure around every corner!','bianna':'I’m Bianna! Let’s get a little bit silly!','doo-wop-dog':'I’m Doo Wop Dog! Let’s sniff out a mystery!','gramps':'They call me Gramps. You can teach an old bird new tricks!'}
def prepare(job):
    ident=job['id']; raw=root/'verification'/f'{ident}-raw.mp4'; dest=root/'public/intros'/f'{ident}.mp4'
    urllib.request.urlretrieve(job['url'],raw)
    subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-i',str(raw),'-an','-t','5','-c:v','libx264','-crf','24','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',str(dest)],check=True)
    (root/'public/intros'/f'{ident}.vtt').write_text('WEBVTT\n\n00:00.000 --> 00:05.000\n'+captions[ident]+'\n',encoding='utf-8')
    subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-ss','2.5','-i',str(dest),'-frames:v','1',str(root/'verification'/f'{ident}-video-frame.jpg')],check=True)
    return {'id':ident,'bytes':dest.stat().st_size}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    for result in pool.map(prepare,jobs):print(json.dumps(result),flush=True)
