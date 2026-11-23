"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export function AccountNav({ onNavigate }: { onNavigate: () => void }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded || !isSignedIn) return null;
  return (
    <div className="account-nav">
      <Link href="/parent" onClick={onNavigate}>
        Parent account
      </Link>
      <UserButton />
    </div>
  );
}
