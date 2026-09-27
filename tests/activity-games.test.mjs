import test from "node:test";
import assert from "node:assert/strict";
import { boardResult, characterMove } from "../src/lib/activity-games.ts";
test("tic-tac-toe detects wins and draws and never overwrites a square or plays after a result", () => {
  assert.equal(boardResult(["X","X","X",null,null,null,null,null,null]), "X");
  assert.equal(boardResult(["X","O","X","X","O","O","O","X","X"]), "draw");
  const visit = board => {
    if (boardResult(board)) { assert.equal(characterMove(board), null); return; }
    for (let i=0;i<9;i++) {
      if (board[i]) continue;
      const next = [...board]; next[i] = "X";
      const before = [...next]; const move = characterMove(next);
      assert.deepEqual(next, before, "computer selection must not mutate the board");
      if (boardResult(next)) { assert.equal(move, null); continue; }
      assert.equal(next[move], null); next[move] = "O"; visit(next);
    }
  };
  visit(Array(9).fill(null));
});
