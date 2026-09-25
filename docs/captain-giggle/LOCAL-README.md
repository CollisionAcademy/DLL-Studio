# Ten-minute episode

Preview: http://localhost:3000/adventures/captain-giggle/index.html

The active plan is ten one-minute scenes, with Leo in every scene, assembled from three 180-second segments and a final 60-second segment. The old twenty-minute plan is archived.

Generate: node scripts/captain-giggle/make-kit.mjs public/adventures/captain-giggle

Validate: node public/adventures/captain-giggle/validate.mjs

Cast/segment checks: node --test tests/episode-contract.test.mjs

Assembly preflight: node scripts/captain-giggle/assemble-episode.mjs --check

The preview uses illustrations. Actual character animation, recorded sound and the separate final MP4 are pending. Deployment is paused. Approving the shorter story is not a purchase of generation credits.
