import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { reserveVideoTransaction } from "../src/lib/membership/credit-store.ts";
test("real PostgreSQL migration and credit lifecycle in an isolated database", async () => {
  const db = await PGlite.create();
  try {
    const sql = await readFile(
      new URL("../migrations/001_membership.sql", import.meta.url),
      "utf8",
    );
    await db.exec(
      "CREATE TABLE public.existing_data(value text); INSERT INTO public.existing_data VALUES('preserve me');",
    );
    await db.exec(sql);
    await db.exec(sql);
    assert.equal(
      (await db.query("SELECT value FROM public.existing_data")).rows[0].value,
      "preserve me",
    );
    for (const [id, plan, limit] of [
      ["one", "super", 1],
      ["two", "family", 2],
      ["free", "crew", 0],
    ]) {
      await db.query("INSERT INTO dll.households(id) VALUES($1)", [id]);
      await db.query(
        "INSERT INTO dll.memberships VALUES($1,$2,$3,'active',now()-interval '1 day',now()+interval '29 days',false,now())",
        [id, "sub_" + id, plan],
      );
      await db.query(
        "INSERT INTO dll.service_periods VALUES($1,$2,$3,now()-interval '1 day',now()+interval '29 days',$4,$5)",
        ["period_" + id, id, "sub_" + id, plan, limit],
      );
    }
    const submit = (household, key = randomUUID()) =>
      db.transaction((tx) =>
        reserveVideoTransaction(tx, household, {
          requestKey: key,
          script: "Leo builds a wobbly tower.",
          character: "leo",
        }),
      );
    const key = randomUUID();
    const id = await submit("one", key);
    assert.equal(
      await submit("one", key),
      id,
      "retry returns original request without spending twice",
    );
    await assert.rejects(
      db.transaction((tx) =>
        reserveVideoTransaction(tx, "one", {
          requestKey: key,
          script: "A changed story",
          character: "leo",
        }),
      ),
      /different story/,
    );
    await assert.rejects(submit("one"), /credits are in use/);
    await assert.rejects(submit("free"), /Upgrade/);
    await db.query("INSERT INTO dll.households(id) VALUES('admin')");
    const adminInput = {
      requestKey: randomUUID(),
      script: "Leo waves hello.",
      character: "leo",
    };
    const adminSubmit = (input) =>
      db.transaction((tx) => reserveVideoTransaction(tx, "admin", input, true));
    const adminId = await adminSubmit(adminInput);
    assert.equal(await adminSubmit(adminInput), adminId);
    for (let i = 0; i < 9; i++)
      await adminSubmit({ ...adminInput, requestKey: randomUUID() });
    assert.equal(
      (
        await db.query(
          "SELECT count(*)::int AS n FROM dll.video_requests WHERE household_id='admin' AND period_id IS NULL",
        )
      ).rows[0].n,
      10,
    );
    assert.equal(
      (
        await db.query(
          "SELECT count(*)::int AS n FROM dll.audit WHERE actor='admin' AND action='admin-video-request'",
        )
      ).rows[0].n,
      10,
    );
    await assert.rejects(submit("admin"), /Upgrade/);
    const attempts = await Promise.allSettled([
      submit("two"),
      submit("two"),
      submit("two"),
    ]);
    assert.equal(attempts.filter((r) => r.status === "fulfilled").length, 2);
    await db.query(
      "INSERT INTO dll.credit_ledger(period_id,request_id,action,quantity) VALUES('period_one',$1,'consume',0)",
      [id],
    );
    await assert.rejects(
      submit("one"),
      /credits are in use/,
      "consuming does not decrement availability twice",
    );
    await db.query(
      "INSERT INTO dll.credit_ledger(period_id,request_id,action,quantity) VALUES('period_one',$1,'release',-1) ON CONFLICT DO NOTHING",
      [id],
    );
    await db.query(
      "INSERT INTO dll.credit_ledger(period_id,request_id,action,quantity) VALUES('period_one',$1,'release',-1) ON CONFLICT DO NOTHING",
      [id],
    );
    await submit("one");
    await assert.rejects(
      submit("one"),
      /credits are in use/,
      "duplicate refunds cannot create credits",
    );
    await db.query(
      "UPDATE dll.memberships SET period_end=now()-interval '1 second' WHERE household_id='two'",
    );
    await assert.rejects(submit("two"), /Upgrade/);
    const birthday = () =>
      db.query(
        "INSERT INTO dll.video_requests(id,household_id,kind,occurrence_year,request_key,script,character_id,duration_seconds) VALUES($1,'one','birthday',2026,$2,'A birthday wave','leo',10) ON CONFLICT DO NOTHING",
        [randomUUID(), randomUUID()],
      );
    await birthday();
    await birthday();
    assert.equal(
      (
        await db.query(
          "SELECT count(*) FROM dll.video_requests WHERE kind='birthday'",
        )
      ).rows[0].count,
      1,
    );
    await assert.rejects(
      db.query(
        "INSERT INTO dll.products(id,name,category,amount_cents) VALUES('bad','Bad price','individual',5000)",
      ),
      /check constraint/,
    );
  } finally {
    await db.close();
  }
});
