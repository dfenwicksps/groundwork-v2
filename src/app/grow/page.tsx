import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import GrowMap from "@/components/v3/GrowMap";
import { LEVEL_MAP } from "@/lib/v3/levelMap";
import { getStudentContext } from "@/lib/v3/progress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "The map" };

export default async function GrowPage() {
  const me = await getStudentContext();
  if (!me) redirect("/auth");
  return (
    <AppShell>
      <GrowMap groups={LEVEL_MAP} classLine={me.classLine} />
    </AppShell>
  );
}
