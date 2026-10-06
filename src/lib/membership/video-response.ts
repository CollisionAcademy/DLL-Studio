export function videoResponse(
  stream: ReadableStream<Uint8Array>,
  source: Headers,
) {
  const headers = new Headers({
    "Content-Type": "video/mp4",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  });
  for (const name of ["Content-Length", "Content-Range"]) {
    const value = source.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(stream, {
    status: headers.has("Content-Range") ? 206 : 200,
    headers,
  });
}
