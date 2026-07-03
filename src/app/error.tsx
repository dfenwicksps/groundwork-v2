"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-surface-muted flex flex-col items-center justify-center px-6 text-center">
      <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center mb-6">
        <span className="text-white text-base font-semibold">G</span>
      </div>
      <h1
        className="text-3xl text-navy mb-3"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
      >
        Something went wrong.
      </h1>
      <p className="text-sm text-ink-muted mb-8 max-w-sm leading-relaxed">
        Not your fault — something on our side hiccuped. Your journal and
        progress are safe.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn btn-primary px-8">
          Try again
        </button>
        <a href="/dashboard" className="btn btn-secondary px-8">
          Dashboard
        </a>
      </div>
    </div>
  );
}
