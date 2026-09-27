import test from "node:test";
import assert from "node:assert/strict";
import { validateVideo } from "../src/lib/membership/mp4.ts";
import {
  hasPendingVideos,
  videoStateLabel,
} from "../src/lib/membership/video-status.ts";
function sample(seconds) {
  const bytes = Buffer.alloc(52);
  bytes.writeUInt32BE(16, 0);
  bytes.write("ftyp", 4);
  bytes.writeUInt32BE(36, 16);
  bytes.write("moov", 20);
  bytes.writeUInt32BE(28, 24);
  bytes.write("mvhd", 28);
  bytes.writeUInt32BE(1000, 44);
  bytes.writeUInt32BE(seconds * 1000, 48);
  return bytes;
}
test("delivery accepts matching 10/15 second MP4s and rejects missing or wrong duration", () => {
  assert.equal(validateVideo(sample(10), 10), 10);
  assert.equal(validateVideo(sample(15), 15), 15);
  assert.throws(() => validateVideo(sample(5), 15));
  assert.throws(() => validateVideo(Buffer.from("<html>error</html>"), 15));
  assert.throws(() => validateVideo(sample(15).subarray(0, 30), 15));
});
test("shelf keeps polling active jobs and stops for completed or failed jobs", () => {
  for (const state of ["moderating", "queued", "submitting", "processing"])
    assert.equal(hasPendingVideos([{ state }]), true);
  assert.equal(
    hasPendingVideos([{ state: "ready" }, { state: "failed" }]),
    false,
  );
  assert.equal(videoStateLabel("ready"), "Ready to watch");
});
