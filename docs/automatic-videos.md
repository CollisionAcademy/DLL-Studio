# Automatic membership videos

User authorized automatic 10–15 second generation and private shelf delivery on September 27, 2026.

- Super Crew reserves one custom-video credit per paid billing period; Family Pass reserves two. Existing locked database transactions enforce the cap and idempotent request keys. Administrators have no membership credit cap.
- Accepted submissions display a confirmation; the form fades and disables at zero remaining credits. Confirmed rejected/failed requests return the reserved credit. The next paid renewal supplies new credits; calendar-month boundaries do not invent unpaid credits.
- OpenAI moderates the untrusted story and writes a character-preserving animation prompt. FAL Kling V3 Turbo Standard image-to-video animates the selected original DLL reference, at 15 seconds for custom stories or 10 for birthdays.
- A protected Vercel cron calls `/api/jobs/videos` once per minute, advancing one persisted job per invocation. The queue works after a parent closes the page. The open shelf polls account data every 15 seconds while work is pending.
- Completed MP4s are checked for target duration, copied to the private `dll-member-videos` Vercel Blob store, and marked ready transactionally. Delivery uses `auto_delivered_at`, not a fabricated staff approval. Household ownership is required to stream video; provider/private storage URLs never appear in member API data.
- Prompt moderation and duration validation are automatic checks, not a human visual review. Public publishing remains separate. Existing review/uncertain jobs still require staff reconciliation.
- Ambiguous provider submissions are never blindly resubmitted. A stored provider ID resumes polling after worker interruptions; storage failures retry archival of the same output. Deterministic blob paths prevent duplicate assets when completion is retried.

## Configuration

Production needs `CRON_SECRET`, `OPENAI_API_KEY`, `FAL_KEY`, `DATABASE_URL`, and the connected private Blob credentials. `DLL_VIDEO_DAILY_LIMIT=10` limits total site-wide dispatches per rolling 24 hours, including administrator jobs; excess work remains queued. FAL catalog pricing checked September 27 was $0.112/second ($1.12 birthday / $1.68 custom), plus OpenAI, storage and hosting usage. No checkout changes.

`npm run db:migrate` applies additive migration 002. `scripts/configure-video-worker.mjs` creates a local ignored scheduler secret and configures only CRON_SECRET and the daily limit on the existing production project. Never commit `.env*` credentials. Migration and env changes must precede deployment. Cron becomes active on production deployment.

## Verification

`npm test` covers credit reservation, duplicate requests, exhausted periods, administrator exemption, MP4 duration validation and pending states. `node scripts/verify-video-submission.mjs` uses mock APIs to test confirmation and disabled/faded form behavior, including persistence after reload. Live provider delivery is checked separately and must be reported accurately.
