import Link from "next/link";
import { YouTubeEpisodes } from "@/components/youtube-episodes";
import { youtubeVideos } from "@/lib/youtube-videos";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Watch episodes",
  description: "Watch DLL Studio episodes and videos starring the crew. Free for everyone, with no account needed.",
};
export default async function StoriesPage() {
  const videos = await youtubeVideos();
  return (
    <main id="main" className="page-wrap member-page">
      <Link href="/" className="text-button">
        ← Back to the DLL world
      </Link>
      <span className="eyebrow">ADVENTURES FOR EVERYONE</span>
      <h1>Watch episodes.</h1>
      <p>
        Watch the crew’s videos and episodes. Free for
        everyone—no account needed.
      </p>
      <YouTubeEpisodes videos={videos} />
    </main>
  );
}
