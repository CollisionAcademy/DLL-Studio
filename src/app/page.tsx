import Link from "next/link";
import Image from "next/image";
import { characters, getCharacter } from "@/lib/characters";
import {
  featuredShort,
  homeShorts,
  vaultPicks,
} from "@/lib/home-features";
import { plans, type PlanKey } from "@/lib/membership/plans";
import { products } from "@/lib/membership/shop";
import { youtubeVideos } from "@/lib/youtube-videos";
import { pageMetadata } from "@/lib/page-metadata";
import { PlayableArt, VaultPlayProvider } from "@/components/vault-play";
import "./home.css";

export const metadata = pageMetadata({
  path: "/",
  title: "DLL Studio — Today’s short is ready to play",
  description:
    "Six friends. Fresh shorts. A free Story Vault you can watch together — no account needed. Meet Luca, Leo, Vienna, Bianna, Doo Wop Dog, and Gramps.",
  absoluteTitle: true,
});

const homePlans: {
  key: PlanKey;
  name: string;
  popular?: boolean;
  benefits: string[];
}[] = [
  {
    key: "crew",
    name: "DLL Crew",
    benefits: [
      "Public episodes & shorts",
      "Meet all six characters",
      "Story Vault & playroom",
      "No account needed to watch",
    ],
  },
  {
    key: "adventure",
    name: "Adventure Club",
    benefits: [
      "Everything in DLL Crew",
      "Members-only stories",
      "A 10-second birthday video",
      "Games, riddles, polls & badges",
    ],
  },
  {
    key: "super",
    name: "Super Crew",
    popular: true,
    benefits: [
      "Everything in Adventure Club",
      "1 custom adventure video / month",
      "10% off eligible shop items",
      "Early access to new adventures",
    ],
  },
  {
    key: "family",
    name: "Family Pass",
    benefits: [
      "Everything in Super Crew",
      "2 custom videos / month",
      "15% off eligible shop items",
      "Recurring five-item gift box",
    ],
  },
];

function money(cents: number) {
  return cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`;
}

function characterArt(
  id: string,
  className: string,
  sizes: string,
  priority = false,
) {
  return (
    <Image
      src={`/characters/${id}.png`}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

export default function Home() {
  const vaultCount = youtubeVideos.length;
  const mystery = homeShorts[1];
  const cookie = homeShorts[2];
  const [cookieMystery, football, missingMap] = vaultPicks;

  return (
    <main id="main" className="home">
      <VaultPlayProvider>
        <div className="site-wrap">
          <section className="home-hero">
            <div>
              <div className="home-kicker">✦ New in the Story Vault</div>
              <h1>
                Today’s short
                <br />
                is ready to play.
              </h1>
              <p className="home-lead">
                Six friends. Fresh shorts. A free Story Vault you can watch
                together — no account needed. A little brave, a little silly, a
                whole lot of heart.
              </p>
              <div className="home-actions">
                <a className="home-btn home-btn-yellow" href="#shorts">
                  Watch the latest short
                </a>
                <a className="home-btn home-btn-ghost" href="#vault">
                  Open the Story Vault
                </a>
              </div>
              <p className="home-note">
                Made for kids. Public play is always free. Purchases stay with
                a grown-up.
              </p>
            </div>
            <aside className="home-player" aria-label="Featured short preview">
              <PlayableArt
                video={featuredShort.video}
                label={`Play ${featuredShort.video.title}`}
                className="home-player-stage"
              >
                <span className="home-player-figure">
                  {characterArt(
                    featuredShort.characterId,
                    "home-player-photo",
                    "(max-width: 800px) 90vw, 480px",
                    true,
                  )}
                </span>
                <span className="home-play-btn" aria-hidden="true" />
              </PlayableArt>
              <div className="home-player-meta">
                <div>
                  Now playing · <em>{featuredShort.video.title}</em>
                </div>
                <small>{featuredShort.caption}</small>
              </div>
            </aside>
          </section>

          <section className="home-week home-section" id="shorts">
            <div className="home-week-head">
              <div>
                <p className="home-eyebrow">Watch · Story Vault shorts</p>
                <h2>Stories you can press play on.</h2>
              </div>
              <Link className="home-btn home-btn-blue" href="/stories">
                See all {vaultCount} in the Vault
              </Link>
            </div>
            <div className="home-shorts">
              <ShortCard
                video={featuredShort.video}
                characterId={featuredShort.characterId}
                pill={featuredShort.pill}
                title={featuredShort.video.title}
                caption={featuredShort.caption}
              />
              <ShortCard
                video={mystery.video}
                characterId={mystery.characterId}
                pill={mystery.pill}
                title={mystery.video.title}
                caption={mystery.caption}
              />
              <Link className="home-short" href="/story-lab">
                <span
                  className="home-short-thumb"
                  style={{ background: "#dceaff" }}
                >
                  <span className="home-pill">Adventure</span>
                  {characterArt("leo", "home-cover", "240px")}
                </span>
                <span className="home-short-copy">
                  <span className="home-short-title">Captain Giggle preview</span>
                  <span>Leo · Story Lab, ages 6–10</span>
                </span>
              </Link>
              <ShortCard
                video={cookie.video}
                characterId={cookie.characterId}
                pill={cookie.pill}
                title={cookie.video.title}
                caption={cookie.caption}
              />
            </div>
          </section>

          <section className="home-crew home-section" id="crew">
            <p className="home-eyebrow">Six friends. Endless possibilities.</p>
            <h2>Meet your crew.</h2>
            <p className="home-intro">
              A little brave. A little silly. A whole lot of heart. Come say
              hello — each friend has a five-second intro and a tiny game.
            </p>
            <div className="home-crew-grid">
              {characters.map((character) => (
                <Link
                  className="home-char"
                  href={`/characters/${character.id}`}
                  key={character.id}
                >
                  <span
                    className="home-char-art"
                    style={{ background: character.pale }}
                  >
                    {characterArt(character.id, "home-cover", "180px")}
                  </span>
                  <span className="home-char-copy">
                    <span className="home-char-name">{character.name}</span>
                    <span>
                      {character.theme} · {character.role.toLowerCase()}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="home-vault home-section" id="vault">
          <div className="site-wrap">
            <p className="home-eyebrow">Story Vault · click to play</p>
            <h2>A free library of little adventures.</h2>
            <p className="home-intro">
              {vaultCount} stories already waiting. No account, no autoplay
              playlist — just a short you choose, when you’re ready.
            </p>
            <div className="home-vault-grid">
              <Link className="home-vault-card home-vault-feature" href="/story-lab">
                <span className="home-vault-art" style={{ background: "#dceaff" }}>
                  {characterArt(
                    "leo",
                    "home-cover",
                    "(max-width: 800px) 90vw, 420px",
                  )}
                </span>
                <span className="home-vault-copy">
                  <span className="home-eyebrow">New in the Story Lab</span>
                  <span className="home-vault-title">
                    Captain Giggle & the Crocodile Who Needed a Friend
                  </span>
                  <span>
                    Join Leo for an illustrated friendship adventure full of
                    silly surprises and choices you can make together.
                    Interactive preview · ages 6–10.
                  </span>
                </span>
              </Link>
              <VaultCard pick={cookieMystery} />
              <VaultCard pick={football} />
              <VaultCard pick={missingMap} />
              <Link className="home-vault-card" href="/characters/gramps">
                <span className="home-vault-art" style={{ background: "#f5e5d5" }}>
                  {characterArt("gramps", "home-cover", "320px")}
                </span>
                <span className="home-vault-copy">
                  <span className="home-vault-title">A lot of heart</span>
                  <span>
                    Gramps has a gruff little grumble — and good advice.
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="home-playroom home-section" id="play">
          <div className="site-wrap">
            <div className="home-week-head">
              <div>
                <p className="home-eyebrow">Small games. Big grins.</p>
                <h2>Ready, set… let’s play!</h2>
              </div>
              <Link className="home-btn home-btn-blue" href="/play">
                Enter the playroom
              </Link>
            </div>
            <div className="home-play-grid">
              <article className="home-play-card">
                <span className="home-play-ico" style={{ background: "#d8f3de" }}>
                  ⚽
                </span>
                <h3>A little hello</h3>
                <p>
                  Meet each character in a five-second mini intro. Come curious.
                  Leave smiling.
                </p>
              </article>
              <article className="home-play-card">
                <span className="home-play-ico" style={{ background: "#dceaff" }}>
                  ⚡
                </span>
                <h3>A little adventure</h3>
                <p>
                  Six playful games. No downloads. No scores, streaks, or “you
                  lose.” Just jump in.
                </p>
              </article>
              <article className="home-play-card">
                <span className="home-play-ico" style={{ background: "#ffe2ec" }}>
                  🎉
                </span>
                <h3>A little conversation</h3>
                <p>
                  Choose a question and see what your character says. Ready-made
                  choices only — no typing for kids.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="home-grown home-section" id="grown-ups">
          <div className="site-wrap">
            <div className="home-lock">
              Grown-ups only · parent-managed checkout
            </div>
            <p className="home-eyebrow">Memberships & a little merch</p>
            <h2>
              They pick the adventure.
              <br />
              You’re in the grown-up seat.
            </h2>
            <p className="home-grown-lead">
              The public DLL world stays free. Plans, merch, and custom videos
              are managed by a parent or guardian. Character play uses
              ready-made choices — no child-facing typing, voice input, or
              uploads.
            </p>
            <div className="home-grown-actions">
              <Link className="home-btn home-btn-yellow" href="/login">
                Parent account
              </Link>
              <Link className="home-btn home-btn-ghost home-btn-on-dark" href="/shop">
                Open the shop
              </Link>
            </div>
            <div className="home-plans">
              {homePlans.map((plan) => {
                const cents = plans[plan.key].cents;
                return (
                  <Link
                    className={plan.popular ? "home-plan is-popular" : "home-plan"}
                    href="/shop#plans"
                    key={plan.key}
                  >
                    {plan.popular ? (
                      <span className="home-plan-tag">Most popular</span>
                    ) : null}
                    <span className="home-plan-name">{plan.name}</span>
                    <span className="home-price">
                      {money(cents)}{" "}
                      <span>{cents === 0 ? "forever" : "/month"}</span>
                    </span>
                    <ul>
                      {plan.benefits.map((benefit) => (
                        <li key={benefit}>{benefit}</li>
                      ))}
                    </ul>
                    <span className="home-plan-go">View in the parent shop</span>
                  </Link>
                );
              })}
            </div>
            <p className="home-eyebrow">Catalog preview</p>
            <div className="home-merch">
              {products.map((product) => (
                <Link
                  className="home-merch-card"
                  href="/shop#merchandise"
                  key={product.id}
                >
                  <span className="home-soon">Coming soon</span>
                  <span className="home-merch-name">{product.name}</span>
                  <span>
                    {money(product.cents)} · {product.description}
                  </span>
                </Link>
              ))}
            </div>
            <p className="home-grown-note">
              Prices match the parent shop. Checkout stays with a grown-up.
              Official social accounts live on the grown-ups page, not in the
              kids navigation.
            </p>
          </div>
        </section>
      </VaultPlayProvider>
    </main>
  );
}

function ShortCard({
  video,
  characterId,
  pill,
  title,
  caption,
}: {
  video: (typeof homeShorts)[number]["video"];
  characterId: string;
  pill: string;
  title: string;
  caption: string;
}) {
  const character = getCharacter(characterId);
  return (
    <PlayableArt
      video={video}
      label={`Play ${title}`}
      className="home-short"
    >
      <span
        className="home-short-thumb"
        style={{ background: character?.pale || "#fff" }}
      >
        <span className="home-pill">{pill}</span>
        {characterArt(characterId, "home-cover", "240px")}
      </span>
      <span className="home-short-copy">
        <span className="home-short-title">{title}</span>
        <span>{caption}</span>
      </span>
    </PlayableArt>
  );
}

function VaultCard({ pick }: { pick: (typeof vaultPicks)[number] }) {
  const character = getCharacter(pick.characterId);
  return (
    <PlayableArt
      video={pick.video}
      label={`Play ${pick.video.title}`}
      className="home-vault-card"
    >
      <span
        className="home-vault-art"
        style={{ background: character?.pale || "#fff" }}
      >
        {characterArt(pick.characterId, "home-cover", "320px")}
      </span>
      <span className="home-vault-copy">
        <span className="home-vault-title">{pick.video.title}</span>
        <span>{pick.caption}</span>
      </span>
    </PlayableArt>
  );
}
