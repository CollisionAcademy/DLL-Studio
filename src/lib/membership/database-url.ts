/** Preserve pg's current certificate AND hostname verification explicitly. */
export function databaseUrl(value: string): string {
  const url = new URL(value);
  if (
    url.searchParams.get("uselibpqcompat") !== "true" &&
    ["prefer", "require", "verify-ca"].includes(
      url.searchParams.get("sslmode") || "",
    )
  ) {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}
