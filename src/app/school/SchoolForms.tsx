"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

// Every write here goes through row security: the database, not this file,
// decides whether the signed-in person may do it (docs/v3/visibility.md).

const db = () => createClient() as any;

export function InviteForm({ schoolId, invitedBy, allowAdmin }: { schoolId: string; invitedBy: string; allowAdmin: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(allowAdmin ? "teacher" : "school_admin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await db().from("staff_invites").insert({
      school_id: schoolId,
      email: email.trim().toLowerCase(),
      role,
      invited_by: invitedBy,
    });
    setBusy(false);
    if (error) {
      setMessage(error.code === "23505" ? "That address has already been invited." : "That didn't work. Check the address and try again.");
      return;
    }
    setEmail("");
    router.refresh();
  }

  const id = `invite-${schoolId}`;
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grow min-w-[14rem]">
          <label htmlFor={`${id}-email`} className="block text-sm font-medium text-[--ink] mb-1.5">
            Invite by school email address
          </label>
          <input
            id={`${id}-email`}
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        {allowAdmin && (
          <div>
            <label htmlFor={`${id}-role`} className="block text-sm font-medium text-[--ink] mb-1.5">As</label>
            <select id={`${id}-role`} className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="teacher">Teacher</option>
              <option value="school_admin">School admin</option>
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Inviting…" : "Invite"}
        </button>
      </div>
      {message && <p role="alert" className="text-sm text-[--ink]">{message}</p>}
    </form>
  );
}

export function WithdrawInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    await db().from("staff_invites").delete().eq("id", inviteId);
    setBusy(false);
    router.refresh();
  }
  return (
    <button type="button" className="text-sm text-[--ink-muted] hover:underline" onClick={go} disabled={busy}>
      {busy ? "Withdrawing…" : "Withdraw"}
    </button>
  );
}

export function CreateClassForm({ schoolId, teachers }: { schoolId: string; teachers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [year, setYear] = useState("9");
  const [teacher, setTeacher] = useState(teachers[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFailed(false);
    const { error } = await db().from("classes").insert({
      school_id: schoolId,
      name: name.trim(),
      year_level: Number(year),
      teacher_id: teacher || null,
    });
    setBusy(false);
    if (error) {
      setFailed(true);
      return;
    }
    setName("");
    router.refresh();
  }

  const id = `class-${schoolId}`;
  return (
    <form onSubmit={submit} className="space-y-3 border-t border-[--border] pt-4">
      <p className="text-sm font-medium text-[--ink]">New class</p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grow min-w-[10rem]">
          <label htmlFor={`${id}-name`} className="block text-sm text-[--ink] mb-1.5">Name</label>
          <input id={`${id}-name`} className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
        </div>
        <div>
          <label htmlFor={`${id}-year`} className="block text-sm text-[--ink] mb-1.5">Year</label>
          <select id={`${id}-year`} className="input" value={year} onChange={(e) => setYear(e.target.value)}>
            {[7, 8, 9, 10, 11, 12].map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-teacher`} className="block text-sm text-[--ink] mb-1.5">Teacher</label>
          <select id={`${id}-teacher`} className="input" value={teacher} onChange={(e) => setTeacher(e.target.value)}>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
            <option value="">No teacher yet</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Creating…" : "Create class"}
        </button>
      </div>
      {failed && <p role="alert" className="text-sm text-[--ink]">That didn&apos;t work. Check the name and try again.</p>}
    </form>
  );
}

export function ArchiveClassButton({ classId, name }: { classId: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    if (!window.confirm(`Archive ${name}? Its code stops working and it leaves everyone's lists. Students keep their own work.`)) return;
    setBusy(true);
    await db().from("classes").update({ archived_at: new Date().toISOString() }).eq("id", classId);
    setBusy(false);
    router.refresh();
  }
  return (
    <button type="button" className="text-sm text-[--ink-muted] hover:underline" onClick={go} disabled={busy}>
      {busy ? "Archiving…" : "Archive"}
    </button>
  );
}

const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

export function CreateSchoolForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [state, setState] = useState("QLD");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFailed(false);
    const { error } = await db().from("schools").insert({ name: name.trim(), state });
    setBusy(false);
    if (error) {
      setFailed(true);
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grow min-w-[14rem]">
          <label htmlFor="school-name" className="block text-sm font-medium text-[--ink] mb-1.5">School name</label>
          <input id="school-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="school-state" className="block text-sm font-medium text-[--ink] mb-1.5">State</label>
          <select id="school-state" className="input" value={state} onChange={(e) => setState(e.target.value)}>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Adding…" : "Add school"}
        </button>
      </div>
      {failed && <p role="alert" className="text-sm text-[--ink]">That didn&apos;t work. Try again.</p>}
    </form>
  );
}
