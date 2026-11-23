import { studioSocialLinks } from "@/lib/studio-social";

export function GrownUpSocial() {
  const links = studioSocialLinks();
  if (!links.length) return null;
  return (
    <section className="grown-social" aria-label="Official accounts for grown-ups">
      <h2>Official accounts for grown-ups</h2>
      <p>
        YouTube, Instagram, and TikTok open outside DLL Studio. They are for
        parents and guardians, not part of the kids playroom.
      </p>
      <ul>
        {links.map((link) => (
          <li key={link.platform}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.platform}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
