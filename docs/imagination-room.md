# The imagination room

`/member/activities` retains its server-side `activities` entitlement check.
The clubhouse tile now opens the character activity room. The original printable
remains available as an optional link at the bottom.

## Interaction and privacy

- All six established characters use their existing biography, greeting, motto,
  artwork and OpenAI persona. A character switch resets chat and game state.
- Chat uses the existing `/api/chat` Responses API integration, server-side
  moderation, bounded output, safe storybook fallbacks and preset allowlist.
  Only `characterId` and `promptId` are sent. No free-text or conversation history
  is accepted, and the OpenAI request uses `store: false`.
- No photo/file picker, microphone, messaging between users, or free-text input.
  React renders reply text as text, never model-generated HTML.
- Color-by-number has three hand-authored interactive SVG drawings. Only matching
  number/color pairs paint a region. Keyboard Enter/Space are supported.
- Tic-tac-toe runs locally, makes one legal character move per player turn,
  detects wins/draws, and offers a reset. Matching friends runs locally too.
- Game and chat UI state is in memory only. Leaving or switching characters
  clears it. Games do not mint monetary badge rewards or video credits.
- AI output checks reduce risk, but are not a guarantee that all generated
  replies are appropriate. The on-page parent explanation acknowledges this.

## FAL artwork

FAL supplies the reviewed activity-room illustration, not unrestricted live
image generation by children. The interactive coloring drawings are deterministic
SVGs with known clickable regions, not unreviewed generated images.

- Endpoint: `fal-ai/nano-banana-pro/edit`
- Request: `01a0e438-1405-7b90-9457-8fe7710c62ef`
- Output: https://v3b.fal.media/files/b/0aac23d7/KSQznZXXdF0wY9R5wlboY_12EUMna0.webp
- Local website asset: `public/activities/crew-art-room.webp`
- Reference identities: existing Leo, Bianna and Vienna public character images.
- One 1K image, strict safety tolerance 1, no web search, request payload storage
  disabled. Published price at generation: $0.15/image.
- Visually reviewed September 27, 2026: cartoon characters coloring at a table;
  no real people, personal details, links or inappropriate content observed.

## Verification

`npm test` covers the chat input/output policy and exhaustively explores the
tic-tac-toe player's legal paths. `node scripts/verify-activity-room.mjs` renders
the real component through a temporary development-only harness, tests at 1440px
and 390px, inspects the chat payload, and exercises coloring, games and character
switching using mock replies. It removes the temporary page in `finally`.
Production membership protection is never bypassed for these tests.
