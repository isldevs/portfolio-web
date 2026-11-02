'use client';
import Link from 'next/link';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="site-shell">
      <div className="service-state">
        <span className="eyebrow">SYSTEM / REQUEST_INTERRUPTED</span>
        <h1>Something interrupted this request.</h1>
        <p>Please retry. If the problem continues, come back shortly.</p>
        <div className="hero-actions">
          <button className="button" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="button-secondary">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
