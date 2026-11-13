import Link from "next/link";
import GetHelpButton from "@/components/help/GetHelpButton";
import type { Roles } from "@/lib/v3/roles";

/**
 * The frame around the teacher, school and platform pages. Staff pages never
 * show an individual student's work (docs/v3/visibility.md); this shell holds
 * nothing but links between them.
 */
export default function StaffShell({
  roles,
  title,
  children,
}: {
  roles: Roles;
  title: string;
  children: React.ReactNode;
}) {
  // A school admin can be a class's teacher too, so any staff member gets the link.
  const teaches = roles.staff.length > 0;
  const admins = roles.staff.some((s) => s.role === "school_admin");
  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="bg-white border-b border-[--border]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-semibold text-navy" style={{ fontFamily: "var(--font-display)" }}>
            Groundwork
          </span>
          <nav aria-label="Staff" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
            {teaches && <Link href="/teach" className="text-[--ink] hover:underline">My classes</Link>}
            {admins && <Link href="/school" className="text-[--ink] hover:underline">School</Link>}
            {roles.platform && <Link href="/platform" className="text-[--ink] hover:underline">Platform</Link>}
            <Link href="/grow" className="text-[--ink-muted] hover:underline">Student view</Link>
            <Link href="/settings" className="text-[--ink-muted] hover:underline">Settings</Link>
          </nav>
          <span className="ml-auto"><GetHelpButton variant="inline" /></span>
        </div>
      </header>
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold text-[--ink]" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
        {children}
      </main>
    </div>
  );
}
