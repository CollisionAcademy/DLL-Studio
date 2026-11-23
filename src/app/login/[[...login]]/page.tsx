import { SiteAuth } from "@/components/membership/site-auth";
import { AccountLayout } from "@/components/membership/account-layout";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  path: "/login",
  title: "Parent sign-in",
  description:
    "Parent and guardian accounts for DLL Studio. Children can watch and play without an account.",
  index: false,
});

export default function Login() {
  return (
    <AccountLayout>
      <SiteAuth />
    </AccountLayout>
  );
}
