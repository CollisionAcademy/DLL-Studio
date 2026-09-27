> September 27 update: automated membership videos now use the workflow in [automatic-videos.md](automatic-videos.md). It supersedes the manual-review delivery and unscheduled-worker notes below. Public publishing still requires a separate staff action.

# DLL Studios membership implementation

## Findings and brand review

The existing Next.js/React site had six CGI characters, Fredoka/Nunito typography, captioned intros, public games, and button-only OpenAI chat. It had no authentication, database, Stripe implementation, runtime FAL generation, or member routes. Initially the root environment's Stripe prices concerned another business. During implementation the owner added DLL-specific prices; these were verified read-only against Stripe and mapped using the owner's exact variable names. All three are active, live-mode, monthly USD prices matching $4.99/$12.99/$29.99. No Stripe objects were created or changed. Next reads `website/.env.local`, not the parent directory's `.env`.

The newer calendar reference explicitly establishes Luca, Vienna, Leo, Bianna, Doo Wop Dog, and Gramps, superseding the older proposed cast. Existing characters, assets, fonts, public routes, games, and chat were preserved. The documents were treated as brand/context references; the pasted request defined implementation scope.

## Files and routes

| Area | Main files/routes | What changed |
|---|---|---|
| Marketing | `src/app/membership/page.tsx`, `membership.css` | Four prices, featured Super Crew, WATCH → JOIN → CREATE → BRING IT HOME, parent CTAs, safety and FAQ |
| Entitlements | `src/lib/membership/plans.ts` | Central keys and access policy; limits, discounts, expiry and local birthday dates |
| Accounts | `src/proxy.ts`, `src/lib/membership/access.ts`, `src/components/membership/*`, `/login`, `/signup` | Clerk, parent confirmation and recent credential verification; ownership checks, origin validation, bounded request bodies |
| Data | `migrations/001_membership.sql`, `scripts/migrate.mjs`, `src/lib/membership/db.ts` | Additive `dll` schema: households, subscriptions, paid periods, credit ledger, profiles, videos, content, votes, badges, consent audit, products, orders and boxes |
| Billing | `src/lib/membership/billing*.ts`, `/api/billing/[action]`, `/api/stripe/webhook` | Server Price ID mapping, exact amount/currency/interval validation, duplicate-checkout prevention, signed webhooks, current-state reconciliation |
| Clubhouse | `/member`, `/member/play`, `/member/episodes`, `/member/stories`, `/member/activities`, `/member/vote` | Gated pages, curated character choices and branching stories, tic-tac-toe, rock-paper-scissors, word selection/search, jokes, riddles, hero stories, downloads, voting and badges |
| Parents | `/parent`, `/api/member/[action]` | Birthday month/day, timezone and consent, profile removal, 500-character scripts, credit status, private videos, publishing permission, billing and box states |
| Video | `videos.ts`, `credit-store.ts`, `fal.ts`, `/api/jobs/videos` | Atomic credits, moderation, persisted FAL jobs, polling, daily cap, ambiguous-submit hold and staff review |
| Staff | `/parent/review`, `/api/admin/videos` | Explicit Clerk user allowlist and recent verification; review content and duration before private delivery |
| Media | `/api/member/media/[id]` | Owner/release checks, authenticated streaming, no-store responses and protected download |
| Shop | `/shop`, `src/lib/membership/shop.ts`, product/order schema | Under-$50 catalog concepts, separate ten-item Mega Box, discount helper, shipping and fulfillment hooks |
| Site | shell, layout, privacy, safety, sitemap, robots | Navigation, parent explanations, public discovery and account exclusions |
| Checks | `tests/{membership,credits,billing}.test.mjs`, ESLint config | Entitlements, dates, PostgreSQL migrations, reservation/refund semantics, renewals and boxes |

New member play has no child-facing text field, upload, or microphone. Text fields appear only in parent controls. Existing public chat remains unchanged and continues accepting preset IDs only. Recently verified parent authentication is a session security gate, not an age-verification service.

## Configuration and deployment

The owner authorized pursuing deployment and service activation on September 27, 2026. The linked Vercel project is `dll-studio` in `collision-academy-82dbb1d7`; its domains are `dll-studio.com` and `www.dll-studio.com`. DNS is hosted at Squarespace. Vercel authentication has been restored.

The owner chose email/password on Hobby. Phone/SMS and Google authentication were disabled, and production Clerk instance `ins_3JurfcIuYSti6E1xxYUQVvUsGfG` was created successfully without a paid upgrade. Production DNS/SSL/mail verification is pending five Squarespace CNAME records listed in `docs/clerk-production-dns.md`.

`scripts/configure-preview.mjs` configures only the existing project's preview environment, with development Clerk credentials, the DLL database connection, checkout disabled, and new video dispatch paused. The owner explicitly approved credential transfer; the script completed and the Vercel preview deployed successfully. Local login/signup, database schema, automated checks, and browser checks passed.

## Administrator accounts

The owner authorized `vinny@dll-studio.com` and `diana@dll-studio.com` for administrator access. Both existing development accounts have verified primary emails. The server checks fresh Clerk user data against the exact case-insensitive primary-email allowlist in `admin-policy.ts`; unverified, secondary, lookalike, and other emails receive no privilege. Administrators get all Family entitlements, the staff review queue, and custom-video submissions without subscription or monthly credit limits. Submissions remain idempotent, audited, moderated and subject to the global provider dispatch setting. Authentication/reverification, content review, consent and ownership checks remain enforced. Administrators are not charged through membership checkout or assigned fictitious paid subscriptions/physical shipments. Production accounts must independently register and verify the same addresses.

No Stripe test secret key is configured. Live charges are not needed to validate login and were not created. Live billing requires a verified production Clerk instance, deployed webhook endpoint and its own signing secret before enabling checkout. Video dispatch needs provider configuration and a staff reviewer; no paid FAL smoke test has been submitted.

1. Run `npm ci` on a maintained Node runtime. Validation used Node 24; direct TypeScript tests need Node 22.18+.
2. Configure a DLL-scoped Clerk app and PostgreSQL connection in `website/.env.local`. Use database TLS and a restricted role. Do not copy the unrelated root environment wholesale.
3. Review `migrations/001_membership.sql`, then run `npm run db:migrate` against the intended DLL database. The runner uses a transaction and advisory lock, creates only the `dll` schema, and does not drop existing objects. It is repeatable. On September 27, 2026, the requested migration was applied to the configured Neon database: 15 tables in `dll`; existing `public` and `neon_auth` schemas were preserved.
4. These monthly USD Stripe **Price IDs** were supplied and verified; no additional membership IDs or product IDs are currently needed:

| Environment variable | Price |
|---|---|
| `STRIPE_DLL_ADVENTURE_CLUB_PRICE_ID` | $4.99/month |
| `STRIPE_DLL_SUPER_CREW_PRICE_ID` | $12.99/month |
| `STRIPE_DLL_FAMILY_PRICE_ID` | $29.99/month |

The added `STRIPE_DLL_CREW_PRICE_ID` is intentionally unused: free public access does not require a subscription. `node scripts/sync-membership-prices.mjs` copies only the three paid price mappings and Stripe secret from the root into ignored `website/.env.local`, preserving other settings. It was run during implementation. Re-run after changing the root prices. `node scripts/check-membership-prices.mjs --root-env` performs a read-only check without printing credentials or creating subscriptions. Do not use these live-mode IDs for charge-creating tests; use test-mode equivalents in a test environment.

5. Register `/api/stripe/webhook` for `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`. Configure this endpoint's own `STRIPE_WEBHOOK_SECRET`. Start in test mode.
6. Configure Stripe's portal for payment methods, invoices, and period-end cancellation. Leave immediate tier changes, arbitrary prices, trials and promotion codes disabled. This implementation snapshots entitlements per paid period; operator-managed plan changes should take effect at renewal. A dedicated plan-change scheduler is a later extension.
7. Configure FAL/OpenAI keys, `APP_BASE_URL` for the public DLL character images, a strong random `DLL_JOB_SECRET`, and staff Clerk IDs in `DLL_ADMIN_USER_IDS`.
8. Have your worker periodically POST `/api/jobs/videos` with `Authorization: Bearer <DLL_JOB_SECRET>`. Each call advances one job; roughly 30-second intervals suit an initial small queue. The endpoint is implemented; no external schedule was installed. Birthday occurrences are created at the first authenticated visit on/after the saved local date.
9. Supply approved episode inventory and staff review operations. Verify billing and live generation in a test environment before enabling `DLL_CHECKOUT_ENABLED=true`. Keep it false until advertised features and Family fulfillment are ready.

### Environment changes

Existing credential names consumed: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, optional `DIRECT_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FAL_KEY`, `OPENAI_API_KEY`, optional `OPENAI_MODEL`, and `APP_BASE_URL` (defaults to the existing public DLL domain for reference images).

New settings beyond the supplied Price IDs: `DLL_JOB_SECRET` for queue authorization; `DLL_ADMIN_USER_IDS` for review access; and `DLL_CHECKOUT_ENABLED` for explicit activation. Optional `DLL_VIDEO_DAILY_LIMIT` defaults to 10 new FAL submissions per rolling day, accepts 0 to pause, and caps at 100. This bounds generation count, not dollar cost; configure provider spending limits separately. The requested database connection was copied into ignored `.env.local`. Clerk CLI linked application `app_3JupW6zAo8bKGGZ7EGvKTTYbkKD` and pulled its development keys. FAL settings were not copied, and the root webhook secret was not assumed to belong to this new website endpoint.

No model environment variable is needed: the existing FAL model lives behind `fal.ts`, independently of Stripe. `.env.membership.example` contains empty values/names only. When configured, the root Clerk provider supports Parent login/Create account navigation and the signed-in account menu. Public routes remain accessible without authentication. Clerk manages identities; Neon stores application data keyed to the authenticated Clerk user ID. Household records are created on the first authenticated account API request. `/login` and `/signup` render independently of database availability. Clerk skills were installed locally using `npx skills add clerk/skills --yes --agent codex`.

## Billing and credits

Only a paid subscription-creation or recurring invoice matching the current subscription service period creates an entitlement period. Trialing, unpaid, paused, canceled and unknown-price memberships have no paid access. Failed renewals create no credits; any already-paid access ends at its original paid-through date. Period-end cancellation preserves access until then.

Super grants one credit; Family grants two total. Reservations lock household and period rows. The ledger records reserve `+1`, consume `0`, release `-1`. Available credits equal the original limit minus the ledger sum. Consumption does not decrement twice; releases are idempotent and return only to the original period. Credits do not roll over. Periods, billing events, birthday occurrences and box allocations have unique constraints.

Product display names do not affect access. Duplicate mappings fail closed. Webhooks serialize by subscription and retrieve current Stripe state, preventing stale delivery from rolling access back. Paid entitlements are snapshotted. Actual Stripe signatures/network flows still require test-mode verification with the owner's DLL configuration.

## Video operations

Custom jobs follow `moderating → queued → submitting → processing → review → ready`. OpenAI moderation plus a second fiction/age-appropriateness check must pass before FAL. Generic birthday scripts start queued. The adapter reuses `fal-ai/kling-video/v3/turbo/standard/image-to-video`, existing reference art, and 15/10-second targets. No child name or birthday is sent to FAL. Audio/dialogue are not promised; staff inspect the whole output.

Ambiguous submit timeouts become `uncertain`, never automatic regeneration. Reconcile with FAL history before release/retry. Lost polling workers resume the stored provider ID. Confirmed failure/rejection releases a custom credit once. Staff review checks character identity, gentle content, quality and actual duration within one second of the target before delivery. The staff API can reject a reconciled uncertain job; use it only after checking provider state.

Members receive authenticated media streams, not provider URLs. Videos start private. Parent publishing permission can be granted/revoked and audited; it never automatically publishes. There is no public publishing endpoint.

Profile removal deletes the stored birthday and disables its greeting in DLL. It cannot promise cancellation/deletion of an already-running third-party generation. Durable private asset storage, provider deletion, account export/deletion and automated retention remain operational integrations before broad launch.

## Intentionally deferred integrations

- Physical inventory, address collection, shipping rates, packing/tracking, tax and returns. Family gets a five-item allocation per paid period. Mega Box is a separate ten-item purchase concept; no final price/shipping cost is invented.
- Merchandise checkout and actual discount redemption. Catalog, discount helper and product/order tables are foundations; preview products cannot charge anyone.
- Editorial upload/admin tooling and real members-only episode inventory. A sample story and download work; episode shelves have honest empty states. Content supports first/early/member release dates.
- External worker schedule, provider smoke tests, ambiguous-job reconciliation tooling, durable storage and retention operations.
- Public publishing after both staff approval and parent permission.
- Automatic tier-change scheduling; payment maintenance and cancellation are supported through the portal.

## Four-tier manual test checklist

Use separate test households and Stripe test subscriptions. Test access through APIs, not browser tier overrides.

| Tier | Checklist |
|---|---|
| Crew | Anonymous home, six intros, public games and preset chat work. Paid routes/media/download APIs deny access. No credit, birthday profile, discount or box. Parent signup works when configured. |
| Adventure | $4.99 paid webhook unlocks content. Test all characters, choices, stories, games, download and poll. Vote persists; repeated votes don't add points. Parent verification required for birthday settings. No pre-birthday job; one 10-second greeting on/after the local date, after review. Custom video stays locked. |
| Super | $12.99 paid period grants one credit, 10% entitlement and early release. Safe script ≤500 succeeds; empty/long/invalid character requests fail. Same request retry spends once; two distinct concurrent submissions allow only one. Rejection/failure refunds once to the original period. Paid renewal grants one new credit. |
| Family | $29.99 paid period grants two credits total, 15% entitlement, first release, and one five-item allocation. Third concurrent request fails. Duplicate webhooks don't duplicate boxes/credits. Next paid renewal adds one allocation. Mega Box remains clearly separate, with separate shipping. |

Cross-tier checks:

1. Rename a Stripe product: access unchanged. Unknown/duplicate Price ID fails closed. Wrong amount/currency/interval blocks checkout. Exercise failed renewal, expiration, immediate cancellation, period-end cancellation and successful renewal.
2. Repeat and reorder webhook events. Verify one grant per service period and one box allocation. An old invoice cannot unlock the next period.
3. Sign out and directly request member content/downloads/media. Try another household's video ID. Send a foreign Origin mutation. Use a non-staff account to open the review queue. All must be denied.
4. Let parent reverification expire, then change birthday, submit a script, open billing or change publishing permission. Verify Clerk requests credentials; canceling must not mutate data.
5. Test invalid dates, February 29 and local midnight. Repeated visits/settings changes do not add yearly greetings. Delete the profile while processing; its greeting must not become available again.
6. Publishing permission starts off; grant/revoke with audit. Neither publishes publicly. Unreviewed media is never accessible to members.
7. Disconnect database/moderation/FAL configuration: public pages work and paid operations show errors. Failed moderation never dispatches. A submit timeout does not regenerate. Daily cap 0 stops new dispatch but permits existing polling.
8. Check 390px navigation, keyboard focus, labels, live feedback, no horizontal overflow and no text/upload/microphone control in child play.

## Validation

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. PostgreSQL tests use isolated in-memory PGlite and do not touch a real database or paid generation. PGlite serializes transactions; also run real multi-connection concurrency checks before launch.

`node scripts/verify-membership.mjs` checks desktop/mobile pricing, navigation states, and denied anonymous API access against `TEST_URL` (default port 3100). The existing `scripts/verify-site.mjs` checks all six public games and intros. It still requires a live AI reply by default. Explicit `ALLOW_STORYBOOK_CHAT=1` permits the labeled storybook fallback for offline/provider-unavailable regression testing; such a pass does not verify OpenAI availability. Development chat origins now support the local test server's alternate port; production origin restrictions are unchanged.

Implementation verification: lint, typecheck, 13 automated tests, and production build passed. Membership browser checks passed at 1440px and 390px with no page errors. Clerk doctor confirms the linked development application; Chrome rendered the login and signup forms. The database connection and 15 DLL tables were verified. Completing a real parent signup remains a user action. The full public regression previously passed for six intros/games, navigation, privacy pages, invalid chat payloads and mobile layout in explicit storybook-fallback mode. The default live-OpenAI assertion returned `storybook`, so live provider generation was not verified. Preview deployment completed. No live subscription or FAL generation was performed; production promotion is pending DNS.

References: [Next.js handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), [Clerk reverification](https://clerk.com/docs/guides/secure/reverification), [Stripe subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks), [FAL model API](https://fal.ai/models/fal-ai/kling-video/v3/turbo/standard/image-to-video/api), [PGlite](https://pglite.dev/docs/api). Preview deployment completed; production promotion is pending DNS.


## Login recovery update

Clerk application renamed to DLL Studio. Development and production password minimums are now 8 characters at the owner's request; compromised-password checks and lockout protection remain enabled. Vinny's failed-attempt lockout was explicitly cleared. Login/signup now use hash routing so recovery steps remain inside the mounted authentication form. Branded pages use DLL characters, typography and colors. Browser verification reached the Forgot Password screen and confirmed the email-code option without submitting a password or changing an account credential. Lint, typecheck and build passed.

