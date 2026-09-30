import HelpLines from "./HelpLines";

/**
 * Shown after a student saves something that suggests they may be at risk —
 * from the AI reflection's judgement or the on-device phrase check. It replaces
 * the usual follow-up questions rather than sitting beside them: curiosity is
 * the wrong response to someone who might be unsafe.
 */
export default function SupportCard() {
  return (
    <div
      role="status"
      className="rounded-2xl p-5 mb-8 border border-coral/30 bg-white"
      data-animate="4"
    >
      <h2
        className="text-lg text-navy mb-1"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        Some of what you wrote sounds really heavy.
      </h2>
      <p className="text-sm text-ink-muted mb-4 leading-relaxed">
        Your entry is saved and private. You don&apos;t have to carry this on your own: talking
        to someone you trust, or to one of these services, can help. They&apos;re free,
        confidential, and used to hearing from people your age.
      </p>
      <HelpLines />
    </div>
  );
}
