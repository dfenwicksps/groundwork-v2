import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StaffShell from "@/components/v3/StaffShell";
import { createServerClient } from "@/lib/supabase-server";
import { getRoles, isStaff } from "@/lib/v3/roles";
import { NewCodeButton, RemoveStudentButton } from "./ClassActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Class" };

export default async function ClassPage({ params }: { params: { id: string } }) {
  const roles = await getRoles();
  if (!roles) redirect("/auth");
  if (!isStaff(roles)) redirect("/dashboard");

  const db = createServerClient() as any;
  // Row security returns the class only to its teacher or its school's admin.
  const { data: rows } = await db.from("classes").select("id, name, year_level, join_code").eq("id", params.id);
  const cls = (rows ?? [])[0] as { id: string; name: string; year_level: number; join_code: string } | undefined;
  if (!cls) notFound();

  // Names and join dates only (class_roster(), V-T5).
  const { data: roster } = await db.rpc("class_roster", { p_class: cls.id });
  const students = (roster ?? []) as { student_id: string; display_name: string | null; joined_at: string }[];

  return (
    <StaffShell roles={roles} title={cls.name}>
      <section className="card p-5 space-y-3" aria-labelledby="code-heading">
        <h2 id="code-heading" className="font-semibold text-[--ink]">Class code</h2>
        <p className="text-3xl font-semibold tracking-[0.3em] text-navy" aria-label={`Class code ${cls.join_code.split("").join(" ")}`}>
          {cls.join_code}
        </p>
        <p className="text-sm text-[--ink-muted]">
          Year {cls.year_level}. Students sign in, choose &ldquo;Join your class&rdquo; and type this code.
        </p>
        <NewCodeButton classId={cls.id} />
      </section>

      <section className="card p-5 space-y-3" aria-labelledby="roster-heading">
        <h2 id="roster-heading" className="font-semibold text-[--ink]">
          Students who have joined ({students.length})
        </h2>
        {students.length === 0 ? (
          <p className="text-sm text-[--ink-muted]">Nobody has joined yet.</p>
        ) : (
          <ul className="divide-y divide-[--border]">
            {students.map((s) => (
              <li key={s.student_id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-[--ink]">{s.display_name || "No name given"}</span>
                <RemoveStudentButton classId={cls.id} studentId={s.student_id} name={s.display_name || "this student"} />
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-[--ink-muted]">
          Names only. Nothing a student writes or answers appears here.
        </p>
      </section>

      <p className="text-sm">
        <Link href={`/teach/patterns/${cls.id}`} className="font-medium text-[--teal] hover:underline">
          Class patterns
        </Link>
      </p>
    </StaffShell>
  );
}
