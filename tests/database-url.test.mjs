import test from "node:test";
import assert from "node:assert/strict";
import { databaseUrl } from "../src/lib/membership/database-url.ts";
test("legacy pg SSL aliases explicitly preserve full certificate verification", () => {
  for (const mode of ["prefer", "require", "verify-ca"]) {
    const url = new URL(
      databaseUrl(
        `postgresql://user:pass@example.test/db?sslmode=${mode}&channel_binding=require`,
      ),
    );
    assert.equal(url.searchParams.get("sslmode"), "verify-full");
    assert.equal(url.searchParams.get("channel_binding"), "require");
    assert.equal(url.password, "pass");
  }
});
test("explicit connection choices remain unchanged", () => {
  for (const query of [
    "sslmode=verify-full",
    "sslmode=disable",
    "sslmode=require&uselibpqcompat=true",
    "",
  ]) {
    const input = `postgresql://user:pass@example.test/db${query ? "?" + query : ""}`;
    assert.equal(databaseUrl(input), input);
  }
});
