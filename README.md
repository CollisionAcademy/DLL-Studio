# DLL Studio

## Membership implementation

The site includes four membership tiers, parent controls, entitlement-gated activities, Stripe billing adapters, PostgreSQL migrations, and a moderated FAL video queue. Public pages remain available without membership configuration. See [membership setup, operations, changed files, and the four-tier test checklist](docs/membership-implementation.md). Checkout is closed until DLL-specific setup is complete; `.env.membership.example` lists configuration without secrets. The original public-site documentation below describes the public experience; membership adds optional accounts, payments, and stored parent-managed data.

A Next.js website for Luca, Leo, Vienna, Bianna, Doo Wop Dog, and Gramps. Built for `dll-studio.com`, with Vercel hosting and the `CollisionAcademy/DLL-Studio` repository.

## Included

- A responsive character gallery with interest filters and six individual character pages.
- Six five-second, captioned, silent character introductions, served locally as optimized MP4 files.
- Six browser games: Goal Getter, Super Builder, Trail Quest, Silly Story Machine, Clue Crew, and Kindness Club.
- Character chat with fixed question buttons, server-side OpenAI generation, output moderation, and labeled prewritten storybook fallbacks.
- Parent information, privacy information, keyboard controls, reduced-motion support, and metadata.

## Development

Node 20.9+ is required (use a maintained Node LTS release in production).

```sh
npm ci
cp .env.example .env.local
# Set OPENAI_API_KEY in .env.local. Do not commit it.
npm run dev
```

`OPENAI_MODEL` defaults to `gpt-4.1-mini`. API credentials are server-only. No Fal credentials are needed for public intro playback because those videos are already generated. Membership video generation uses a server-side FAL key. Google Drive is not exposed to the public app.

```sh
npm run build
npm test
npm run typecheck
node scripts/verify-site.mjs
```

The browser verification script expects the dev server at `http://localhost:3000`, Chrome installed, and a working OpenAI key. It exercises all games to completion, checks all videos, validates chat boundaries, and checks a 390px mobile viewport. Override `TEST_URL` for a publicly accessible deployment. Screenshots and results are kept in ignored `verification/`.

## Deployment

The Vercel project is `dll-studio` in `collision-academy-82dbb1d7`. Its Git integration points to this repository. Set `OPENAI_API_KEY` as a sensitive environment variable in Vercel for production and preview, and set `OPENAI_MODEL` to `gpt-4.1-mini`.

```sh
vercel link --project dll-studio --scope collision-academy-82dbb1d7
vercel --prod --scope collision-academy-82dbb1d7
```

Add `dll-studio.com` and `www.dll-studio.com` to the project. Use the exact records returned by Vercel in the registrar's DNS panel. Keep Google Workspace MX, verification TXT, SPF, DKIM, and DMARC records intact. A pending domain is not a live custom-domain deployment.

## Chat boundaries and operational limits

The API accepts only a valid character ID and one of six preset topic IDs. Additional fields, arbitrary messages, uploads, and history are rejected. No child's free text is sent to OpenAI. Replies are checked by OpenAI moderation and an additional output filter; generation/moderation failure uses a prewritten answer. Responses API storage is disabled, but that does not disable the provider's abuse-monitoring retention.

The client keeps conversation display state only in memory. Rate limiting uses a temporary hash of the connection address. Response caching, in-flight deduplication, and rate counters are **per process**, not durable or globally enforced across Vercel instances. Configure Vercel Firewall rate limits and OpenAI project spending limits for public traffic. Public play has no ads or analytics scripts. Optional memberships add parent accounts, billing, and stored parent-managed data; see the membership guide.

## Media provenance

Character portraits were generated with the built-in image-generation tool from the approved DLL Studio character sheet. Gramps follows the approved falcon tribute design. All final files are in `public/characters/`.

Intro motion was generated using Fal `fal-ai/kling-video/v3/turbo/standard/image-to-video`. Exact prompts, request IDs, endpoint, and source output URLs are recorded in `docs/media-manifest.json`. The listed generation rate was $0.112/second: six 5-second clips, approximately $3.36 before any other charges. MP4 files were transcoded with ffmpeg to H.264/yuv420p, stripped of audio, trimmed to five seconds, and given fast-start metadata. `scripts/prepare-videos.py` recreates the delivered video files from the recorded sources (requires Python `imageio-ffmpeg`).

The characters are rendered images and videos, not interactive 3D meshes. The games are interactive browser components.
