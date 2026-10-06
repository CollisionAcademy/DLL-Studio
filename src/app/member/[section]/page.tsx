import { ActivityRoom } from "@/components/membership/activity-room";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { entitled, AccessError } from "@/lib/membership/access";
import { type Entitlement } from "@/lib/membership/plans";
import { ClubPlay } from "@/components/membership/club-play";
import {
  MemberContent,
  MemberPoll,
} from "@/components/membership/member-content";
const sections: Record<string, { title: string; feature: Entitlement }> = {
  play: { title: "Play With the Crew", feature: "character_play" },
  episodes: { title: "The watch nook", feature: "member_content" },
  activities: {
    title: "The imagination room",
    feature: "activities",
  },
  vote: { title: "Every idea counts", feature: "voting" },
};
export default async function MemberSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === "stories") redirect("/stories");
  const config = sections[section];
  if (!config) notFound();
  let error = "";
  try {
    await entitled(config.feature);
  } catch (e) {
    if (e instanceof AccessError) error = e.message;
    else
      error = "The clubhouse is taking a little break. Please try again soon.";
  }
  return (
    <main id="main" className="page-wrap member-page">
      <Link href="/member" className="text-button">
        ← Back to the clubhouse
      </Link>
      <h1>{config.title}.</h1>
      {error ? (
        <div className="locked-feature">
          <p>{error}</p>
          <div className="membership-actions">
            <Link className="button button-blue" href="/login">
              Parent sign-in
            </Link>
            <Link className="button button-yellow" href="/membership">
              Explore memberships
            </Link>
          </div>
        </div>
      ) : (
        <>
          {section === "play" && <ClubPlay />}
          {section === "episodes" && (
            <MemberContent key="episodes" kind="episode" />
          )}
          {section === "activities" && <ActivityRoom />}
          {section === "vote" && <MemberPoll />}
        </>
      )}
    </main>
  );
}
