"use client";

import { useState } from "react";
import Link from "next/link";
import BuildStamp from "@/components/BuildStamp";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/layout/AppShell";
import DeviceLockSettings from "./DeviceLockSettings";
import { clearLock } from "@/lib/deviceLock";
import { cn } from "@/lib/utils";
import { LIFE_STAGE_OPTIONS, saveLifeStage, type LifeStage } from "@/lib/lifeStage";

export default function SettingsClient({
  userId,
  email,
  displayName,
  savedValues,
  missionValues,
  initialLifeStage,
  aiReflectionsEnabled,
}: {
  userId: string;
  email: string;
  displayName: string;
  savedValues: string[];
  /** From Mission 1's Values Clarifier. Once these exist they're the student's values everywhere else. */
  missionValues: string[];
  initialLifeStage: LifeStage;
  aiReflectionsEnabled: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const db = supabase as any;

  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);


  const [lifeStage, setLifeStageState] = useState<LifeStage>(initialLifeStage);
  const [stageSaved, setStageSaved] = useState(false);

  const [aiEnabled, setAiEnabled] = useState(aiReflectionsEnabled);
  const [savingAi, setSavingAi] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [pwState, setPwState] = useState<"idle" | "saving" | "saved">("idle");
  const [pwError, setPwError] = useState<string | null>(null);

  async function toggleAiReflections() {
    const next = !aiEnabled;
    setAiEnabled(next);
    setSavingAi(true);
    await db.from("users").update({ ai_reflections_enabled: next }).eq("id", userId);
    setSavingAi(false);
  }

  async function handleSaveName() {
    setSaving(true);
    setNameError(null);
    const { error } = await db
      .from("users")
      .update({ display_name: name })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setNameError("Couldn't save your name — please try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      setPwError("Your new password needs at least 8 characters.");
      return;
    }
    setPwState("saving");
    setPwError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwState("idle");
      setPwError("Couldn't update your password — please try again.");
      return;
    }
    setNewPassword("");
    setPwState("saved");
    setTimeout(() => setPwState("idle"), 2500);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "delete my account") return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/delete-account", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setDeleteError(
          body?.error || "Something went wrong deleting your account. Please try again."
        );
        setDeleting(false);
        return;
      }
      // Account and all data are gone — end the (now-orphaned) session, and
      // drop this device's passcode, which guarded an account that's gone.
      await supabase.auth.signOut();
      clearLock();
      router.push("/");
    } catch {
      setDeleteError("Couldn't reach the server. Check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div data-animate="1">
          <h1
            className="text-3xl text-navy"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            Settings
          </h1>
        </div>

        {/* Profile */}
        <div data-animate="2" className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink">Profile</h2>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Display name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input flex-1"
              />
              <button
                onClick={handleSaveName}
                disabled={saving || name === displayName}
                className="btn btn-primary whitespace-nowrap"
              >
                {saved ? "Saved ✓" : saving ? "Saving…" : "Save"}
              </button>
            </div>
            {nameError && (
              <p role="alert" className="text-xs text-red-600 mt-1.5">{nameError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Email
            </label>
            <div className="input bg-surface-muted text-ink-muted cursor-not-allowed">
              {email}
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Email cannot be changed here.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Change password
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (8+ characters)"
                autoComplete="new-password"
                className="input flex-1"
              />
              <button
                onClick={handleChangePassword}
                disabled={pwState === "saving" || newPassword.length === 0}
                className="btn btn-primary whitespace-nowrap"
              >
                {pwState === "saved" ? "Updated ✓" : pwState === "saving" ? "Saving…" : "Update"}
              </button>
            </div>
            {pwError && (
              <p role="alert" className="text-xs text-red-600 mt-1.5">{pwError}</p>
            )}
          </div>
        </div>

        {/* Your values */}
        <div data-animate="3" className="card p-6">
          <h2 className="font-semibold text-ink mb-1">Your values</h2>
          {missionValues.length > 0 ? (
            <p className="text-sm text-ink-muted mb-4">
              From the Values Clarifier in Mission 1. These are the values the rest of the app
              shows you.
            </p>
          ) : savedValues.length > 0 ? (
            <p className="text-sm text-ink-muted mb-4">
              The three you picked when you started. Mission 1&apos;s Values Clarifier goes deeper,
              and once you&apos;ve done it, those become your values.
            </p>
          ) : (
            <p className="text-sm text-ink-muted mb-4">
              You&apos;ll choose these in Mission 1&apos;s Values Clarifier.
            </p>
          )}
          {(missionValues.length > 0 ? missionValues : savedValues).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(missionValues.length > 0 ? missionValues : savedValues).map((val) => (
                <span
                  key={val}
                  className="px-3 py-1.5 rounded-lg bg-navy text-white text-sm font-medium"
                >
                  {val}
                </span>
              ))}
            </div>
          )}
          <Link
            href="/missions/1/activities/values-clarifier"
            className="text-sm text-teal hover:underline"
          >
            {missionValues.length > 0
              ? "Redo the Values Clarifier to change them"
              : "Go to the Values Clarifier"}
          </Link>
        </div>

        {/* Life stage — tunes what the app emphasises */}
        <div data-animate="4" className="card p-6">
          <h2 className="font-semibold text-ink mb-1">Where you&apos;re at</h2>
          <p className="text-sm text-ink-muted mb-4">
            We tailor what we show you. Year 12 and anyone who&apos;s left school see pathways
            and goals first, and examples fit your stage.
          </p>
          {([
            ["school", "At school", "grid-cols-3"],
            ["left", "Finished school", "grid-cols-2"],
          ] as const).map(([group, heading, cols]) => (
            <div key={group} className="mb-2">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                {heading}
              </div>
              <div className={cn("grid gap-2", cols)}>
                {LIFE_STAGE_OPTIONS.filter((o) => o.group === group).map((y) => (
                  <button
                    key={y.key}
                    type="button"
                    aria-pressed={lifeStage === y.key}
                    onClick={async () => {
                      setLifeStageState(y.key);
                      await saveLifeStage(db, userId, y.key);
                      setStageSaved(true);
                      setTimeout(() => setStageSaved(false), 2000);
                      router.refresh();
                    }}
                    className={cn(
                      "px-2 py-3 rounded-xl border text-center transition-all",
                      lifeStage === y.key
                        ? "border-teal bg-teal/5 ring-1 ring-teal"
                        : "border-surface-border bg-white hover:border-teal/40"
                    )}
                    style={{ borderWidth: "1.5px" }}
                  >
                    <div className="text-sm font-semibold text-ink whitespace-nowrap">{y.label}</div>
                    <div className="text-xs text-ink-muted mt-0.5">{y.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {stageSaved && <p className="text-xs text-sage mt-2">Saved ✓</p>}
        </div>

        {/* Privacy controls */}
        <div data-animate="4" className="card p-6">
          <h2 className="font-semibold text-ink mb-1">Privacy</h2>
          <p className="text-sm text-ink-muted mb-4">
            After a reflection, Groundwork can offer three follow-up questions to
            sit with. They&apos;re written by AI (Claude, made by Anthropic), which
            means sending the start of what you wrote to Anthropic. Turn this off
            and nothing you write ever leaves our database.
          </p>
          <button
            type="button"
            onClick={toggleAiReflections}
            disabled={savingAi}
            role="switch"
            aria-checked={aiEnabled}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3",
              aiEnabled ? "border-teal bg-teal/5" : "border-surface-border bg-white"
            )}
            style={{ borderWidth: "1.5px" }}
          >
            <span
              aria-hidden
              className={cn(
                "w-9 h-5 rounded-full flex-shrink-0 relative transition-colors",
                aiEnabled ? "bg-teal" : "bg-surface-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                  aiEnabled ? "left-[1.125rem]" : "left-0.5"
                )}
              />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink">
                Follow-up questions {aiEnabled ? "are on" : "are off"}
              </span>
              <span className="block text-xs text-ink-muted mt-0.5">
                {aiEnabled
                  ? "Your reflections are sent to the AI for question-writing only, and never used to train it."
                  : "Nothing you write leaves Groundwork."}
              </span>
            </span>
          </button>
          <div className="flex gap-4 mt-4 text-sm">
            <Link href="/privacy" className="text-teal hover:underline">Privacy policy</Link>
            <Link href="/terms" className="text-teal hover:underline">Terms</Link>
          </div>
        </div>

        {/* Device passcode */}
        <div data-animate="4">
          <DeviceLockSettings />
        </div>

        {/* Account actions */}
        <div data-animate="5" className="card p-6 space-y-3">
          <h2 className="font-semibold text-ink">Account</h2>
          <button
            onClick={handleSignOut}
            className="btn btn-secondary w-full justify-start"
          >
            Sign out
          </button>
        </div>

        {/* Danger zone */}
        <div
          data-animate="6"
          className="rounded-xl p-6 border border-red-100 bg-red-50/30"
        >
          <h2 className="font-semibold text-red-800 mb-2">Danger zone</h2>
          <p className="text-sm text-ink-muted mb-4">
            Deleting your account will permanently remove all your journal
            entries, progress, and personal data. This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-700 font-medium">
                Type{" "}
                <span className="font-mono bg-red-100 px-1 rounded">
                  delete my account
                </span>{" "}
                to confirm:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="input border-red-200 focus:border-red-400"
                placeholder="delete my account"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput("");
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "delete my account" || deleting}
                  className="btn flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
                >
                  {deleting ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
              {deleteError && (
                <p role="alert" className="text-sm text-red-700 mt-2">{deleteError}</p>
              )}
            </div>
          )}
        </div>

        {/* Privacy note */}
        <div data-animate="6" className="text-xs text-ink-muted text-center pb-4">
          Groundwork is not a therapy replacement. All journal content is
          private and encrypted. We never sell your data.
          <BuildStamp className="mt-3" />
        </div>
      </div>
    </AppShell>
  );
}
