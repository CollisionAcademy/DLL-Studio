/** Stop at the end of the queue rather than looping or selecting a story. */
export function nextPlaylistIndex(
  index: number,
  length: number,
): number | null {
  return index >= 0 && index + 1 < length ? index + 1 : null;
}
