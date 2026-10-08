import Link from "next/link";
import { StoryVault } from "@/components/story-vault";
import { YouTubeEpisodes } from "@/components/youtube-episodes";
import { db } from "@/lib/membership/db";
import { publicStoryVaultQuery } from "@/lib/membership/public-content-query";
import type { ShelfItem } from "@/lib/membership/content-shelf";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Watch episodes",
  description: "Watch DLL Studio episodes and videos starring the crew. Free for everyone, with no account needed.",
};
export default async function StoriesPage() {
  let items: ShelfItem[] = [];
  try {
    items = (await db().query<ShelfItem>(publicStoryVaultQuery)).rows.filter((item) => item.kind === "story");
  } catch {
    // YouTube episodes remain available when the written-story database is offline.
  }
  return (
    <main id="main" className="page-wrap member-page">
      <Link href="/" className="text-button">
        ← Back to the DLL world
      </Link>
      <span className="eyebrow">ADVENTURES FOR EVERYONE</span>
      <h1>Watch episodes.</h1>
      <p>
        Watch the crew’s videos and episodes, and discover funny tales. Free for
        everyone—no account needed.
      </p>
      <YouTubeEpisodes />
      {items.length > 0 && <StoryVault items={items} />}
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
