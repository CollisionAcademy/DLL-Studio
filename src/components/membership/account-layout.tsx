import Link from "next/link";
import { authConfigured } from "@/lib/membership/access";
export function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!authConfigured())
    return (
      <main id="main" className="page-wrap member-page">
        <span className="eyebrow">THE NEXT ADVENTURE IS ON ITS WAY</span>
        <h1>
          A little more magic,
          <br />
          coming soon.
        </h1>
        <p>
          We’re getting parent accounts and memberships ready. In the meantime,
          meet the crew and enjoy the free playroom.
        </p>
        <div className="membership-actions">
          <Link className="button button-blue" href="/membership">
            Explore memberships
          </Link>
          <Link className="button button-yellow" href="/play">
            Visit the playroom
          </Link>
        </div>
      </main>
    );
  return children;
}
