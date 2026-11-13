import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import StaffShell from "@/components/v3/StaffShell";
import { createServerClient } from "@/lib/supabase-server";
import { getRoles, isStaff } from "@/lib/v3/roles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My classes" };

export default async function TeachPage() {
  const roles = await getRoles();
  if (!roles) redirect("/auth");
  if (!isStaff(roles)) redirect("/dashboard");

  const { data } = await (createServerClient() as any)
    .from("classes")
    .select("id, name, year_level, archived_at")
    .eq("teacher_id", roles.userId)
    .is("archived_at", null)
    .order("name");
  const classes = (data ?? []) as { id: string; name: string; year_level: number }[];

  return (
    <StaffShell roles={roles} title="My classes">
      {classes.length === 0 ? (
        <div className="card p-5 text-sm text-[--ink-muted]">
          You don&apos;t have a class yet. Your school&apos;s Groundwork admin creates classes and assigns a
          teacher to each.
        </div>
      ) : (
        <ul className="space-y-3">
          {classes.map((c) => (
            <li key={c.id} className="card p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[--ink]">{c.name}</p>
                <p className="text-sm text-[--ink-muted]">Year {c.year_level}</p>
              </div>
              <div className="flex gap-4 text-sm font-medium">
                <Link href={`/teach/classes/${c.id}`} className="text-[--teal] hover:underline">
                  Code and students
                </Link>
                <Link href={`/teach/patterns/${c.id}`} className="text-[--teal] hover:underline">
                  Class patterns
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-[--ink-muted]">
        You see who is in each class and whole-class patterns. You never see what a student wrote or
        answered, unless they choose to share an entry with you.
      </p>
    </StaffShell>
  );
}
