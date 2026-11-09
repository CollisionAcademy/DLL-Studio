# Story Vault gallery

`/stories` is the free public Story Vault. `/member/stories` still redirects there. Membership plans, authentication, billing, private household videos, database publication checks, the Watch Nook, and the Captain Giggle companion are unchanged.

The gallery contains 16 explicit DLL Studio YouTube uploads, with a featured video, category filters, locally hosted thumbnails and a keyboard-accessible video dialog. Opening a video loads a single privacy-enhanced YouTube iframe with `autoplay=0` and no playlist. Press the player's play button to watch. Closing the dialog removes the iframe, stops playback and restores focus. No third-party YouTube requests happen during gallery browsing. Website Analytics and Speed Insights scripts have been removed; no custom viewer tracking was added.

YouTube controls its player, ads, external links and end suggestions. `rel=0` limits suggestions to the same channel; it does not remove them. Privacy-enhanced mode is not a guarantee of zero third-party processing after opening a player. The page and privacy notice disclose this. The embedded player does not add a comments section or open chat. Channel/site child-directed settings must be maintained by the owner in Google's account tools; this change does not claim those settings were audited.

## Sources checked November 8, 2026 (America/New_York)

- Requested Drive folder: `1GUUyuu2o0Yd43KZFAO1JDZBkZ4MrBKSC`. The connected account returned zero files; metadata/permissions lookup returned 404 `notFound`. This does not establish that the folder is empty, public, or deleted. No sharing settings were changed.
- YouTube: `https://www.youtube.com/@DLL-Studio`. All 16 catalog IDs were checked with YouTube oEmbed; each author URL matched that channel. Source titles and thumbnail provenance are saved by the verification script in ignored `verification/vault-sources.json`.
- Only small JPEG thumbnails are stored in `public/story-vault/` (about 245 KiB total). No video binaries or Drive credentials are committed.

## Updating the catalog

Review each new upload, then add its ID, display title and category to `src/lib/youtube-videos.ts`. Run `node scripts/verify-vault-sources.mjs` to verify channel ownership and fetch thumbnails, and inspect the images. Future uploads are not automatically published from a feed. Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and browser verification before deploying.

The historical local/private-storage import helpers remain available in `scripts/import-story-vault.mjs` and `scripts/publish-staged-story-vault.mjs`; this gallery update does not invoke them or modify database content. Avoid public Drive embedding and large video files in Git.

Player references: [YouTube parameters](https://developers.google.com/youtube/player_parameters), [privacy-enhanced embeds](https://support.google.com/youtube/answer/171780).
