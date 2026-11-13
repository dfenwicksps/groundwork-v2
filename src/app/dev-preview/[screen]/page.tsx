import { notFound } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import GrowMap from "@/components/v3/GrowMap";
import HomeView from "@/components/v3/HomeView";
import LevelView from "@/components/v3/LevelView";
import SelfView from "@/components/v3/SelfView";
import { LEVEL_MAP, allLevels, allPieces, findLevel, levelOfSelf, suggestNext } from "@/lib/v3/levelMap";
import { findSelf } from "@/lib/v3/selves";

// For looking at the v3 screens on a developer's machine with no database and
// no sign-in, using made-up progress. It does not exist on the live site.
export default function DevPreview({ params, searchParams }: { params: { screen: string }; searchParams: { k?: string } }) {
  if (process.env.NODE_ENV === "production") notFound();
  const all = allPieces();
  const done = ["chapters-so-far", "strengths-mapping"];
  const k = searchParams.k ?? "";

  if (params.screen === "home" || params.screen === "home-new") {
    const d = params.screen === "home" ? done : [];
    const next = suggestNext(d);
    const nextLevel = next ? allLevels().filter((l) => l.level.pieces.indexOf(next.id) !== -1)[0]?.level ?? null : null;
    return (
      <AppShell>
        <HomeView name="Sam" next={next} nextLevel={nextLevel} started={d.length > 0} groups={LEVEL_MAP} classLine={params.screen === "home" ? "9B with Ms Nguyen" : null} />
      </AppShell>
    );
  }
  if (params.screen === "grow") {
    return (
      <AppShell>
        <GrowMap groups={LEVEL_MAP} classLine="9B with Ms Nguyen" />
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
