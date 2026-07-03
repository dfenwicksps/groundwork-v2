"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { SupportContact } from "@/types/database";
import AppShell from "@/components/layout/AppShell";

const CONVERSATION_STARTERS = [
  "\"I've been doing some thinking about who I want to become, and I'd love to hear your perspective on something.\"",
  "\"There's a programme I'm doing about identity and values. Can I tell you what I've been learning about myself?\"",
  "\"I've been reflecting on what matters most to me. I think you know me well — does this sound right?\"",
  "\"I want to talk to you about something I've been thinking about. It's not a crisis — I just value your opinion.\"",
];

export default function SupportClient({
  contacts,
  userId,
}: {
  contacts: SupportContact[];
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const db = supabase as any;

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim() || !relationship.trim()) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await db.from("support_circle").insert({
      user_id: userId,
      name: name.trim(),
      relationship: relationship.trim(),
    });
    setSaving(false);
    if (error) {
      setSaveError("Couldn't add them — check your connection and try again.");
      return;
    }
    setShowForm(false);
    setName("");
    setRelationship("");
    router.refresh();
  }

  async function handleRemove(id: string) {
    const { error } = await db.from("support_circle").delete().eq("id", id);
    if (error) {
      setSaveError("Couldn't remove that person — please try again.");
      setConfirmingRemove(null);
      return;
    }
    setSaveError(null);
    setConfirmingRemove(null);
    router.refresh();
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div data-animate="1">
          <h1
            className="text-3xl text-navy mb-2"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            Your support circle
          </h1>
          <p className="text-ink-muted text-sm leading-relaxed max-w-md">
            Groundwork is a tool for reflection. Real people in your life matter
            more. This is a reminder of who&apos;s in your corner.
          </p>
        </div>

        {/* Contacts */}
        <div data-animate="2">
          {contacts.length > 0 ? (
            <div className="space-y-2 mb-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold flex-shrink-0">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink">
                      {contact.name}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {contact.relationship}
                    </div>
                  </div>
                  {confirmingRemove === contact.id ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setConfirmingRemove(null)}
                        className="text-xs text-ink-muted hover:text-ink px-2 py-1.5 rounded-lg transition-colors"
                      >
                        Keep
                      </button>
                      <button
                        onClick={() => handleRemove(contact.id)}
                        className="text-xs text-red-600 font-medium px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        Remove {contact.name}?
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingRemove(contact.id)}
                      className="text-xs text-ink-muted hover:text-red-400 transition-colors p-2"
                      aria-label={`Remove ${contact.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M3 3l8 8M11 3l-8 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center mb-4">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-ink-muted text-sm">
                You haven&apos;t added anyone yet.
              </p>
            </div>
          )}

          {saveError && (
            <p role="alert" className="text-sm text-red-600 mb-3">{saveError}</p>
          )}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-secondary w-full"
            >
              + Add a trusted person
            </button>
          ) : (
            <div className="card p-5 space-y-4">
              <h3 className="font-medium text-ink">Add someone</h3>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Their name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mum, Coach Ben, Mrs Thompson"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Relationship
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Parent, Teacher, Older sibling"
                  className="input"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!name.trim() || !relationship.trim() || saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? "Saving…" : "Add"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Conversation starters */}
        <div data-animate="3">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            How to start a conversation
          </h2>
          <div className="card p-5">
            <p className="text-sm text-ink-muted mb-4">
              Sometimes the hardest part is knowing how to begin. Here are some
              ways you could open the conversation:
            </p>
            <div className="space-y-3">
              {CONVERSATION_STARTERS.map((starter, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-surface-muted border border-surface-border"
                >
                  <p className="text-sm text-ink leading-relaxed italic">
                    {starter}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Crisis support */}
        <div data-animate="4">
          <div
            className="rounded-xl p-5 border"
            style={{
              background: "rgba(74, 124, 89, 0.04)",
              borderColor: "rgba(74, 124, 89, 0.2)",
            }}
          >
            <h3 className="font-semibold text-sage mb-2">
              If things feel too hard
            </h3>
            <p className="text-sm text-ink-muted leading-relaxed mb-3">
              If you&apos;re going through something difficult, talking to
              someone you trust is always the right move. If you need more
              support, speak to a school counsellor or reach out to:
            </p>
            <div className="space-y-2">
              <a
                href="tel:1800551800"
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-surface-border hover:border-sage/30 transition-colors"
              >
                <span className="text-xl">📞</span>
                <div>
                  <div className="text-sm font-medium text-ink">
                    Kids Helpline
                  </div>
                  <div className="text-xs text-ink-muted">
                    1800 55 1800 — free, 24/7, confidential
                  </div>
                </div>
              </a>
              <a
                href="https://kidshelpline.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-surface-border hover:border-sage/30 transition-colors"
              >
                <span className="text-xl">💬</span>
                <div>
                  <div className="text-sm font-medium text-ink">
                    Kids Helpline — online chat
                  </div>
                  <div className="text-xs text-ink-muted">
                    kidshelpline.com.au
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
