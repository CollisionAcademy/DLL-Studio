"use client";
import Image from "next/image";
import Link from "next/link";
import { SignIn, useUser } from "@clerk/nextjs";

export function SiteAuth() {
  const { isLoaded, isSignedIn } = useUser();
  return (
    <main id="main" className="page-wrap dll-auth-page">
      <section className="dll-auth-welcome">
        <span className="eyebrow">YOUR DLL STUDIO ACCOUNT</span>
        <h1>Welcome to the crew.</h1>
        <p>
          One parent account for your family’s stories, games, and little
          adventures.
        </p>
        <div className="dll-auth-characters" aria-hidden="true">
          <Image src="/characters/luca.png" alt="" width={230} height={230} />
          <Image src="/characters/vienna.png" alt="" width={230} height={230} />
        </div>
        <Link href="/play">Just here to play? Visit the free playroom →</Link>
      </section>
      <section
        className="dll-auth-form"
        aria-label={"DLL Studio sign-in and registration"}
      >
        {isLoaded && isSignedIn ? (
          <div className="member-panel">
            <h2>You’re signed in.</h2>
            <Link className="button button-blue" href="/parent">
              Open my DLL account
            </Link>
          </div>
        ) : (
          <SignIn routing="hash" withSignUp />
        )}
        <p className="dll-auth-help">
          Enter your email to sign in or create an account. New here? We’ll
          guide you through registration right here.
        </p>
        <p className="dll-auth-help">
          One account for membership and parent settings. Accounts are for
          parents and guardians; children can explore with you.
        </p>
      </section>
    </main>
  );
}
