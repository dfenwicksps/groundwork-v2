import Link from "next/link";
import IdentityCard from "@/components/IdentityCard";
import type { IdentityCard as Card } from "@/lib/identityCard";
import type { MapGroup } from "@/lib/v3/levelMap";
import type { ResultWords } from "@/lib/v3/selfCheck";
import { NAVY, YELLOW, display, onBand } from "./mapStyle";

// The four cards a student builds as they go: one for each big question on the
// map. In v2 each card lived on its mission's page; those pages are gone, so
// Me is where the cards live now. Only the student ever sees this.
export default function MeCards({
  cards,
  check,
}: {
  cards: { group: MapGroup; colour: string; card: Card | null }[];
  /** The student's own latest self-check, in words, or null if they haven't taken it. */
  check: ResultWords | null;
}) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="me-check" className="rounded-3xl p-5 md:p-6" style={{ background: YELLOW, color: NAVY }}>
        <p id="me-check" className="text-[13px] font-extrabold uppercase tracking-[0.12em]">
          Your self-check
        </p>
        {check ? (
          check.flat ? (
            <p className="mt-1.5 text-lg font-extrabold leading-snug" style={onBand}>
              Nothing stood out last time, so anywhere on the map is a good place to start.
            </p>
          ) : (
            <dl className="mt-1.5 space-y-1 text-[17px] font-semibold leading-snug">
              {check.steady.length > 0 && (
                <div>
                  <dt className="inline font-extrabold">Already steady: </dt>
                  <dd className="inline">{check.steady.map((l) => l.name).join(" and ")}</dd>
                </div>
              )}
              <div>
                <dt className="inline font-extrabold">Worth exploring: </dt>
                <dd className="inline">
                  {check.explore.map((e, i) => (
                    <span key={e.self.key}>
                      {i > 0 && ", "}
                      <Link href={`/me/selves/${e.self.key}`} className="underline underline-offset-4">
                        {e.self.name}
                      </Link>
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          )
        ) : (
          <p className="mt-1.5 text-lg font-extrabold leading-snug" style={onBand}>
            25 short statements that point you to a good place to start. No score, and only you see it.
          </p>
        )}
        <Link
          href={check ? "/me/self-check/result" : "/me/self-check"}
          className="mt-3 inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-extrabold text-white"
          style={{ background: NAVY }}
        >
          {check ? "See it" : "Take the self-check"}
        </Link>
      </section>

      <section aria-labelledby="me-cards">
        <h2 id="me-cards" className="text-2xl font-extrabold text-[--navy]" style={display}>
          Your four cards
        </h2>
        <p className="mt-1 text-sm font-semibold text-[--ink-muted]">
          One for each big question. They fill in as you do things on the map, in any order, and you can change
          what&apos;s on them whenever you like.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-start">
          {cards.map(({ group, colour, card }) => (
            <div key={group.key} className="space-y-2">
              <p className="text-sm font-bold text-[--ink-muted]">
                <Link href={`/grow#${group.key}`} className="font-extrabold text-[--ink] hover:underline">
                  {group.name}
                </Link>{" "}
                · {group.question}
              </p>
              {card ? (
                <IdentityCard card={card} colour={colour} />
              ) : (
                <div className="card p-5 text-sm text-[--ink-muted]">This card isn&apos;t available right now.</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
