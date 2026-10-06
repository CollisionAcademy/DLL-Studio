import Link from "next/link";
import { StoryVault } from "@/components/story-vault";
import { db } from "@/lib/membership/db";
import { publicStoryVaultQuery } from "@/lib/membership/public-content-query";
import type { ShelfItem } from "@/lib/membership/content-shelf";

export const dynamic = "force-dynamic";
export const metadata = { title: "The story vault" };
export default async function StoriesPage() {
  let items: ShelfItem[] = [];
  let unavailable = false;
  try {
    items = (await db().query<ShelfItem>(publicStoryVaultQuery)).rows;
  } catch {
    unavailable = true;
  }
  return (
    <main id="main" className="page-wrap member-page">
      <Link href="/" className="text-button">
        ← Back to the DLL world
      </Link>
      <span className="eyebrow">ADVENTURES FOR EVERYONE</span>
      <h1>The story vault.</h1>
      <p>
        Watch the crew’s videos and episodes, and discover funny tales. Free for
        everyone—no account needed.
      </p>
      {unavailable ? (
        <p role="alert">
          The story vault is taking a little break. Please try again soon.
        </p>
      ) : (
        <StoryVault items={items} />
      )}
      <article className="member-panel">
        <h2>Leo and the very wobbly flag.</h2>
        <p>
          Leo built a little flag stand. It leaned left. It leaned right. Bianna
          leaned along with it and giggled. “What if the bottom were wider?”
          asked Vienna. Luca held the flag while Leo moved two blocks. The flag
          stood tall. Then Bianna’s hat tipped sideways. “A little wobble is
          funny,” she said, “when friends are there to help.”
        </p>
      </article>
    </main>
  );
}
