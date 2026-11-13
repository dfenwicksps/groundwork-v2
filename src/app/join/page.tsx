import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { createServerClient } from "@/lib/supabase-server";
import JoinForm from "./JoinForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Join a class" };

export default async function JoinPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return (
    <AppShell>
      <div className="page-read py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-[--ink]" style={{ fontFamily: "var(--font-display)" }}>
            Join a class
          </h1>
          <p className="text-[--ink-muted]">
            Your teacher has a six-character code for your class. Type it in below.
          </p>
        </header>
        <JoinForm />
      </div>
    </AppShell>
  );
}
