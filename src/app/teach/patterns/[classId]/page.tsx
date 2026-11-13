import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StaffShell from "@/components/v3/StaffShell";
import { createServerClient } from "@/lib/supabase-server";
import { getRoles, isStaff } from "@/lib/v3/roles";
import { patternLabel, shownClassCount, type PatternRow } from "@/lib/v3/patterns";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Class patterns" };

// Reads class_patterns() and nothing else (docs/v3/visibility.md, section 4).
// The database decides what is hidden; this page only draws what it's given.
export default async function PatternsPage({ params }: { params: { classId: string } }) {
  const roles = await getRoles();
  if (!roles) redirect("/auth");
  if (!isStaff(roles)) redirect("/dashboard");

  const db = createServerClient() as any;
  const { data: rows } = await db.from("classes").select("id, name").eq("id", params.classId);
  const cls = (rows ?? [])[0] as { id: string; name: string } | undefined;
  if (!cls) notFound();

  const { data } = await db.rpc("class_patterns", { p_class: cls.id });
  const patterns = (data ?? []) as PatternRow[];
  const tooSmall = patterns.some((p) => p.section === "class" && p.key === "too_small");

  return (
    <StaffShell roles={roles} title={`${cls.name}: class patterns`}>
      {tooSmall ? (
        <div className="card text-sm text-[--ink]">
          This class is too small to show patterns for. Patterns appear once enough students have joined.
        </div>
      ) : (
        <div className="card">
          <table className="w-full text-sm">
            <caption className="sr-only">Whole-class patterns</caption>
            <thead>
              <tr className="text-left text-[--ink-muted]">
                <th scope="col" className="py-2 font-medium">What</th>
                <th scope="col" className="py-2 font-medium text-right">Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {patterns.map((p) => (
                <tr key={`${p.section}/${p.key}`}>
                  <th scope="row" className="py-2 font-normal text-[--ink]">{patternLabel(p)}</th>
                  <td className="py-2 text-right text-[--ink]">{shownClassCount(p.students)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-sm text-[--ink-muted]">
        A dash means the figure is hidden so that no small group of students can be picked out. Figures
        update once a day.
      </p>
      <p className="text-sm">
        <Link href={`/teach/classes/${cls.id}`} className="font-medium text-[--teal] hover:underline">
          Code and students
        </Link>
      </p>
    </StaffShell>
  );
}
