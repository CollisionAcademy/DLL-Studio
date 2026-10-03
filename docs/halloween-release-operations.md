# Halloween member premiere — October 1, 2026

The supplied `videos/dll_cast/Holloween/dll-studio-the-halloween-ghost-30-second (1).mp4` was uploaded unchanged to private Blob storage. Duration: 30.08 seconds; 854x480; 18,182,897 bytes. The retrieved upload's SHA-256 matched the source. Anonymous direct storage access returned 403.

Content ID: `halloween-ghost-2026`. Title: The Halloween Ghost!

Member premiere: 2026-10-01T09:06:23.324Z (October 1, 5:06:23 a.m. Eastern).
Public release: 2026-10-03T09:06:23.324Z (October 3, 5:06:23 a.m. Eastern).

All active paid membership tiers use the existing member_content entitlement. Existing admin access remains intact. The video is listed only in the Watch Nook during the exclusive window. Public page `/watch/halloween-ghost-2026` and stream `/api/watch/halloween-ghost-2026` query the database release time on every request and return 404 before release. They open automatically at release without a cron job. The underlying Blob remains private; the server streams it after checking access. Existing content has a null public_at and remains private indefinitely. No social platform upload is scheduled.

Migration: `migrations/004_content_public_release.sql`. Repeatable uploader: `scripts/publish-halloween.mjs` with prepare, activate, and verify modes. Activation does not reset an existing approved premiere's timestamps. Prepare requires only the dedicated Blob token in ignored `.env.halloween-storage.json` plus the project's configured DATABASE_URL; never download the full production environment for it. No credentials belong in this document or source control.

Production deployment: `dpl_8ymq5xQYksyo3Nv3KvwxEj2gnrJV`, aliased to https://dll-studio.com.

Validation: type checking, lint, all 26 automated tests, local build and production build passed. The release test exercises no release date, the 48-hour embargo, the exact opening boundary, missing approval, future member availability, and absent video. Anonymous live checks returned 401 on member content/media and 404 on the public page/media before release. A full signed-in member playback check is not yet recorded.
## Source-control restoration — October 2, 2026

The October 1 direct deployment included Halloween release routes that had not yet been committed to Git. The later gameplay deployment from Git therefore omitted those routes. The restoration commits the member Blob playback branch, public watch page and stream, database migration, uploader, release-boundary tests, and these operating notes alongside the existing gameplay changes.

A read-only database verification confirmed the approved content and original October 3, 5:06:23 a.m. Eastern release time remain intact. The existing database already has the public_at migration. Restoration does not re-upload media or reactivate the release. Future production releases must include all production source changes in Git before deployment.

The same restoration includes Vercel Web Analytics and updates the privacy page to describe analytics and performance measurement. Production character-continuity guidance and Halloween script/social drafts are now tracked in Git; this does not publish social posts or generate new media.
