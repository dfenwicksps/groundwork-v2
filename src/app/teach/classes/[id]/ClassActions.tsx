"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

export function NewCodeButton({ classId }: { classId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function go() {
    if (!window.confirm("Make a new code? The old code stops working. Students already in the class stay in it.")) return;
    setBusy(true);
    setFailed(false);
    const { data, error } = await (createClient() as any).rpc("regenerate_join_code", { p_class: classId });
    setBusy(false);
    if (error || !data) setFailed(true);
    else router.refresh();
  }

  return (
    <div>
      <button type="button" className="btn btn-secondary" onClick={go} disabled={busy}>
        {busy ? "Making a new code…" : "New code"}
      </button>
      {failed && <p role="alert" className="mt-2 text-sm text-[--ink]">That didn&apos;t work. Try again.</p>}
    </div>
  );
}

export function RemoveStudentButton({ classId, studentId, name }: { classId: string; studentId: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!window.confirm(`Remove ${name} from this class? Their own work stays theirs. Anything they shared with you is taken back.`)) return;
    setBusy(true);
    await (createClient() as any).rpc("remove_from_class", { p_class: classId, p_student: studentId });
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" className="text-sm text-[--ink-muted] hover:underline" onClick={go} disabled={busy}>
      {busy ? "Removing…" : "Remove"}
    </button>
  );
}
