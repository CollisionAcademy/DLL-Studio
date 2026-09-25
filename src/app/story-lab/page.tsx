import Image from "next/image";
import { ArrowRight, Heart, Sparkles, MousePointer2 } from "lucide-react";

export const metadata = {
  title: "Story Lab",
  description: "Step into a DLL Studio adventure with Leo. Explore Captain Giggle, an interactive illustrated story about friendship, listening, and making things right.",
};

export default function StoryLab() {
  return (
    <main id="main" className="page-wrap story-lab-page">
      <div className="page-heading">
        <span className="eyebrow">LITTLE CHARACTERS. BIG STORIES.</span>
        <h1>Story Lab<span className="pink-star">✳</span></h1>
        <p>Choose, wonder, laugh. There’s a place for you in the adventure.</p>
      </div>
      <section className="story-feature" aria-labelledby="adventure-title">
        <div className="story-feature-art">
          <Image src="/characters/leo.png" alt="Leo in his blue and orange superhero suit" width={520} height={520} sizes="(max-width: 700px) 90vw, 440px" priority />
          <span className="story-sticker">Meet your hero:<br />Leo!</span>
        </div>
        <div className="story-feature-copy">
          <span className="eyebrow">OUR FIRST ADVENTURE · AGES 6–10</span>
          <h2 id="adventure-title">Captain Giggle</h2>
          <h3>&amp; the Crocodile Who Needed a Friend</h3>
          <p>A missing cake. A very big hat. A crocodile with something to say. Join Leo and friends as they discover that every good adventure begins with listening.</p>
          <a className="button button-blue" href="/adventures/captain-giggle/index.html">Enter the adventure <ArrowRight size={20} /></a>
          <p className="story-format">Interactive illustrated preview · About 10 minutes</p>
        </div>
      </section>
      <section className="story-promises" aria-label="Ways to enjoy the story">
        <div><MousePointer2 aria-hidden="true" /><h3>Your turn to wonder</h3><p>Spot clues and make choices. Or sit back and let the story continue.</p></div>
        <div><Heart aria-hidden="true" /><h3>Everyone belongs</h3><p>No scores or wrong ways to join in. Enjoy it on your own or with a grown-up.</p></div>
        <div><Sparkles aria-hidden="true" /><h3>More magic in the making</h3><p>This illustrated preview is ready to explore. A separate fully animated episode is in production.</p></div>
      </section>
    </main>
  );
}
