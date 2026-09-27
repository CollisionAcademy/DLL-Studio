import test from "node:test";
import assert from "node:assert/strict";
import { isAdministratorIdentity } from "../src/lib/membership/admin-policy.ts";
test("administrator access requires an exact verified primary Clerk email", () => {
  const identity = (
    emailAddress,
    status = "verified",
    primary = "primary",
  ) => ({
    primaryEmailAddressId: primary,
    emailAddresses: [{ id: "primary", emailAddress, verification: { status } }],
  });
  assert.equal(isAdministratorIdentity(identity("Vinny@dll-studio.com")), true);
  assert.equal(isAdministratorIdentity(identity("diana@dll-studio.com")), true);
  assert.equal(
    isAdministratorIdentity(identity("vinny@dll-studio.com", "unverified")),
    false,
  );
  assert.equal(
    isAdministratorIdentity(
      identity("vinny@dll-studio.com", "verified", "other"),
    ),
    false,
  );
  assert.equal(
    isAdministratorIdentity(identity("vinny+guest@dll-studio.com")),
    false,
  );
  assert.equal(
    isAdministratorIdentity(identity("vinny@dll-studio.com.attacker.example")),
    false,
  );
  assert.equal(
    isAdministratorIdentity(identity("other@dll-studio.com")),
    false,
  );
});
