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
test("Clerk's actual 403 reverification response survives for prompt and retry", async (t) => {
  const { reverificationErrorResponse } =
    await import("../node_modules/@clerk/shared/dist/authorization-errors.js");
  const response = reverificationErrorResponse("strict");
  assert.equal(response.status, 403);
  const expected = await response.clone().json();
  t.mock.method(globalThis, "fetch", async () => response);
  assert.deepEqual(await requestJson("/api/member/video"), expected);
});
test("unrelated Clerk errors still fail instead of being treated as success", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json(
      { clerk_error: { type: "forbidden", reason: "other" } },
      { status: 403 },
    ),
  );
  await assert.rejects(
    requestJson("/api/member/video"),
    (e) => e instanceof AccountRequestError && e.status === 403,
  );
});
