import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StaffShell from "@/components/v3/StaffShell";
import { createServerClient } from "@/lib/supabase-server";
import { adminSchoolIds, getRoles } from "@/lib/v3/roles";
import { ArchiveClassButton, CreateClassForm, InviteForm, WithdrawInviteButton } from "./SchoolForms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "School" };

interface StaffRow { user_id: string; display_name: string | null; role: string }
interface InviteRow { id: string; email: string; role: string }
interface ClassRow { id: string; name: string; year_level: number; teacher_id: string | null; join_code: string }

const ROLE_LABEL: Record<string, string> = { school_admin: "School admin", teacher: "Teacher" };

// One page for the first working version: staff, invites and classes.
// docs/v3/navigation.md splits these across /school/staff and /school/classes.
export default async function SchoolPage() {
  const roles = await getRoles();
  if (!roles) redirect("/auth");
  const schoolIds = adminSchoolIds(roles);
  if (schoolIds.length === 0) redirect(roles.staff.length > 0 ? "/teach" : "/dashboard");

  const db = createServerClient() as any;
  const schools = await Promise.all(
    schoolIds.map(async (id) => {
      const [{ data: school }, { data: staff }, { data: invites }, { data: classes }] = await Promise.all([
        db.from("schools").select("id, name, state").eq("id", id),
        db.rpc("school_staff", { p_school: id }),
        db.from("staff_invites").select("id, email, role").eq("school_id", id).order("created_at"),
        db.from("classes").select("id, name, year_level, teacher_id, join_code").eq("school_id", id).is("archived_at", null).order("name"),
      ]);
      return {
        id,
        name: ((school ?? [])[0]?.name ?? "School") as string,
        staff: (staff ?? []) as StaffRow[],
        invites: (invites ?? []) as InviteRow[],
        classes: (classes ?? []) as ClassRow[],
      };
    })
  );

  return (
    <StaffShell roles={roles} title="School">
      {schools.map((s) => {
        const nameOf = (id: string | null) => s.staff.find((p) => p.user_id === id)?.display_name || "No teacher yet";
        return (
          <div key={s.id} className="space-y-6">
            {schools.length > 1 && <h2 className="text-lg font-semibold text-navy">{s.name}</h2>}

            <section className="card space-y-4" aria-labelledby={`staff-${s.id}`}>
              <h2 id={`staff-${s.id}`} className="font-semibold text-[--ink]">Staff at {s.name}</h2>
              <ul className="divide-y divide-[--border] text-sm">
                {s.staff.map((p) => (
                  <li key={p.user_id} className="flex justify-between gap-3 py-2">
                    <span className="text-[--ink]">{p.display_name || "No name given"}</span>
                    <span className="text-[--ink-muted]">{ROLE_LABEL[p.role] ?? p.role}</span>
                  </li>
                ))}
                {s.invites.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                    <span className="text-[--ink]">{i.email}</span>
                    <span className="flex items-center gap-3 text-[--ink-muted]">
                      Invited as {(ROLE_LABEL[i.role] ?? i.role).toLowerCase()}
                      <WithdrawInviteButton inviteId={i.id} />
                    </span>
                  </li>
                ))}
              </ul>
              <InviteForm schoolId={s.id} invitedBy={roles.userId} allowAdmin />
              <p className="text-sm text-[--ink-muted]">
                Groundwork doesn&apos;t send the invitation email. Tell the person to sign in with this address;
                they become staff the first time they do.
              </p>
            </section>

            <section className="card space-y-4" aria-labelledby={`classes-${s.id}`}>
              <h2 id={`classes-${s.id}`} className="font-semibold text-[--ink]">Classes</h2>
              {s.classes.length === 0 ? (
                <p className="text-sm text-[--ink-muted]">No classes yet.</p>
              ) : (
                <ul className="divide-y divide-[--border] text-sm">
                  {s.classes.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                      <span className="text-[--ink]">
                        <span className="font-medium">{c.name}</span> · Year {c.year_level} · {nameOf(c.teacher_id)}
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="tracking-widest text-navy">{c.join_code}</span>
                        <ArchiveClassButton classId={c.id} name={c.name} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <CreateClassForm
                schoolId={s.id}
                teachers={s.staff.map((p) => ({ id: p.user_id, name: p.display_name || "No name given" }))}
              />
            </section>
          </div>
        );
      })}
    </StaffShell>
  );
}
