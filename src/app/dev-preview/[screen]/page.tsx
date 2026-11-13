import { notFound } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import GrowMap from "@/components/v3/GrowMap";
import HomeView from "@/components/v3/HomeView";
import LevelView from "@/components/v3/LevelView";
import SelfView from "@/components/v3/SelfView";
import { GROUP_MISSION, LEVEL_MAP, allLevels, allPieces, findLevel, levelOfSelf, suggestNext } from "@/lib/v3/levelMap";
import { findSelf } from "@/lib/v3/selves";
import { MISSIONS, getMission } from "@/lib/missions";
import MeCards from "@/components/v3/MeCards";
import { PROGRAM_WEEKS } from "@/lib/program";
import { shownStep } from "@/lib/v3/shownStep";
import ActivityClient from "@/app/missions/[id]/activities/[activityId]/ActivityClient";
import WeekClient from "@/app/program/[week]/WeekClient";
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
  if (params.screen === "step") {
    const m = MISSIONS.filter((x) => x.activities.some((a) => a.id === (k || "contribution-map")))[0];
    const a = m?.activities.filter((x) => x.id === (k || "contribution-map"))[0];
    if (!m || !a) notFound();
    const shown = shownStep(m, a);
    return (
      <main id="main-content">
        <ActivityClient
          mission={shown.mission}
          activity={shown.activity}
          userId="00000000-0000-4000-8000-000000000000"
          isCompleted={false}
          existingEntry={null}
          existingChallenge={null}
          lifeStage="junior"
          phase={1}
          aiReflectionsEnabled={false}
        />
      </main>
    );
  }
  if (params.screen === "week") {
    const week = PROGRAM_WEEKS.filter((w) => String(w.week) === (k || "4"))[0];
    if (!week) notFound();
    const sample: any = {
      userId: "00000000-0000-4000-8000-000000000000", week, progress: null, savedCode: [], savedStory: null,
      compass: { strengths: [], strengthKeys: [], values: [] }, becoming: { qualities: [], working: [] },
      sourceEntries: {}, capstone: [], storyEarlier: [], suggestedQualities: [], earlier: [], lifeStage: "junior", ready: true,
    };
    return <WeekClient {...sample} />;
  }
  if (params.screen === "me-cards") {
    const piece = (key: string, label: string, activityId: string, stepTitle: string, text: string, chips: string[] = []) =>
      ({ key, label, activityId, stepTitle, text, chips, done: !!text || chips.length > 0 }) as any;
    const sample: Record<string, any> = {
      identity: { title: "Who I am", missionId: 1, filled: 2, pieces: [
        piece("strengths", "My top strengths", "strengths-mapping", "Strengths Mapping", "", ["Kindness", "Curiosity", "Humour"]),
        piece("values", "What I stand for", "values-clarifier", "Values Clarifier", "", ["Honesty", "Loyalty"]),
        piece("mask", "Where I'm most myself", "mask-check", "The Mask Check", ""),
        piece("experiment", "My experiment", "weekly-challenge", "Live It Once", ""),
      ] },
      purpose: { title: "My purpose", missionId: 2, filled: 0, pieces: [
        piece("matters", "What matters to me", "what-matters", "What Matters", ""),
        piece("bring", "What I can bring", "contribution-map", "The Contribution Map", ""),
        piece("step", "My real step", "purpose-challenge", "One Real Step", ""),
      ] },
      connection: { title: "My people", missionId: 3, filled: 3, doneText: "All filled in. This is where you belong and who's part of your story, for now.", pieces: [
        piece("belong", "Where I belong", "belonging", "Where You Belong", "With my cousins, and at training."),
        piece("gap", "Across the gap", "across-the-gap", "Across the Gap", "My grandad."),
        piece("reach", "Reaching out", "connection-challenge", "Reach Out Once", "Messaged Jo."),
      ] },
      meaning: null,
    };
    return (
      <AppShell>
        <div className="page">
          <MeCards
            check={k === "none" ? null : resultWords(SAMPLE)}
            cards={LEVEL_MAP.map((group) => ({ group, colour: getMission(GROUP_MISSION[group.key])?.colour ?? "var(--navy)", card: sample[group.key] }))}
          />
        </div>
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
