"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface Joined {
  class_name: string;
  year_level: number;
  teacher_name: string | null;
}

export default function JoinForm() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState<Joined | null>(null);
  const [failed, setFailed] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFailed(false);
    const { data, error } = await (createClient() as any).rpc("join_class", { p_code: code });
    setBusy(false);
    const row = (data ?? [])[0] as Joined | undefined;
    if (error || !row) {
      setFailed(true);
      return;
    }
    setJoined(row);
  }

  if (joined) {
    return (
      <div className="card p-5 space-y-3" role="status">
        <p className="font-semibold text-[--ink]">
          You&apos;ve joined {joined.class_name}
          {joined.teacher_name ? ` with ${joined.teacher_name}` : ""}.
        </p>
        <p className="text-sm text-[--ink-muted]">
          Year {joined.year_level}. Your teacher can see that you&apos;re in the class. They can&apos;t read
          anything you write unless you choose to share it.
        </p>
        <Link href="/dashboard" className="btn btn-primary inline-flex">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <div>
        <label htmlFor="class-code" className="block text-sm font-medium text-[--ink] mb-1.5">
          Class code
        </label>
        <input
          id="class-code"
          className="input uppercase tracking-widest"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={6}
          aria-describedby={failed ? "class-code-error" : undefined}
          required
        />
      </div>
      {failed && (
        <p id="class-code-error" role="alert" className="text-sm text-[--ink]">
          That code didn&apos;t work. Check it with your teacher and try again. After a few wrong tries
          you&apos;ll need to wait ten minutes.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={busy || code.length !== 6}>
          {busy ? "Joining…" : "Join"}
        </button>
        <Link href="/dashboard" className="text-sm text-[--ink-muted] hover:underline">
          I&apos;m using Groundwork on my own
        </Link>
      </div>
    </form>
  );
}
