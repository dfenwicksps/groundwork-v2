"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

const ALL_VALUES = [
  "Courage",
  "Kindness",
  "Honesty",
  "Creativity",
  "Growth",
  "Family",
  "Humour",
  "Compassion",
  "Curiosity",
  "Resilience",
  "Fairness",
  "Authenticity",
];

export default function SettingsClient({
  userId,
  email,
  displayName,
  savedValues,
}: {
  userId: string;
  email: string;
  displayName: string;
  savedValues: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [selectedValues, setSelectedValues] = useState<string[]>(savedValues);
  const [savingValues, setSavingValues] = useState(false);
  const [savedValues2, setSavedValues2] = useState(false);
  const [valuesError, setValuesError] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [pwState, setPwState] = useState<"idle" | "saving" | "saved">("idle");
  const [pwError, setPwError] = useState<string | null>(null);

  function toggleValue(val: string) {
    if (selectedValues.includes(val)) {
      setSelectedValues(selectedValues.filter((v) => v !== val));
    } else if (selectedValues.length < 3) {
      setSelectedValues([...selectedValues, val]);
    }
  }

  async function handleSaveValues() {
    setSavingValues(true);
    setValuesError(null);
    const { error } = await db
      .from("onboarding_results")
      .update({ values: selectedValues })
      .eq("user_id", userId);
    setSavingValues(false);
    if (error) {
      setValuesError("Couldn't save your values — please try again.");
      return;
    }
    setSavedValues2(true);
    setEditingValues(false);
    setTimeout(() => setSavedValues2(false), 2000);
  }

  function handleCancelValues() {
    setSelectedValues(savedValues);
    setEditingValues(false);
    setValuesError(null);
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
      // Account and all data are gone — end the (now-orphaned) session.
      await supabase.auth.signOut();
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
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
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
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-ink">Your values</h2>
            {!editingValues && (
              <button
                onClick={() => setEditingValues(true)}
                className="text-sm text-teal hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          <p className="text-sm text-ink-muted mb-4">
            The three values you chose when you started. You can update them any time.
          </p>

          {!editingValues ? (
            <div className="flex flex-wrap gap-2">
              {selectedValues.length > 0 ? (
                selectedValues.map((val) => (
                  <span
                    key={val}
                    className="px-3 py-1.5 rounded-lg bg-navy text-white text-sm font-medium"
                  >
                    {val}
                  </span>
                ))
              ) : (
                <p className="text-sm text-ink-muted/60 italic">No values selected yet.</p>
              )}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {ALL_VALUES.map((val) => {
                  const selected = selectedValues.includes(val);
                  const disabled = !selected && selectedValues.length >= 3;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => toggleValue(val)}
                      disabled={disabled}
                      className={cn(
                        "p-3 rounded-xl text-sm font-medium transition-all border",
                        selected
                          ? "bg-navy text-white border-navy"
                          : disabled
                          ? "bg-surface-muted text-ink-muted/50 border-surface-border cursor-not-allowed"
                          : "bg-white text-ink border-surface-border hover:border-navy/30"
                      )}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-ink-muted mb-4">{selectedValues.length} of 3 selected</p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelValues}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveValues}
                  disabled={savingValues || selectedValues.length !== 3}
                  className="btn btn-primary flex-[2]"
                >
                  {savingValues ? "Saving…" : savedValues2 ? "Saved ✓" : "Save values"}
                </button>
              </div>
              {valuesError && (
                <p role="alert" className="text-xs text-red-600 mt-2">{valuesError}</p>
              )}
            </div>
          )}
        </div>

        {/* Account actions */}
        <div data-animate="4" className="card p-6 space-y-3">
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
          data-animate="5"
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
        <div data-animate="6" className="text-xs text-ink-muted/60 text-center pb-4">
          Groundwork is not a therapy replacement. All journal content is
          private and encrypted. We never sell your data.
        </div>
      </div>
    </AppShell>
  );
}
