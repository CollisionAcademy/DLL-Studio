"use client";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
export function AccountNav({ onNavigate }: { onNavigate: () => void }) {
  const { isLoaded, isSignedIn } = useUser();
  if (isLoaded && isSignedIn)
    return (
      <div className="account-nav">
        <Link href="/parent" onClick={onNavigate}>
          My account
        </Link>
        <UserButton />
      </div>
    );
  return (
    <div className="account-nav">
      <Link href="/login" onClick={onNavigate}>
        Parent login
      </Link>
      <Link href="/signup" className="account-signup" onClick={onNavigate}>
        Create account
      </Link>
    </div>
  );
}
