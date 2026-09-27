import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { applySubscriptionState } from "../src/lib/membership/billing-store.ts";
test("billing grants only paid periods, preserves period snapshots and deduplicates boxes", async () => {
  const db = await PGlite.create();
  try {
    await db.exec(
      await readFile(
        new URL("../migrations/001_membership.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.query(
      "INSERT INTO dll.households(id,customer_id) VALUES('parent','cus_dll')",
    );
    const start = 1800000000,
      end = start + 2592000;
    const sub = {
      id: "sub_dll",
      customer: "cus_dll",
      metadata: { application: "dll-studios" },
      status: "active",
      cancel_at_period_end: false,
      items: {
        data: [
          {
            price: {
              id: "price_family",
              nickname: "Any renamed Stripe product",
            },
            current_period_start: start,
            current_period_end: end,
          },
        ],
      },
      latest_invoice: {
        status: "paid",
        amount_paid: 2999,
        billing_reason: "subscription_create",
        lines: { data: [{ period: { start, end } }] },
      },
    };
    const resolve = (id) =>
      id === "price_family" ? "family" : id === "price_super" ? "super" : null;
    const apply = (value) =>
      db.transaction((tx) => applySubscriptionState(tx, value, resolve));
    await apply({
      ...sub,
      latest_invoice: { ...sub.latest_invoice, status: "open" },
    });
    assert.equal(
      (await db.query("SELECT count(*) FROM dll.service_periods")).rows[0]
        .count,
      0,
    );
    await apply(sub);
    await apply(sub);
    assert.equal(
      (await db.query("SELECT count(*) FROM dll.service_periods")).rows[0]
        .count,
      1,
    );
    assert.equal(
      (await db.query("SELECT count(*) FROM dll.box_allocations")).rows[0]
        .count,
      1,
    );
    assert.equal(
      (await db.query("SELECT video_limit FROM dll.service_periods")).rows[0]
        .video_limit,
      2,
    );
    await apply({
      ...sub,
      items: { data: [{ ...sub.items.data[0], price: { id: "price_super" } }] },
    });
    assert.equal(
      (await db.query("SELECT plan_key FROM dll.memberships")).rows[0].plan_key,
      "family",
      "entitlements are snapshotted for the paid period",
    );
    await apply({ ...sub, cancel_at_period_end: true });
    assert.equal(
      (await db.query("SELECT status FROM dll.memberships")).rows[0].status,
      "active",
    );
    await apply({ ...sub, status: "canceled" });
    assert.equal(
      (await db.query("SELECT status FROM dll.memberships")).rows[0].status,
      "canceled",
    );
    await apply({
      ...sub,
      items: {
        data: [
          {
            ...sub.items.data[0],
            current_period_start: end,
            current_period_end: end + 2592000,
          },
        ],
      },
    });
    assert.equal(
      (await db.query("SELECT count(*) FROM dll.service_periods")).rows[0]
        .count,
      1,
      "old invoice cannot unlock a new period",
    );
    const renewal = {
      ...sub,
      items: {
        data: [
          {
            ...sub.items.data[0],
            current_period_start: end,
            current_period_end: end + 2592000,
          },
        ],
      },
      latest_invoice: {
        ...sub.latest_invoice,
        billing_reason: "subscription_cycle",
        lines: { data: [{ period: { start: end, end: end + 2592000 } }] },
      },
    };
    await apply(renewal);
    await apply(renewal);
    assert.equal(
      (await db.query("SELECT count(*) FROM dll.box_allocations")).rows[0]
        .count,
      2,
    );
    await apply({
      ...renewal,
      items: {
        data: [{ ...renewal.items.data[0], price: { id: "unrelated_price" } }],
      },
    });
    assert.equal(
      (await db.query("SELECT status FROM dll.memberships")).rows[0].status,
      "unmapped",
    );
  } finally {
    await db.close();
  }
});
