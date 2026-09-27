import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  Gift,
  Play,
  Heart,
} from "lucide-react";
import { plans, planKeys } from "@/lib/membership/plans";
import { characters } from "@/lib/characters";
export const metadata = {
  title: "Membership — There’s more to DLL than watching",
  description:
    "Watch, join, create, and bring the adventure home. Explore DLL Crew, Adventure Club, Super Crew, and Family Pass.",
};
export default function MembershipPage() {
  return (
    <main id="main" className="membership-page">
      <section className="membership-hero page-wrap">
        <div className="membership-hero-copy">
          <span className="eyebrow">
            LITTLE CHARACTERS. EVEN BIGGER POSSIBILITIES.
          </span>
          <h1>
            There’s more to DLL
            <br />
            than <span>watching.</span>
          </h1>
          <p>
            Join the Crew, play with your favorite characters, unlock new
            adventures, create your own DLL stories and bring the fun home.
          </p>
          <div className="membership-actions">
            <a href="#plans" className="button button-blue">
              Find your family’s adventure <ArrowRight size={18} />
            </a>
            <Link href="/member" className="text-button">
              Already part of the crew? →
            </Link>
          </div>
          <div className="membership-trust">
            <ShieldCheck size={19} /> Parent-managed. Choice-only play. Full of
            imagination.
          </div>
        </div>
        <div className="membership-art">
          <div className="membership-orbit" aria-hidden="true" />
          {characters.slice(0, 4).map((c, i) => (
            <div className={`membership-character mc-${i}`} key={c.id}>
              <Image
                src={`/characters/${c.id}.png`}
                alt={c.name}
                fill
                sizes="(max-width: 700px) 40vw, 230px"
                priority={i < 2}
              />
            </div>
          ))}
          <span className="membership-sticker">
            <Sparkles size={18} /> Made for little imaginations
          </span>
        </div>
      </section>
      <div className="adventure-path" aria-label="The DLL membership journey">
        {planKeys.map((key, i) => (
          <span key={key}>
            <b>0{i + 1}</b> {plans[key].verb}
            {i < 3 && <ArrowRight size={18} />}
          </span>
        ))}
      </div>
      <section id="plans" className="page-wrap membership-plans">
        <div className="section-intro">
          <span className="eyebrow">FOUR WAYS TO BELONG</span>
          <h2>
            Every great adventure
            <br />
            starts with your crew.
          </h2>
          <p>
            Pick the way your family loves to explore. The public DLL world is
            always free.
          </p>
        </div>
        <div className="plan-grid">
          {planKeys.map((key) => {
            const plan = plans[key];
            return (
              <article className={`plan-card plan-${key}`} key={key}>
                {key === "super" && (
                  <div className="popular-label">
                    <Sparkles size={15} /> MOST POPULAR
                  </div>
                )}
                <span className="plan-step">{plan.verb}</span>
                <h3>{plan.name}</h3>
                <p className="plan-tagline">{plan.tagline}</p>
                <div className="plan-price">
                  {plan.cents === 0
                    ? "Free"
                    : `$${(plan.cents / 100).toFixed(2)}`}
                  <span>{plan.cents > 0 ? "/month" : "forever"}</span>
                </div>
                <p className="plan-price-note">
                  {key === "family"
                    ? "Initial monthly price · USD"
                    : key === "crew"
                      ? "No account needed to watch"
                      : "Monthly membership · USD"}
                </p>
                <Link
                  className={`button ${key === "super" ? "button-yellow" : "button-blue"}`}
                  href={key === "crew" ? "/" : `/parent?plan=${key}`}
                >
                  {key === "crew"
                    ? "Explore the free world"
                    : "Grown-ups, choose this plan"}
                  <ArrowRight size={16} />
                </Link>
                <ul>
                  {plan.benefits.map((b) => (
                    <li key={b}>
                      <Check size={17} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <p className="plan-fine-print">
          Parent accounts handle every purchase. Custom video credits renew each
          paid billing month and do not roll over. Every submitted story and
          finished video goes through review. Family box fulfillment details
          will be confirmed before checkout opens.
        </p>
      </section>
      <section className="membership-moments page-wrap">
        <div className="moment">
          <span>
            <Play />
          </span>
          <h3>More “one more story.”</h3>
          <p>
            A members-only story vault, new episodes, and little moments to
            enjoy together.
          </p>
        </div>
        <div className="moment">
          <span>
            <Sparkles />
          </span>
          <h3>Their idea. A DLL adventure.</h3>
          <p>
            With Super Crew, a grown-up helps turn a little story idea into a
            roughly 15-second character video.
          </p>
        </div>
        <div className="moment">
          <span>
            <Gift />
          </span>
          <h3>A little DLL, at home.</h3>
          <p>
            Print an activity, celebrate a birthday, or bring home a five-item
            box with Family Pass.
          </p>
        </div>
      </section>
      <section className="page-wrap">
        <div className="membership-safety">
          <div>
            <span className="eyebrow">
              BIG IMAGINATIONS. THOUGHTFUL BOUNDARIES.
            </span>
            <h2>
              They pick the adventure.
              <br />
              You’re in the grown-up seat.
            </h2>
            <p>
              Character play uses ready-made choices. No child-facing typing,
              voice input, or uploads. Parents manage birthdays, scripts,
              purchases, and whether a finished video may be shared.
            </p>
            <Link className="text-button" href="/parents/safety">
              Explore our family safety approach →
            </Link>
          </div>
          <Heart size={86} strokeWidth={1.3} />
        </div>
      </section>
      <section className="membership-faq page-wrap">
        <h2>A few things grown-ups ask.</h2>
        {[
          [
            "Can we keep watching for free?",
            "Absolutely. DLL Crew includes the public episodes, Shorts, introductions, adventures, comedy, and existing public playroom.",
          ],
          [
            "How do custom videos work?",
            "A parent submits up to 500 characters about a gentle fictional adventure. We review the idea, create a roughly 15-second DLL video, and review it before your family can watch. Super Crew includes one credit per billing month; Family Pass includes two in total. Rejected or confirmed failed requests return the credit within its original billing period.",
          ],
          [
            "What happens on a birthday?",
            "A parent saves the birthday’s month and day and a household timezone. A 10-second greeting is queued on or after that date at the next visit. It appears after generation and review; it may not be ready immediately. No child’s name or birth year is required.",
          ],
          [
            "Is the Mega Box part of Family Pass?",
            "Family Pass has a recurring five-item gift box entitlement. The ten-item DLL Mega Box is a separate purchase, with shipping calculated separately. Product and fulfillment details are coming soon.",
          ],
          [
            "Can I share a custom video?",
            "Videos start private. A parent may grant or withdraw publishing permission after a video is reviewed. Permission alone never automatically publishes a video.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
