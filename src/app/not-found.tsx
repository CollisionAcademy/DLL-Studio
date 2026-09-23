import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="page-wrap empty-page">
      <span className="big-emoji">🔎</span>
      <h1>A little mystery…</h1>
      <p>We couldn’t find that page. Let’s head back to the crew!</p>
      <Link href="/" className="button button-blue">
        Back to DLL Studio
      </Link>
    </main>
  );
}
