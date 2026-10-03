# Member gameplay improvements

Implemented for `/member/play`:
- Games appear before storybook replies; the character picker collapses to shorten the path to play.
- Rocket code has five rounds, 2–6 symbols, practice/challenge modes, retry and peek controls, and a clear finish.
- Picture detectives uses shuffled 3/4/6-pair boards, turn counts, explicit mismatch dismissal, progress and completion feedback. The shared matching game also improves `/member/activities`.
- Three in a row uses the existing tactical opponent (win, block, center/corner priorities).
- Optional character tips reuse `/api/chat`, the existing configured OpenAI model, moderation, limits, caching, and storybook fallbacks. The browser sends only character/topic IDs. Tips explain strategy; they do not inspect or decide moves. No new dependencies or environment variables are required.
- The old fixed word grid and random rock/paper/scissors panel are replaced by the three-game selector. Existing picnic story and preset character replies remain.

## Verification

`npm test`: 28 passing tests, including matching-deck solvability/randomization and game-topic validation.
`npm run lint`, TypeScript, and `npm run build` passed.
Playwright/Edge covered all five rocket rounds, incorrect input, peeking, restart, all six matching pairs, reshuffle, tactical response, character switch, keyboard activation, AI response/failure UI, and a 390px viewport without horizontal overflow or runtime errors.

The browser test is `tests/crew-arcade.browser.mjs`. Set `GAMEPLAY_TEST_URL` to a locally accessible instance rendering `ClubPlay`. This test uses mocked `/api/chat` responses and does not spend API credits. During implementation a temporary development-only component fixture was used and removed before the production build. No authentication bypass is included in the change. Screenshots are in `output/gameplay/`.

Live OpenAI generation and authenticated production access were not tested. Existing OPENAI_API_KEY configuration controls whether tips use generated or fallback text. Gameplay was deployed from commit 24213e2. The subsequent restoration release also includes the previously uncommitted Halloween release support, Web Analytics, and production guidance.

## Next child playtest

Compare whether children can begin without adult help, finish a mission, explain what to do after a mistake, and choose a second game voluntarily. Record where they lose interest and which difficulty they choose. These changes have functional verification, not evidence yet of improved engagement from children.
