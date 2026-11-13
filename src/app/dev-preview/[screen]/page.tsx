import { notFound } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import GrowMap from "@/components/v3/GrowMap";
import HomeView from "@/components/v3/HomeView";
import LevelView from "@/components/v3/LevelView";
import SelfView from "@/components/v3/SelfView";
import { LEVEL_MAP, allLevels, allPieces, findLevel, levelOfSelf, suggestNext } from "@/lib/v3/levelMap";
import { findSelf } from "@/lib/v3/selves";
import SelfCheckForm from "@/components/v3/SelfCheckForm";
import SelfCheckResult from "@/components/v3/SelfCheckResult";
import { resultWords, type Suggested } from "@/lib/v3/selfCheck";

const SAMPLE: Suggested = { steady: [1, 6], levels: [3, 4], selves: ["self-discipline", "self-trust", "self-regulation"] };

// For looking at the v3 screens on a developer's machine with no database and
// no sign-in, using made-up progress. It does not exist on the live site.
export default function DevPreview({ params, searchParams }: { params: { screen: string }; searchParams: { k?: string } }) {
  if (process.env.NODE_ENV === "production") notFound();
  const all = allPieces();
  const done = ["chapters-so-far", "strengths-mapping"];
  const k = searchParams.k ?? "";

  if (params.screen === "home" || params.screen === "home-new") {
    const d = params.screen === "home" ? done : [];
    const next = suggestNext(d, params.screen === "home" ? SAMPLE.levels : []);
    const nextLevel = next ? allLevels().filter((l) => l.level.pieces.indexOf(next.id) !== -1)[0]?.level ?? null : null;
    const checked = params.screen === "home";
    return (
      <AppShell>
        <HomeView checked={checked} explore={checked ? resultWords(SAMPLE).explore : []} name="Sam" next={next} nextLevel={nextLevel} started={d.length > 0} groups={LEVEL_MAP} classLine={params.screen === "home" ? "9B with Ms Nguyen" : null} />
      </AppShell>
    );
  }
  if (params.screen === "self-check") {
    return (
      <AppShell>
        <SelfCheckForm studentId={null} preview />
      </AppShell>
    );
  }
  if (params.screen === "self-check-result" || params.screen === "self-check-flat") {
    return (
      <AppShell>
        <SelfCheckResult
          words={resultWords(params.screen === "self-check-flat" ? { steady: [], levels: [], selves: [] } : SAMPLE)}
          takenAt="2026-11-13T02:00:00Z"
          previous={params.screen === "self-check-flat" ? null : { words: resultWords({ steady: [6], levels: [2, 3], selves: ["self-compassion", "self-discipline"] }), takenAt: "2026-08-03T02:00:00Z" }}
          retakeOn="2027-01-22T02:00:00Z"
        />
      </AppShell>
    );
  }
  if (params.screen === "grow") {
    return (
      <AppShell>
        <GrowMap groups={LEVEL_MAP} classLine="9B with Ms Nguyen" checked suggested={SAMPLE.selves} />
      </AppShell>
    );
  }
  if (params.screen === "level") {
    const found = findLevel(k || "know-myself");
    if (!found) notFound();
    return (
      <AppShell>
        <LevelView group={found.group} level={found.level} pieces={found.level.pieces.map((id) => all[id])} doneIds={done} />
      </AppShell>
    );
  }
  if (params.screen === "self") {
    const self = findSelf(k || "self-efficacy");
    const found = levelOfSelf(k || "self-efficacy");
    if (!self || !found) notFound();
    return (
      <AppShell>
        <SelfView group={found.group} level={found.level} self={self} pieces={found.level.pieces.map((id) => all[id])} doneIds={done} />
      </AppShell>
    );
  }
  notFound();
}
