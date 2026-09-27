# Character badge collections

Members can open `/member/badges` from the clubhouse. Adventure Club, Super Crew,
Family Pass and administrators can earn badges. Any signed-in household can read
its saved collection, trophies and balance, including after a subscription ends.

There are 25 character-themed badges across the established DLL cast. Each badge
requires a server-issued counting challenge. Correct completion grants 10 points;
wrong answers can be retried without penalty. The existing Idea Helper voting
badge remains separate and does not count toward a character collection.

Completing all 25 creates one $10 USD merchandise reward and archives the completed
round. The next round starts empty. Challenges have new IDs and must be completed
again; completed IDs cannot mint extra points or rewards. Lifetime points include
every completed round. Household row locks serialize completion and collection
creation, and a unique household/round constraint prevents duplicate rewards.

Migration `003_badge_rewards.sql` creates collection, challenge and store reward
tables without modifying existing memberships, videos or badge records. Run the
migration before deploying the updated dashboard query.

## Store credit

The parent dashboard shows the sum of remaining reward cents. Credit has no
automatic expiry and supports retaining a partially used balance. It is separate
from video credits and intended only for merchandise, excluding memberships,
video credits, shipping and taxes.

**Merchandise checkout is not open yet.** This release banks earned rewards; it
does not implement or enable merchandise payments or redemption. When checkout
is introduced, it must validate eligible merchandise server-side, allocate credit
atomically against an order, and restore it after confirmed cancellation/refund.
Never use these rewards as Stripe subscription/customer credit. The UI states
that the balance is saved until merchandise checkout opens.

## Verification

`npm test` runs the real PostgreSQL-compatible PGlite collection lifecycle test,
including two full rounds, retries, wrong answers, ownership and preserved
balances. `node scripts/verify-badge-rewards.mjs` verifies the collection UI at
desktop/mobile sizes using mocked responses and issues no real reward credits.
