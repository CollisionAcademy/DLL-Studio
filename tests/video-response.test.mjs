import test from "node:test";
import assert from "node:assert/strict";
import { videoResponse } from "../src/lib/membership/video-response.ts";

test("video streams preserve byte ranges for seeking without exposing storage headers", async () => {
  const stream = () =>
    new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.close();
      },
    });
  const source = new Headers({
    "Content-Length": "3",
    "Content-Range": "bytes 10-12/100",
    Location: "https://private.example/video",
    Authorization: "secret",
  });
  const partial = videoResponse(stream(), source);
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get("Content-Range"), "bytes 10-12/100");
  assert.equal(partial.headers.get("Content-Length"), "3");
  assert.equal(partial.headers.get("Accept-Ranges"), "bytes");
  assert.equal(partial.headers.get("Location"), null);
  assert.equal(partial.headers.get("Authorization"), null);
  assert.equal(partial.headers.get("Cache-Control"), "private, no-store");
  assert.deepEqual([...new Uint8Array(await partial.arrayBuffer())], [1, 2, 3]);
  const full = videoResponse(stream(), new Headers({ "Content-Length": "3" }));
  assert.equal(full.status, 200);
  assert.equal(full.headers.get("Content-Range"), null);
});
