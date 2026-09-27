# Cloud production handoff — 2026-09-25

The user authorized Story Lab integration, GitHub save and Vercel production deployment, plus cloud rendering while the office computer is off. They explicitly authorized FAL_KEY as an encrypted repository Actions secret.

- Production Story Lab: https://dll-studio.com/story-lab
- Existing companion retained: /adventures/captain-giggle/index.html
- Production deployment: dpl_4Jpf5HCNaBYGYYxu1a1xqmBDo7mA
- GitHub repository: CollisionAcademy/DLL-Studio, main.
- Cloud workflow: .github/workflows/independent-episode.yml
- Cloud input: cloud-shot-plan.json and ten original landscape keyframes.
- Sixty unique 10-second performed shots. Each scene chains the previous shot's final frame. Ten scene jobs, at most three in parallel. Provider-native dialogue and audio. A continuous 600-second master and 180/180/180/60-second production pieces are assembled automatically.
- Estimated first video pass $67.20, plus the previous $1.12 pilot. No automatic paid retries. The plan limits estimated video generation to $100. This is not a verified billed total or provider account spend cap.
- Workflow dispatch/rerun guard prevents casually duplicating paid production. Recover existing request IDs from artifacts before any retry.
- Artifacts retain generated media, job records and the completed review MP4 for 14 days. Download promptly. Final audiovisual/caption review remains necessary; do not label the automated review copy as a finished approved film.
- Model-native footage is upscaled to 1920x1080 at 24fps; it is not native 1080p generation.
- Keyframes preserve Leo's established design and show each story location. Check cake/decorative prop details, character scale, voice consistency and all joins during final QA; generated scene references are not a guarantee of continuity.
- The website remains an honestly labeled illustrated preview. The independent film does not replace its timeline or interactions.

Verification completed: Next production build; eight policy/episode-contract tests; seven companion tests; production browser tests at desktop, tablet and mobile sizes including navigation, homepage entry and companion playback.

Home-office continuation: inspect the workflow run, download the leo-ten-minute-episode artifact after success, review complete picture and sound, correct problems without duplicating good shots, align captions to actual speech, and deliver the independent video. Do not automatically publish an unreviewed film to the public website.

Cloud run started and preflight passed: https://github.com/CollisionAcademy/DLL-Studio/actions/runs/36192865667 . Source commit: 5d4adf14fd6754ad4717d5f4db36e1f9b778e529. Jobs run on GitHub-hosted Ubuntu and no longer depend on the office computer. Download the leo-ten-minute-episode artifact when assembly succeeds.
