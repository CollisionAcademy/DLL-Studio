# Independent animated video — 10 minutes

The Captain Giggle website is frozen as-is. This video is a separate deliverable. Its source plan is copied here so future website edits cannot silently change the video.

## Required result

- One continuous 10-minute animated episode, delivered separately as an MP4.
- Leo, DLL Studio’s established Spinosaurus, is the lead and appears in every production segment.
- Actual articulated performance comparable to the supplied videos.zip: walking/weight shifts, head and eye direction, gestures, expressions, prop interaction and coherent shot staging. Static artwork, CSS motion and camera pans alone do not satisfy the deliverable.
- Three 180-second production segments followed by one 60-second ending, with one opening and closing and no repeated intros between segments.
- Original or appropriately licensed dialogue, music and effects. The first motion-only test is not the episode or final audio.

## Reference inspection

The supplied ZIP contains `Dog detective intro.mp4` (149.40 seconds, 1920×1080, 30fps) and `Doowop detective ep1.mp4` (71.23 seconds, 3840×2160, 30fps). Both have 48kHz stereo AAC audio. Sampled frames show polished 3D character scenes in the intro and drawn 2D detective scenes in the episode. The common target is performed character action and scene progression; preserve Leo’s approved 3D identity rather than copying a different dog design.

## First job

`scripts/independent-video/render-leo-pilot.py` is a ten-second articulation test using Leo’s existing approved reference image. Estimated video-generation charge: $1.12 at the observed $0.112/second rate. No automatic paid retries. One request completed successfully on 2026-09-25 (request ID 01a0da6e-6b50-70d3-99aa-1680408ee8b4). Estimated charge is not a verified billing total. Credentials were loaded from an external local environment file; no credentials are stored here.

```powershell
python scripts/independent-video/render-leo-pilot.py
python scripts/independent-video/render-leo-pilot.py --submit
python scripts/independent-video/render-leo-pilot.py --status
```

The dry run performs no network request. Submit is an explicit paid-generation operation. It records intent before the request; if a response is lost, reconcile it rather than repeating the job. Store credentials only in the environment or a local environment file supplied with `--env-file`, never in this document or the public site.

## Review before scaling production

Check Leo’s silhouette, face, sail, outfit, number of limbs, gestures and weight shifts. Reject camera-only motion, sliding feet, frozen faces, identity drift and distorted hands. Then prepare approved landscape scene keyframes, render shots, review each shot, record/synchronize voices, assemble the four production segments and deliver the continuous MP4. A 720p model output is not native 1080p; final resolution workflow must be documented honestly.

No final MP4, episode segments, voice track or production deployment has been completed. The user subsequently authorized the full build and cloud production. The first pass is estimated at $67.20; the cloud plan allows no automatic paid retries and refuses an estimate above $100. See CLOUD-HANDOFF.md for current deployment and production status.

Sources checked: https://fal.ai/models/fal-ai/kling-video/v3/turbo/standard/image-to-video/api and https://fal.ai/models/fal-ai/kling-video/v3/turbo/standard/image-to-video

## Completed pilot inspection — 2026-09-25

- Local file: `episode-renders/independent-video/leo-motion-test/leo-motion-test.mp4`.
- Duration 10.04 seconds, 960x960, 24fps, H.264 with an AAC audio stream. This square pilot is not the landscape episode or an approved final soundtrack.
- Full video decode passed. SHA-256: `4aac33c62dde29fe966bd785b5082cff0da3978b3d2e92c7559334e0eab05539`.
- Ten sampled frames show an articulated step, knee/body bend, facial changes and raised-hand wave. Leo's orange body, blue/orange suit, lightning emblem and sail remain recognizable. Frame sampling does not certify every transition or audio quality; review playback before production reuse.
- Inspection artifacts: `motion-contact-sheet.jpg` and `media-metadata.txt` alongside the clip. Reproduce with `python scripts/independent-video/inspect-leo-pilot.py`.
- No additional paid jobs submitted. Full episode remains unrendered. Website unchanged.

