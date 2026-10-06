import test from "node:test";
import assert from "node:assert/strict";
import { selectShelfItems } from "../src/lib/membership/content-shelf.ts";

test("the story vault includes episodes and stories without mixing in activities", () => {
  const items = [
    { id: "movie", kind: "episode", title: "Cookie Heist", body: null },
    { id: "tale", kind: "story", title: "A wobbly flag", body: "Once…" },
    { id: "sheet", kind: "activity", title: "Draw", body: null },
    { id: "short", kind: "episode", title: "Football", body: null },
  ];
  assert.deepEqual(
    selectShelfItems(items, "vault").map((i) => i.id),
    ["movie", "tale", "short"],
  );
  assert.deepEqual(
    selectShelfItems(items, "episode").map((i) => i.id),
    ["movie", "short"],
  );
  assert.deepEqual(
    selectShelfItems(items, "story").map((i) => i.id),
    ["tale"],
  );
  assert.deepEqual(selectShelfItems([], "vault"), []);
});
