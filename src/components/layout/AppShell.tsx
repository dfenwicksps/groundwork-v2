"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Home",
    match: (p: string) => p === "/dashboard" || p === "/",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M3.5 11.5L11 4.5l7.5 7"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 9.5V17a.5.5 0 0 0 .5.5H9v-4.5h4V17.5h3a.5.5 0 0 0 .5-.5V9.5"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/missions/1",
    label: "Journey",
    match: (p: string) => p.startsWith("/missions"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle
          cx="11"
          cy="11"
          r="7.5"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.6"}
        />
        <path
          d="M11 7.5v3.5l2.5 2"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 3.5V4.5M11 17.5V18.5M3.5 11H4.5M17.5 11H18.5"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.6"}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/journal",
    label: "Journal",
    match: (p: string) => p.startsWith("/journal") || p.startsWith("/revisit"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect
          x="4.5"
          y="3.5"
          width="13"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.6"}
        />
        <path
          d="M7.5 8h7M7.5 11h7M7.5 14h4"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.6"}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/me",
    label: "Me",
    match: (p: string) => p.startsWith("/me") || p.startsWith("/settings"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle
          cx="11"
          cy="8"
          r="3.5"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.6"}
        />
        <path
          d="M4.5 18.5C4.5 15.46 7.46 13 11 13c3.54 0 6.5 2.46 6.5 5.5"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.6"}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[--surface-muted]">
      <main className="pb-nav">{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/96 backdrop-blur-md border-t border-[--border]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="max-w-lg mx-auto px-1">
          <div className="flex items-center justify-around h-16">
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl min-w-[60px] transition-all duration-150",
                    active
                      ? "text-[--teal]"
                      : "text-[--ink-muted] hover:text-[--ink]"
                  )}
                >
                  {item.icon(active)}
                  <span
                    className={cn(
                      "text-[11px] font-semibold tracking-wide leading-none",
                      active ? "text-[--teal]" : "text-[--ink-muted]"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
