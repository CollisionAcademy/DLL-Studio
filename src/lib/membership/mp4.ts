export class InvalidVideoError extends Error {}
/** Read the ISO BMFF movie header without decoding media or executing a tool. */
export function mp4Duration(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const type = (offset: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + 4));
  function scan(start: number, end: number): number | undefined {
    for (let pos = start; pos + 8 <= end;) {
      let size = view.getUint32(pos);
      let header = 8;
      if (size === 1) {
        if (pos + 16 > end) break;
        size = Number(view.getBigUint64(pos + 8));
        header = 16;
      } else if (size === 0) size = end - pos;
      if (size < header || pos + size > end) break;
      const kind = type(pos + 4);
      const body = pos + header;
      if (kind === "moov") {
        const found = scan(body, pos + size);
        if (found !== undefined) return found;
      }
      if (kind === "mvhd") {
        const version = bytes[body];
        const offset = version === 1 ? 20 : 12;
        if (body + offset + (version === 1 ? 12 : 8) > pos + size) break;
        const scale = view.getUint32(body + offset);
        const duration =
          version === 1
            ? Number(view.getBigUint64(body + offset + 4))
            : view.getUint32(body + offset + 4);
        if (scale > 0) return duration / scale;
      }
      pos += size;
    }
  }
  if (bytes.length < 16 || type(4) !== "ftyp")
    throw new InvalidVideoError("Not an MP4 video");
  const duration = scan(0, bytes.length);
  if (!duration || !Number.isFinite(duration))
    throw new InvalidVideoError("Missing video duration");
  return duration;
}
export function validateVideo(bytes: Uint8Array, target: number) {
  const duration = mp4Duration(bytes);
  if (![10, 15].includes(target) || Math.abs(duration - target) > 0.5)
    throw new InvalidVideoError("Video duration does not match the request");
  return duration;
}
