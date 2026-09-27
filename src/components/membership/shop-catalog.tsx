import Link from "next/link";
import { products } from "@/lib/membership/shop";
export function ShopCatalog() {
  return (
    <section id="merchandise" className="page-wrap member-page" aria-labelledby="merchandise-title">
      <span className="eyebrow">FOR GROWN-UPS · CATALOG PREVIEW</span>
      <h2 id="merchandise-title">
        A little DLL.
        <br />A lot of imagination.
      </h2>
      <p>
        Every individual product is planned under $50. These are proposed
        products and prices; purchases open once inventory and fulfillment are
        ready.
      </p>
      <div className="member-destinations">
        {products.map((p) => (
          <article className="member-destination" key={p.id}>
            <span>{p.icon}</span>
            <h2>{p.name}</h2>
            <p>{p.description}</p>
            <strong>${(p.cents / 100).toFixed(2)}</strong>
            <p>Coming soon</p>
          </article>
        ))}
      </div>
      <div className="member-columns">
        <section className="member-panel">
          <span className="eyebrow">DLL FAMILY PASS</span>
          <h2>Five little surprises.</h2>
          <p>
            A recurring five-item DLL gift box entitlement, included with Family
            Pass. Your parent dashboard keeps track of each allocation.
          </p>
          <Link href="#plans" className="text-button">
            Explore Family Pass →
          </Link>
        </section>
        <section className="member-panel">
          <span className="eyebrow">A SEPARATE PURCHASE</span>
          <h2>The DLL Mega Box.</h2>
          <p>
            Ten items. One big dose of adventure. Final contents and price are
            coming soon. Shipping will be calculated separately at checkout.
          </p>
          <strong>Purchase details coming soon</strong>
        </section>
      </div>
      <p>
        Super Crew receives 10% off eligible shop items; Family Pass receives
        15%. Box eligibility and exclusions will be shown before purchase.
      </p>
    </section>
  );
}
