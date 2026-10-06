# Story vault library

The story vault at `/member/stories` includes both approved episodes and written stories. The watch nook remains an episode-only shelf. Both use the existing authenticated content API, membership checks, and release dates; the browser receives protected media routes rather than source storage URLs.

To import the full local DLL video folder, run with a Node version that supports TypeScript imports:

```sh
node scripts/import-story-vault.mjs C:/dev/dll_studio/videos
```

The default dry run recursively discovers MP4s, verifies their movie headers and durations, hashes them, and writes `verification/story-vault-import.json`. It needs no secrets and does not upload or change the database. It includes every source file, including highlights, reframes, and numbered parts.

After authorization, configure only the DLL production `DATABASE_URL` and private `BLOB_READ_WRITE_TOKEN` in the ignored `.env.local`, then run the same command with `--publish`. Do not copy credentials from the unrelated root project. The import uses private multipart storage, verifies the uploaded hash and denies anonymous access before inserting each episode. Re-running reuses content hashes and IDs. It preserves existing content and release schedules, including `halloween-ghost-2026`, and leaves new entries member-only. Completed imports remain valid if a later file fails; rerun after resolving the failure.

Files from Drive can be downloaded into the source folder before import. This does not connect a live Drive sync; future additions require another import. No public sharing changes are needed.
