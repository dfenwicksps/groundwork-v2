import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { createServerClient } from "@/lib/supabase-server";
import { LEVEL_MAP, allPieces } from "@/lib/v3/levelMap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Grow" };

interface MyClass {
  class_id: string;
  class_name: string;
  year_level: number;
  teacher_name: string | null;
}

// The map (docs/v3/level-map.md): four names, seven levels, every activity.
// Any order. No numbers, locks, ticks or bars (D3, D52): the page says what's
// here and lets the student choose.
export default async function GrowPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data } = await (supabase as any).rpc("my_classes");
  const classes = (data ?? []) as MyClass[];
  const pieces = allPieces();

  return (
    <AppShell>
      <div className="page-read py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-[--ink]" style={{ fontFamily: "var(--font-display)" }}>
            Grow
          </h1>
          <p className="text-[--ink-muted]">
            Everything here is open. Start wherever feels useful and go in any order.
          </p>
          {classes.length > 0 ? (
            <p className="text-sm text-[--ink-muted]">
              {classes.map((c) => `${c.class_name}${c.teacher_name ? ` with ${c.teacher_name}` : ""}`).join(" · ")}
            </p>
          ) : (
            <p className="text-sm">
              <Link href="/join" className="font-medium text-[--teal] hover:underline">
                Got a class code? Join your class
              </Link>
            </p>
          )}
        </header>

        {LEVEL_MAP.map((group) => (
          <section key={group.key} aria-labelledby={`group-${group.key}`} className="space-y-4">
            <div>
              <h2 id={`group-${group.key}`} className="text-lg font-semibold text-navy">
                {group.name}
              </h2>
              <p className="text-sm text-[--ink-muted]">{group.question}</p>
            </div>

            {group.levels.map((level) => (
              <div key={level.key} className="card space-y-4">
                <h3 className="text-base font-semibold text-[--ink]">{level.name}</h3>

                <ul className="space-y-1.5">
                  {level.selves.map((s) => (
                    <li key={s.key} className="text-sm">
                      <span className="font-medium text-[--ink]">{s.name}.</span>{" "}
                      <span className="text-[--ink-muted]">{s.short}</span>
                    </li>
                  ))}
                </ul>

                <ul className="divide-y divide-[--border] border-t border-[--border]">
                  {level.pieces.map((id) => {
                    const p = pieces[id];
                    if (!p) return null;
                    return (
                      <li key={id}>
                        <Link
                          href={p.href}
                          className="flex items-baseline justify-between gap-3 py-2.5 text-sm hover:text-[--teal]"
                        >
                          <span className="font-medium text-[--ink]">{p.title}</span>
                          <span className="shrink-0 text-xs text-[--ink-muted]">
                            {p.from}
                            {p.optional ? " · optional" : ""}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </AppShell>
  );
}
