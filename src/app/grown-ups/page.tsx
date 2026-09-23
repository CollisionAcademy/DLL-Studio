import Link from "next/link";
export const metadata = { title: "For grown-ups" };
export default function GrownUps() {
  return (
    <main id="main" className="page-wrap info-page">
      <span className="eyebrow">A NOTE TO THE GROWN-UPS</span>
      <h1>A little world, made with heart.</h1>
      <p>
        DLL Studio is a family-inspired home for imaginative animal characters.
        Through sports, adventures, mysteries, comedy, invention, and everyday
        lessons, our crew gives children different ways to explore and play.
      </p>
      <h2>What’s here to enjoy</h2>
      <ul>
        <li>
          Six character pages with short introductions and five-second animated
          greetings.
        </li>
        <li>
          Simple mini-games with no purchases, advertising, leaderboards, or
          accounts.
        </li>
        <li>
          Optional character conversations using ready-made question buttons.
        </li>
      </ul>
      <div className="parent-callout">
        <h2>About character chat</h2>
        <p>
          These are fictional characters, not people. Replies may be generated
          by AI and can be inaccurate. We keep questions to a small set of
          playful topics, check AI replies with moderation, and use prewritten
          storybook replies if the service is unavailable or a reply fails our
          checks.
        </p>
        <p>
          There is no free-text box, upload, microphone, or request for a
          child’s name, age, location, or contact details. Only the selected
          character and preset topic are sent to the chat service. Conversation
          text stays in the current page’s memory and disappears when you leave
          or start fresh.
        </p>
      </div>
      <h2>Enjoy it together</h2>
      <p>
        The games are designed for short, relaxed play. There’s no daily streak
        to protect and no penalty for stopping. Younger children may enjoy
        having a grown-up read the introductions and chat replies with them. All
        games have on-screen controls, and the site respects reduced-motion
        preferences.
      </p>
      <h2>A family connection</h2>
      <p>
        Luca, Leo, Vienna, and Bianna take their names from the family behind
        DLL Studio. Gramps the Falcon is a tribute to a much-loved grandfather
        and the Falconetti family name.
      </p>
      <p style={{ marginTop: 24 }}>
        Read our <Link href="/privacy">privacy information</Link> for more about
        how the site works.
      </p>
      <Link className="button button-blue" style={{ marginTop: 28 }} href="/">
        Back to the crew
      </Link>
    </main>
  );
}
