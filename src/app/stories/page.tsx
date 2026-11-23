import Link from "next/link";
import { YouTubeEpisodes } from "@/components/youtube-episodes";
import { youtubeVideos } from "@/lib/youtube-videos";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  path: "/stories",
  title: "Story Vault",
  description:
    "Choose a DLL Studio adventure: funny mysteries, football stories, and spooky fun. Free videos with click-to-play viewing and no automatic playlists.",
});
export default function StoriesPage() {
  return (
    <main id="main" className="page-wrap vault-page">
      <Link href="/" className="text-button">
        ← Back to the DLL world
      </Link>
      <div className="vault-intro">
        <h1>The Story Vault.</h1>
        <p>
          Little mysteries. Big laughs. Find an adventure with the DLL crew.
        </p>
        <span>Free for every family · No account needed</span>
      </div>
      <YouTubeEpisodes videos={youtubeVideos} />
    </main>
  );
}
