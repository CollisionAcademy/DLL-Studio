import { SiteAuth } from "@/components/membership/site-auth";
import { AccountLayout } from "@/components/membership/account-layout";
export default function Signup() {
  return (
    <AccountLayout>
      <SiteAuth signup />
    </AccountLayout>
  );
}
