"use client";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
export function AccountNav({ onNavigate }: { onNavigate: () => void }) {
  const { isLoaded, isSignedIn } = useUser();
  if (isLoaded && isSignedIn)
    return (
      <div className="account-nav">
        <Link href="/parent" onClick={onNavigate}>
          Grown Up Fun
        </Link>
        <UserButton />
      </div>
    );
  return (
    <div className="account-nav">
      <Link href="/login" onClick={onNavigate}>
        Member login
      </Link>
    </div>
  );
}
