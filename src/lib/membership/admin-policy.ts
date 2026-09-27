// Only server-verified Clerk identity data may be passed to this policy.
const administratorEmails = new Set([
  "vinny@dll-studio.com",
  "diana@dll-studio.com",
]);
export function isAdministratorIdentity(user: {
  primaryEmailAddressId: string | null;
  emailAddresses: {
    id: string;
    emailAddress: string;
    verification: { status: string } | null;
  }[];
}) {
  return user.emailAddresses.some(
    (email) =>
      email.id === user.primaryEmailAddressId &&
      email.verification?.status === "verified" &&
      administratorEmails.has(email.emailAddress.trim().toLowerCase()),
  );
}
