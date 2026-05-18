"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 10.5L10 3.5l7 7"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 8.5V15.5a.5.5 0 0 0 .5.5H8.5v-4h3v4h3a.5.5 0 0 0 .5-.5V8.5"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/missions/1",
    label: "Missions",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="10"
          r="7"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.5"}
        />
        <circle cx="10" cy="10" r="2.5" fill="currentColor" />
        <path
          d="M10 3v2M10 15v2M3 10h2M15 10h2"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "Journal",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="4"
          y="3"
          width="12"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.5"}
        />
        <path
          d="M7 7h6M7 10h6M7 13h4"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/stories",
    label: "Stories",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 4C7 4 4.5 6 4.5 8.5c0 2 1.3 3.7 3.2 4.4L10 16l2.3-3.1c1.9-.7 3.2-2.4 3.2-4.4C15.5 6 13 4 10 4z"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/support",
    label: "Support",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13.5 6.5C13.5 8.43 11.93 10 10 10C8.07 10 6.5 8.43 6.5 6.5C6.5 4.57 8.07 3 10 3C11.93 3 13.5 4.57 13.5 6.5Z"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.5"}
        />
        <path
          d="M4 17C4 14.24 6.69 12 10 12C13.31 12 16 14.24 16 17"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 bg-navy rounded-md flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">G</span>
            </div>
            <span
              className="font-semibold text-navy text-base"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Groundwork
            </span>
          </Link>

          <button
            onClick={handleSignOut}
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-surface-border safe-area-pb">
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex items-center justify-around h-16">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href.split("/")[1] === "missions" ? "/missions" : item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                    active
                      ? "text-navy"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  {item.icon(active)}
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      active ? "text-navy" : "text-ink-muted"
                    )}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <div className="absolute bottom-0 w-1 h-1 rounded-full bg-navy" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
