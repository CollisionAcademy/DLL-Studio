export type Square = "X" | "O" | null;
export const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
export function boardResult(board: Square[]): Square | "draw" {
  for (const [a, b, c] of winningLines)
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];
  return board.every(Boolean) ? "draw" : null;
}
export function characterMove(board: Square[]): number | null {
  if (boardResult(board)) return null;
  const empty = board.map((s, i) => (s ? -1 : i)).filter((i) => i >= 0);
  for (const symbol of ["O", "X"] as const) {
    for (const i of empty) {
      const next = [...board];
      next[i] = symbol;
      if (boardResult(next) === symbol) return i;
    }
  }
  return [4, 0, 2, 6, 8, 1, 3, 5, 7].find((i) => !board[i]) ?? null;
}
