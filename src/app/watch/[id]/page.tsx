import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/membership/db";
import { publicEpisodeQuery } from "@/lib/membership/public-content-query";

export const dynamic = "force-dynamic";

export default async function PublicEpisode({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { rows } = await db().query(publicEpisodeQuery, [id]);
  const episode = rows[0];
  if (!episode) notFound();
  return (
    <main id="main" className="page-wrap member-page">
      <span className="eyebrow">A DLL Studio adventure for everyone</span>
      <h1>{episode.title}</h1>
      <article className="member-panel">
        <video
          controls
          playsInline
          preload="metadata"
          src={`/api/watch/${encodeURIComponent(id)}`}
          aria-label={episode.title}
          style={{ width: "100%", borderRadius: "16px" }}
        />
        <p>
          Six friends, one spooky surprise, and a little kindness. Happy
          Halloween!
        </p>
      </article>
      <Link href="/member/episodes" className="button button-blue">
        Visit the members’ Watch Nook
      </Link>
    </main>
  );
}
