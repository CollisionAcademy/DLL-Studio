import pathlib,subprocess,json,hashlib
import imageio_ffmpeg
root=pathlib.Path(__file__).resolve().parents[2]
folder=root/'episode-renders/independent-video/leo-motion-test'
clip=folder/'leo-motion-test.mp4'
if not clip.exists():raise SystemExit('Render has not been downloaded yet.')
ff=imageio_ffmpeg.get_ffmpeg_exe()
meta=subprocess.run([ff,'-hide_banner','-i',str(clip)],capture_output=True,text=True).stderr
(folder/'media-metadata.txt').write_text(meta,encoding='utf-8')
print(meta[:2500])
subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-i',str(clip),'-vf','fps=1,scale=320:-1,tile=5x2','-frames:v','1',str(folder/'motion-contact-sheet.jpg')],check=True)
subprocess.run([ff,'-hide_banner','-loglevel','error','-i',str(clip),'-f','null','-'],check=True)
print(json.dumps({'file':str(clip),'bytes':clip.stat().st_size,'sha256':hashlib.sha256(clip.read_bytes()).hexdigest(),'decode':'passed','contact_sheet':str(folder/'motion-contact-sheet.jpg')}))
