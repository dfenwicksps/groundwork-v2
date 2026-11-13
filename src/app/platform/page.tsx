import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StaffShell from "@/components/v3/StaffShell";
import { createServerClient } from "@/lib/supabase-server";
import { getRoles } from "@/lib/v3/roles";
import { shownClassCount } from "@/lib/v3/patterns";
import { CreateSchoolForm, InviteForm, WithdrawInviteButton } from "../school/SchoolForms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Platform" };

const TOTAL_LABELS: Record<string, string> = {
  schools: "Schools",
  classes: "Classes",
  students_in_classes: "Students in a class",
  students_on_their_own: "Students using it on their own",
  self_checks_taken: "Students who have taken the self-check",
};

// The platform admin onboards schools and sees anonymous totals
// (platform_totals(), V-P3). No student, class roster or entry is readable here.
export default async function PlatformPage() {
  const roles = await getRoles();
  if (!roles) redirect("/auth");
  if (!roles.platform) redirect(roles.staff.length > 0 ? "/teach" : "/dashboard");

  const db = createServerClient() as any;
  const [{ data: totals }, { data: schools }, { data: invites }] = await Promise.all([
    db.rpc("platform_totals"),
    db.from("schools").select("id, name, state").order("name"),
    db.from("staff_invites").select("id, school_id, email, role").order("created_at"),
  ]);
  const schoolRows = (schools ?? []) as { id: string; name: string; state: string }[];
  const inviteRows = (invites ?? []) as { id: string; school_id: string; email: string; role: string }[];

  return (
    <StaffShell roles={roles} title="Platform">
      <section className="card p-5" aria-labelledby="totals-heading">
        <h2 id="totals-heading" className="font-semibold text-[--ink] mb-2">Totals</h2>
        <dl className="divide-y divide-[--border] text-sm">
          {((totals ?? []) as { key: string; total: number | null }[]).map((t) => (
            <div key={t.key} className="flex justify-between gap-3 py-2">
              <dt className="text-[--ink]">{TOTAL_LABELS[t.key] ?? t.key}</dt>
              <dd className="text-[--ink]">{shownClassCount(t.total)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-[--ink-muted]">A dash means a count of students too small to show.</p>
      </section>

      <section className="card p-5 space-y-4" aria-labelledby="schools-heading">
        <h2 id="schools-heading" className="font-semibold text-[--ink]">Schools</h2>
        {schoolRows.length === 0 && <p className="text-sm text-[--ink-muted]">No schools yet.</p>}
        {schoolRows.map((s) => (
          <div key={s.id} className="space-y-3 border-b border-[--border] pb-4">
            <p className="text-sm">
              <span className="font-medium text-[--ink]">{s.name}</span>{" "}
              <span className="text-[--ink-muted]">· {s.state}</span>
            </p>
            <ul className="text-sm space-y-1">
              {inviteRows.filter((i) => i.school_id === s.id).map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-3 text-[--ink-muted]">
                  <span className="text-[--ink]">{i.email}</span> invited as {i.role === "school_admin" ? "school admin" : "teacher"}
                  <WithdrawInviteButton inviteId={i.id} />
                </li>
              ))}
            </ul>
            <InviteForm schoolId={s.id} invitedBy={roles.userId} allowAdmin={false} />
          </div>
        ))}
        <CreateSchoolForm />
        <p className="text-sm text-[--ink-muted]">
          Inviting an address here makes that person the school&apos;s admin the first time they sign in with it.
          Groundwork doesn&apos;t send the email.
        </p>
      </section>
    </StaffShell>
  );
}
