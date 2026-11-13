import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import SelfCheckForm from "@/components/v3/SelfCheckForm";
import { getStudentContext } from "@/lib/v3/progress";
import { canRetake } from "@/lib/v3/selfCheck";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "The self-check" };

export default async function SelfCheckPage() {
  const me = await getStudentContext();
  if (!me) redirect("/auth");
  // Once a term (spec section 6, rule 5): until then, the result is the page.
  const latest = me.checks[0];
  if (latest && !canRetake(latest.takenAt, new Date())) redirect("/me/self-check/result");
  return (
    <AppShell>
      <SelfCheckForm studentId={me.userId} />
    </AppShell>
  );
}
