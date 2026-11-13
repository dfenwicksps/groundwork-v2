// ─── Who the signed-in person is ─────────────────────────────────────────────
// Server-side only. Each lookup goes through row security: a person can read
// their own platform_admins row and their own staff rows and no one else's
// (docs/v3/visibility.md V-P1, V-A8), so this can't be used to find out about
// another account.

import { createServerClient } from "@/lib/supabase-server";

export type StaffRole = "school_admin" | "teacher";

export interface Roles {
  userId: string;
  platform: boolean;
  staff: { school_id: string; role: StaffRole }[];
}

export function isStaff(r: Roles): boolean {
  return r.platform || r.staff.length > 0;
}

export function adminSchoolIds(r: Roles): string[] {
  return r.staff.filter((s) => s.role === "school_admin").map((s) => s.school_id);
}

/** Where a member of staff lands after signing in. Students go to Home. */
export function staffHome(r: Roles): string | null {
  if (r.staff.some((s) => s.role === "teacher")) return "/teach";
  if (r.staff.length > 0) return "/school";
  if (r.platform) return "/platform";
  return null;
}

/**
 * The signed-in person's roles, or null when signed out. Takes up any staff
 * invite waiting for their confirmed email address first (V-A10), so a teacher
 * invited before they ever signed in is staff from their first page.
 */
export async function getRoles(): Promise<Roles | null> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = supabase as any;
  await db.rpc("accept_staff_invites");
  const [{ data: admin }, { data: staff }] = await Promise.all([
    db.from("platform_admins").select("user_id").eq("user_id", user.id),
    db.from("staff").select("school_id, role").eq("user_id", user.id),
  ]);
  return {
    userId: user.id,
    platform: (admin ?? []).length > 0,
    staff: (staff ?? []) as Roles["staff"],
  };
}
