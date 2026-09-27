/** Parse once before Clerk's wrapper, preserving HTTP errors and its retry hint. */
export class AccountRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AccountRequestError";
    this.status = status;
  }
}
export async function requestJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  const result = await response.json();
  // Clerk must receive this hint unchanged to open verification and retry.
  if (response.status === 428 && result?.clerk_error) return result;
  if (!response.ok) {
    throw new AccountRequestError(
      result.error || "Please try again.",
      response.status,
    );
  }
  return result as T;
}
