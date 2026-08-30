/**
 * Operator details rendered verbatim in /privacy and /terms.
 *
 * TODO(launch): replace every value below with the real registered details,
 * and have both documents reviewed by someone qualified. The wording of the
 * policies describes what the app actually does today — if that changes, the
 * policies must change with it.
 */
export const OPERATOR = {
  /** Trading name shown to users. */
  name: "Groundwork",
  /** Monitored inbox for privacy questions and data requests. */
  contactEmail: "privacy@mygroundwork.app",
  /** Where the operator is based — sets the governing law for the terms. */
  jurisdiction: "Queensland, Australia",
  /** Last substantive revision of the policy text. */
  lastUpdated: "30 August 2026",
};

/** Minimum age to hold an account at all. */
export const MIN_AGE = 13;

/** Below this age we ask that a parent or carer knows about the account. */
export const PARENTAL_AWARENESS_AGE = 16;
