import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="site-shell">
      <section className="not-found">
        <span>ERROR_404</span>
        <h1>
          Endpoint not found<span className="accent">.</span>
        </h1>
        <p>This page may have moved, or the content has not been published.</p>
        <Link href="/" className="button">
          Return to portfolio →
        </Link>
      </section>
    </div>
  );
}
