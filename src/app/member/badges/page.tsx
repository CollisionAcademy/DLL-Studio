import Link from "next/link";
import { BadgeCollection } from "@/components/membership/badge-collection";
export const metadata = { title: "Character badges & store rewards" };
export default function BadgesPage() {
  return (
    <main id="main" className="page-wrap member-page">
      <Link href="/member" className="text-button">
        ← Back to the clubhouse
      </Link>
      <h1>Your character badges.</h1>
      <BadgeCollection />
    </main>
  );
}
