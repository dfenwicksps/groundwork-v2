import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import SelfView from "@/components/v3/SelfView";
import { allPieces, levelOfSelf } from "@/lib/v3/levelMap";
import { getStudentContext } from "@/lib/v3/progress";
import { findSelf } from "@/lib/v3/selves";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { key: string } }): Metadata {
  return { title: findSelf(params.key)?.name ?? "The map" };
}

export default async function SelfPage({ params }: { params: { key: string } }) {
  const self = findSelf(params.key);
  const found = levelOfSelf(params.key);
  if (!self || !found) notFound();
  const me = await getStudentContext();
  if (!me) redirect("/auth");
  const all = allPieces();
  return (
    <AppShell>
      <SelfView
        group={found.group}
        level={found.level}
        self={self}
        pieces={found.level.pieces.map((id) => all[id]).filter(Boolean)}
        doneIds={me.doneIds}
      />
    </AppShell>
  );
}
