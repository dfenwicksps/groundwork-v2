import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import HomeView from "@/components/v3/HomeView";
import { LEVEL_MAP, allLevels, suggestNext } from "@/lib/v3/levelMap";
import { getStudentContext } from "@/lib/v3/progress";
import { resultWords } from "@/lib/v3/selfCheck";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const me = await getStudentContext();
  if (!me) redirect("/auth");
  const latest = me.checks[0];
  const words = latest ? resultWords(latest.suggested) : null;
  const next = suggestNext(me.doneIds, latest ? latest.suggested.levels : []);
  const nextLevel = next ? allLevels().filter((l) => l.level.pieces.indexOf(next.id) !== -1)[0]?.level ?? null : null;
  return (
    <AppShell>
      <HomeView
        name={me.name}
        next={next}
        nextLevel={nextLevel}
        started={me.doneIds.length > 0}
        groups={LEVEL_MAP}
        classLine={me.classLine}
        checked={!!latest}
        explore={words ? words.explore : []}
      />
    </AppShell>
  );
}
