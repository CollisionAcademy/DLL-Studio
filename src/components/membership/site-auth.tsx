"use client";
import Image from "next/image";
import Link from "next/link";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";

export function SiteAuth({ signup = false }: { signup?: boolean }) {
  const { isLoaded, isSignedIn } = useUser();
  return (
    <main id="main" className="page-wrap dll-auth-page">
      <section className="dll-auth-welcome">
        <span className="eyebrow">YOUR DLL STUDIO ACCOUNT</span>
        <h1>
          {signup ? "A home for your crew." : "Welcome back to the crew."}
        </h1>
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
        aria-label={
          signup ? "Create your DLL Studio account" : "DLL Studio sign-in"
        }
      >
        {isLoaded && isSignedIn ? (
          <div className="member-panel">
            <h2>You’re signed in.</h2>
            <Link className="button button-blue" href="/parent">
              Open my DLL account
            </Link>
          </div>
        ) : signup ? (
          <SignUp routing="hash" />
        ) : (
          <SignIn routing="hash" />
        )}
        <p className="dll-auth-help">
          {signup
            ? "For parents and guardians. Choose a password of at least 8 characters."
            : "Use your DLL Studio account email and password. Forgot it? Choose “Forgot password?” in the form."}
        </p>
        <p className="dll-auth-help">
          {signup ? (
            <Link href="/login">Already part of the crew? Sign in</Link>
          ) : (
            <Link href="/signup">New to DLL Studio? Create your account</Link>
          )}
        </p>
      </section>
    </main>
  );
}
