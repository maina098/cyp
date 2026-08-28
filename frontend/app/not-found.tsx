import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="section-kicker">Coastal Youth Parliament</p>
      <h1>Page not found</h1>
      <p>The page may have moved, or the address may be incorrect.</p>
      <div className="not-found-actions">
        <Link href="/" className="primary-btn">Go home</Link>
        <Link href="/contact" className="secondary-btn">Contact CYP</Link>
      </div>
    </main>
  );
}
