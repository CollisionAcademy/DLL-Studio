import Link from "next/link";
export const metadata = { title: "Parent controls & family safety" };
export default function Safety() {
  return (
    <main id="main" className="page-wrap info-page">
      <span className="eyebrow">FOR THE GROWN-UPS</span>
      <h1>
        Room to imagine.
        <br />
        You stay in control.
      </h1>
      <h2>Choices, not a typing box.</h2>
      <p>
        Member character play uses curated buttons, jokes, riddles, and stories.
        Children cannot send free-form text, upload files, or use a microphone.
        Characters are pretend friends, and play is designed for shared,
        unhurried enjoyment.
      </p>
      <h2>A parent-managed account.</h2>
      <p>
        A parent or legal guardian manages the account through Clerk sign-in.
        Sensitive changes ask for a recently verified sign-in. Membership
        billing runs through Stripe. Leave the parent area and keep your sign-in
        credentials private when handing a device to a child.
      </p>
      <h2>A birthday, with less information.</h2>
      <p>
        The optional birthday profile stores a month, day, favorite character,
        and household timezone. No child name or birth year is required. A
        generic 10-second greeting is queued on or after the date at the next
        visit and appears once reviewed. Remove the profile in parent controls
        to withdraw permission and remove access to its greeting.
      </p>
      <h2>Your stories, with your permission.</h2>
      <p>
        Only parents can submit scripts, up to 500 characters. Keep them
        fictional and leave out personal details. Text goes to OpenAI for
        moderation; approved scenes and existing DLL character art go to FAL for
        video generation. These providers process submitted material under their
        own service policies. DLL stores scripts, job status, and video
        references to deliver and review the request.
      </p>
      <p>
        Finished videos require staff review. They start private, and parent
        permission never automatically publishes them. You may withdraw
        publishing permission in the parent dashboard.
      </p>
      <h2>A calm kind of progress.</h2>
      <p>
        Adventure points and badges celebrate participation. There are no daily
        streaks, public leaderboards, or penalties for taking a break.
      </p>
      <h2>Shop and boxes.</h2>
      <p>
        Purchases and shipping are for grown-ups. Catalog items and boxes remain
        previews until stock, pricing, and fulfillment are connected.
      </p>
      <Link className="button button-blue" href="/parent">
        Parent controls
      </Link>
      <p>
        <Link href="/privacy">Read the site privacy information →</Link>
      </p>
    </main>
  );
}
