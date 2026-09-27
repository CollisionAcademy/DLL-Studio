"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="page-wrap member-page">
      <h1>A little pause in the adventure.</h1>
      <p role="alert">We couldn’t open this page. Please try again.</p>
      <button onClick={reset} className="button button-blue">
        Try again
      </button>
    </main>
  );
}
