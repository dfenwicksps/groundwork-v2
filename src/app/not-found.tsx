import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-muted flex flex-col items-center justify-center px-6 text-center">
      <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center mb-6">
        <span className="text-white text-base font-semibold">G</span>
      </div>
      <h1
        className="text-3xl text-navy mb-3"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
      >
        That page isn&apos;t here.
      </h1>
      <p className="text-sm text-ink-muted mb-8 max-w-sm leading-relaxed">
        The link might be old, or the page may have moved. Your journal and
        progress are safe.
      </p>
      <Link href="/dashboard" className="btn btn-primary px-8">
        Back to your dashboard
      </Link>
    </div>
  );
}
