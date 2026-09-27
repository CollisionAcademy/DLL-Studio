"use client";
import { ClerkProvider } from "@clerk/nextjs";
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#315bdd",
          colorForeground: "#193342",
          fontFamily: '"Nunito Sans", sans-serif',
          borderRadius: "1rem",
        },
        elements: {
          cardBox: { boxShadow: "0 14px 45px #19334212", width: "100%" },
          rootBox: { width: "100%" },
          headerTitle: {
            fontFamily: '"Fredoka", sans-serif',
            fontSize: "1.6rem",
          },
          formButtonPrimary: { fontWeight: 800, padding: "14px" },
        },
      }}
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/parent"
      signUpFallbackRedirectUrl="/parent"
    >
      {children}
    </ClerkProvider>
  );
}
