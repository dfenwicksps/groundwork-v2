import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import LevelView from "@/components/v3/LevelView";
import { allPieces, findLevel } from "@/lib/v3/levelMap";
import { getStudentContext } from "@/lib/v3/progress";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { level: string } }): Metadata {
  return { title: findLevel(params.level)?.level.name ?? "The map" };
}

export default async function LevelPage({ params }: { params: { level: string } }) {
  const found = findLevel(params.level);
  if (!found) notFound();
  const me = await getStudentContext();
  if (!me) redirect("/auth");
  const all = allPieces();
  return (
    <AppShell>
      <LevelView
        group={found.group}
        level={found.level}
        pieces={found.level.pieces.map((id) => all[id]).filter(Boolean)}
        doneIds={me.doneIds}
      />
    </AppShell>
  );
}
