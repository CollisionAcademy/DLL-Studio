import test from "node:test";
import assert from "node:assert/strict";
import {
  plans,
  planKeys,
  hasEntitlement,
  effectivePlan,
  birthdayOccurrence,
  isPlan,
} from "../src/lib/membership/plans.ts";
import { products, discountedCents } from "../src/lib/membership/shop.ts";
test("four plans retain the requested prices and bounded monthly credits", () => {
  assert.deepEqual(
    planKeys.map((k) => plans[k].cents),
    [0, 499, 1299, 2999],
  );
  assert.deepEqual(
    planKeys.map((k) => plans[k].entitlements.custom_video_monthly_limit),
    [0, 0, 1, 2],
  );
  assert.deepEqual(
    planKeys.map((k) => plans[k].entitlements.shop_discount_percent),
    [0, 0, 10, 15],
  );
  assert.equal(hasEntitlement("crew", "member_content"), false);
  for (const key of ["adventure", "super", "family"])
    for (const feature of [
      "member_content",
      "character_play",
      "birthday_video",
      "activities",
      "voting",
      "story_vault",
    ])
      assert.equal(hasEntitlement(key, feature), true);
  assert.equal(hasEntitlement("adventure", "custom_video"), false);
  assert.equal(hasEntitlement("super", "gift_box"), false);
  assert.equal(hasEntitlement("family", "gift_box"), true);
});
test("expired, unknown, unpaid and cancelled subscriptions fail closed", () => {
  const now = new Date("2026-09-27T12:00:00Z");
  const membership = {
    plan_key: "super",
    status: "active",
    period_end: "2026-10-01T00:00:00Z",
  };
  assert.equal(effectivePlan(membership, now), "super");
  assert.equal(
    effectivePlan({ ...membership, status: "past_due" }, now),
    "super",
  );
  for (const status of [
    "incomplete",
    "unpaid",
    "canceled",
    "trialing",
    "paused",
    "unmapped",
  ])
    assert.equal(effectivePlan({ ...membership, status }, now), "crew");
  assert.equal(effectivePlan({ ...membership, period_end: now }, now), "crew");
  assert.equal(
    effectivePlan({ ...membership, plan_key: "Stripe Super Product" }, now),
    "crew",
  );
  assert.equal(effectivePlan(undefined, now), "crew");
  assert.equal(isPlan("__proto__"), false);
});
test("birthday release respects household local date, leap days and next visit", () => {
  assert.equal(
    birthdayOccurrence(
      9,
      27,
      "America/New_York",
      new Date("2026-09-27T03:59:00Z"),
    ),
    null,
  );
  assert.equal(
    birthdayOccurrence(
      9,
      27,
      "America/New_York",
      new Date("2026-09-27T04:00:00Z"),
    ),
    2026,
  );
  assert.equal(
    birthdayOccurrence(
      9,
      27,
      "America/New_York",
      new Date("2026-10-03T12:00:00Z"),
    ),
    2026,
  );
  assert.equal(
    birthdayOccurrence(2, 29, "UTC", new Date("2027-02-28T12:00:00Z")),
    2027,
  );
  assert.equal(
    birthdayOccurrence(2, 29, "UTC", new Date("2028-02-28T12:00:00Z")),
    null,
  );
});
test("individual catalog items are strictly under $50 and discounts round to cents", () => {
  for (const p of products) assert.ok(p.cents > 0 && p.cents < 5000);
  assert.equal(discountedCents(1499, 10), 1349);
  assert.equal(discountedCents(1499, 15), 1274);
});
