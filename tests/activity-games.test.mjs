import test from "node:test";
import assert from "node:assert/strict";
import { boardResult, characterMove } from "../src/lib/activity-games.ts";
test("tic-tac-toe detects wins and draws and never overwrites a square or plays after a result", () => {
  assert.equal(
    boardResult(["X", "X", "X", null, null, null, null, null, null]),
    "X",
  );
  assert.equal(
    boardResult(["X", "O", "X", "X", "O", "O", "O", "X", "X"]),
    "draw",
  );
  const visit = (board) => {
    if (boardResult(board)) {
      assert.equal(characterMove(board), null);
      return;
    }
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      const next = [...board];
      next[i] = "X";
      const before = [...next];
      const move = characterMove(next);
      assert.deepEqual(
        next,
        before,
        "computer selection must not mutate the board",
      );
      if (boardResult(next)) {
        assert.equal(move, null);
        continue;
      }
      assert.equal(next[move], null);
      next[move] = "O";
      visit(next);
    }
  };
  visit(Array(9).fill(null));
});
import { matchingDeck, shuffle } from "../src/lib/activity-games.ts";
test("matching decks are solvable at every difficulty and do not reuse a fixed layout", () => {
  for (const count of [3, 4, 6]) {
    const layouts = new Set();
    for (let seed = 1; seed <= 30; seed++) {
      let state = seed;
      const random = () =>
        (state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32;
      const deck = matchingDeck(count, random);
      assert.equal(deck.length, count * 2);
      assert.equal(new Set(deck).size, count);
      for (const picture of new Set(deck))
        assert.equal(deck.filter((c) => c === picture).length, 2);
      layouts.add(deck.join(""));
    }
    assert.ok(layouts.size > 20);
  }
  const original = [1, 2, 3, 4];
  assert.deepEqual(
    shuffle(original, () => 0),
    [2, 3, 4, 1],
  );
  assert.deepEqual(original, [1, 2, 3, 4]);
});
