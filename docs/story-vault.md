# Story vault library

The story vault at `/stories` is free for everyone, with no account or paid membership required. `/member/stories` redirects there before any account check. It appears in the main menu and footer. It lists published episodes and written stories, and its Play all button advances through the videos once, stopping at the end. Videos can also be chosen individually; Stop play all pauses the player and cancels automatic advance.

The public shelf and `/api/watch/:id` check approval and publication dates in the database. Household birthday/custom videos remain private. The browser receives public playback routes rather than private storage URLs. The watch nook retains its member content access rules.

To import the full local DLL video folder, run with a Node version that supports TypeScript imports:

```sh
node scripts/import-story-vault.mjs C:/dev/dll_studio/videos
```

The default dry run recursively discovers MP4s, verifies their movie headers and durations, hashes them, and writes `verification/story-vault-import.json`. It needs no secrets and does not upload or change the database. It includes every source file, including highlights, reframes, and numbered parts.

After authorization to access production credentials, configure only the DLL production `DATABASE_URL` and private `BLOB_READ_WRITE_TOKEN` in the ignored `.env.local`, then run the same command with `--publish`. Do not copy credentials from the unrelated root project. The import uses private multipart storage, verifies the uploaded hash and denies anonymous access to raw storage before inserting each episode. Re-running reuses content hashes and IDs. Per the user's request, every verified source video is approved and published immediately for everyone through the public playback route. This includes the existing `halloween-ghost-2026` entry after its bytes match; unrelated content and household requests are unchanged. Completed imports remain valid if a later file fails; rerun after resolving the failure.

Files from Drive can be downloaded into the source folder before import. This does not connect a live Drive sync; future additions require another import. No public sharing changes are needed.
