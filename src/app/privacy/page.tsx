import Link from "next/link";
export const metadata = { title: "Privacy" };
export default function Privacy() {
  return (
    <main id="main" className="page-wrap info-page">
      <span className="eyebrow">FOR PARENTS AND CAREGIVERS</span>
      <h1>Privacy, in plain language.</h1>
      <p>
        DLL Studio lets visitors meet fictional characters, watch short clips,
        and play without creating an account. This page describes the current
        website.
      </p>
      <h2>Games and videos</h2>
      <p>
        Games run in your browser. Scores and progress are not uploaded or
        stored by the app. Character images and videos are served as website
        files. There are no advertising trackers or analytics scripts added by
        DLL Studio, and no social-media video embeds.
      </p>
      <h2>Character conversations</h2>
      <p>
        Chat accepts only preset question buttons. The app sends the character
        ID and selected topic to our server; it does not accept typed messages,
        photographs, audio, personal profiles, or chat history. AI replies are
        produced through OpenAI and checked by its moderation service. We
        request that generated responses not be stored as Responses API
        conversation records; provider security and abuse-monitoring practices
        still apply.
      </p>
      <p>
        We do not send a visitor’s name, IP address, or other identifying
        information to OpenAI as part of the generation request. Displayed
        conversations exist only in the current page’s memory. Our server may
        temporarily cache a generated answer for a character and topic; that
        cache is not linked to an individual child.
      </p>
      <h2>Basic hosting information</h2>
      <p>
        Vercel, our hosting provider, processes connection information such as
        IP addresses and request metadata to deliver and protect the website.
        The chat endpoint uses a temporary hash of the connection address to
        limit requests. These limits reset, and the app does not create a
        persistent visitor profile. Infrastructure providers may retain
        operational or security logs under their own policies.
      </p>
      <h2>External services</h2>
      <p>
        Fal was used to create the character intro videos before publication.
        Playing the finished videos does not send chat messages or gameplay to
        Fal. Google Drive and GitHub are production tools and are not connected
        to the children’s play experience.
      </p>
      <h2>Questions for DLL Studio</h2>
      <p>
        A grown-up can raise a privacy question or report a concern through the
        DLL Studio website repository’s{" "}
        <a
          href="https://github.com/CollisionAcademy/DLL-Studio/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          issue page
        </a>
        . Issues are public: please do not include children’s names, contact
        details, or other private information.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/grown-ups">More information for grown-ups</Link>
      </p>
    </main>
  );
}
