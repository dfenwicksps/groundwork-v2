import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import SelfCheckResult from "@/components/v3/SelfCheckResult";
import { getStudentContext } from "@/lib/v3/progress";
import { canRetake, resultWords, retakeFrom } from "@/lib/v3/selfCheck";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your self-check" };

export default async function SelfCheckResultPage() {
  const me = await getStudentContext();
  if (!me) redirect("/auth");
  const latest = me.checks[0];
  if (!latest) redirect("/me/self-check");
  const before = me.checks[1];
  return (
    <AppShell>
      <SelfCheckResult
        words={resultWords(latest.suggested)}
        takenAt={latest.takenAt}
        previous={before ? { words: resultWords(before.suggested), takenAt: before.takenAt } : null}
        retakeOn={canRetake(latest.takenAt, new Date()) ? null : retakeFrom(latest.takenAt).toISOString()}
      />
    </AppShell>
  );
}
