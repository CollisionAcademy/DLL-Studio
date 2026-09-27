import test from "node:test";
import assert from "node:assert/strict";
import {
  requestJson,
  AccountRequestError,
} from "../src/lib/membership/request.ts";

test("account requests return parsed data for Clerk without a second json call", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ message: "Saved" }),
  );
  assert.deepEqual(await requestJson("/api/member/profile"), {
    message: "Saved",
  });
});
test("account requests preserve authentication and service errors", async (t) => {
  for (const status of [401, 403, 503]) {
    const mock = t.mock.method(globalThis, "fetch", async () =>
      Response.json({ error: "Unavailable" }, { status }),
    );
    await assert.rejects(
      requestJson("/api/member/parent"),
      (e) =>
        e instanceof AccountRequestError &&
        e.status === status &&
        e.message === "Unavailable",
    );
    mock.mock.restore();
  }
});
test("reverification hints survive so Clerk can prompt and retry protected actions", async (t) => {
  const hint = {
    clerk_error: {
      type: "forbidden",
      reason: "session_reverification_required",
      metadata: { reverification: "strict" },
    },
  };
  t.mock.method(globalThis, "fetch", async () =>
    Response.json(hint, { status: 428 }),
  );
  assert.deepEqual(await requestJson("/api/member/profile"), hint);
});
