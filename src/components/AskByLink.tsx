"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { mentionsCrisis } from "@/lib/help";
import { LOCKED_CLASS } from "@/lib/deviceLock";
import {
  ASK_LINK_DAYS,
  MAX_OPEN_LINKS,
  askUrl,
  firstName,
  requestState,
  shareMessage,
  type ConversationRequest,
} from "@/lib/askLink";

/**
 * Ask by link (lib/askLink.ts) on a conversation step: make a private link,
 * send it yourself, and read the answers here when they come back.
 *
 * `full` is the panel on the step's intro and done screens. `answers` is the
 * read-only reference shown while writing it up, so the student can quote
 * the person's own words.
 *
 * Renders nothing if migration 017 hasn't been run, so the step reads exactly
 * as it did before.
 */
export default function AskByLink({
  missionId,
  activityId,
  questions,
  accent,
  variant = "full",
}: {
  missionId: number;
  activityId: string;
  questions: string[];
  accent: string;
  variant?: "full" | "answers";
}) {
  const [db] = useState(() => createClient() as any);
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(true);
  const [requests, setRequests] = useState<ConversationRequest[]>([]);
  const [making, setMaking] = useState(false);
  const [forLabel, setForLabel] = useState("");
  const [fromName, setFromName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState<string | null>(null); // request id whose send panel is open
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await db
      .from("conversation_requests")
      .select("*")
      .eq("activity_id", activityId)
      .order("created_at", { ascending: false });
    if (err) {
      // Table not there yet (migration 017): leave the step as it was.
      setAvailable(false);
      setReady(true);
      return;
    }
    setRequests((data ?? []) as ConversationRequest[]);
    setReady(true);
  }, [db, activityId]);

  // Answers arrive while the student is elsewhere, often in the app they sent
  // the link from. Check again whenever they come back to this tab.
  useEffect(() => {
    load();
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [load]);

  // Answers count as read, clearing the note on Home, only once they're on a
  // screen the student can see: not behind the device passcode (lib/deviceLock).
  useEffect(() => {
    const unseen = requests.filter((r) => r.answered_at && !r.seen_at).map((r) => r.id);
    if (!unseen.length) return;
    const root = document.documentElement;
    let done = false;
    async function markSeen() {
      if (done || root.classList.contains(LOCKED_CLASS) || document.visibilityState !== "visible") return;
      done = true;
      const now = new Date().toISOString();
      const { error: err } = await db.from("conversation_requests").update({ seen_at: now }).in("id", unseen);
      if (!err) setRequests((rs) => rs.map((r) => (unseen.includes(r.id) ? { ...r, seen_at: now } : r)));
    }
    markSeen();
    const watch = new MutationObserver(markSeen);
    watch.observe(root, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", markSeen);
    return () => {
      done = true;
      watch.disconnect();
      document.removeEventListener("visibilitychange", markSeen);
    };
  }, [db, requests]);

  // The name the student goes by, as a starting point for how they sign the link.
  useEffect(() => {
    if (variant !== "full") return;
    (async () => {
      const { data: auth } = await db.auth.getUser();
      if (!auth?.user) return;
      const { data } = await db.from("users").select("display_name").eq("id", auth.user.id).maybeSingle();
      setFromName((n) => n || firstName(data?.display_name));
    })();
  }, [db, variant]);

  const answered = requests.filter((r) => requestState(r) === "answered");
  const waiting = requests.filter((r) => requestState(r) === "waiting");

  if (!ready || !available) return null;
  if (variant === "answers") {
    if (!answered.length) return null;
    return (
      <details className="rounded-2xl mb-4 bg-white border border-[--border]" open>
        <summary className="px-4 py-3 cursor-pointer text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
          What {answered.length === 1 ? whoAnswered(answered[0]) : "they"} told you
        </summary>
        <div className="px-4 pb-4 space-y-4">
          {answered.map((r) => (
            <Answers key={r.id} r={r} />
          ))}
        </div>
      </details>
    );
  }

  async function makeLink() {
    const label = forLabel.trim();
    const name = fromName.trim();
    if (!label || !name) {
      setError("Add who it's for and your name, so they know who's asking.");
      return;
    }
    setBusy(true);
    setError(null);
    const { data: auth } = await db.auth.getUser();
    const { data, error: err } = await db
      .from("conversation_requests")
      .insert({
        user_id: auth?.user?.id,
        mission_id: missionId,
        activity_id: activityId,
        for_label: label.slice(0, 40),
        from_name: name.slice(0, 40),
        questions,
      })
      .select("*")
      .single();
    setBusy(false);
    if (err || !data) {
      setError("Couldn't make the link. Check your connection and try again.");
      return;
    }
    setRequests((rs) => [data as ConversationRequest, ...rs]);
    setMaking(false);
    setForLabel("");
    setSharing((data as ConversationRequest).id);
  }

  async function remove(id: string) {
    const { error: err } = await db.from("conversation_requests").delete().eq("id", id);
    if (!err) setRequests((rs) => rs.filter((r) => r.id !== id));
    setConfirmDelete(null);
  }

  const atLimit = waiting.length >= MAX_OPEN_LINKS;

  return (
    <div className="rounded-2xl p-4 mb-5 bg-white border border-[--border]" data-animate="2">
      <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: accent }}>
        Can&apos;t talk in person? Send the questions
      </div>
      <p className="text-sm text-[--ink] leading-relaxed mb-3">
        Make a private link and send it yourself, by text, email or whatever they use.
        They answer on their phone, no account needed, and their answers show up here.
        Only you see them.
      </p>

      {requests.length > 0 && (
        <ul className="space-y-3 mb-3">
          {requests.map((r) => {
            const state = requestState(r);
            return (
              <li key={r.id} className="rounded-xl border border-[--border] p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-[--ink] truncate">{r.for_label}</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={
                      state === "answered"
                        ? { background: `${accent}18`, color: accent }
                        : { background: "var(--surface-muted)", color: "var(--ink-muted)" }
                    }
                  >
                    {state === "answered" ? "Answered" : state === "waiting" ? "Waiting" : "Expired"}
                  </span>
                </div>

                {state === "answered" && <Answers r={r} />}
                {state === "waiting" && (
                  <p className="text-xs text-[--ink-muted] leading-relaxed">
                    Sent {shortDate(r.created_at)}. The link works until {shortDate(r.expires_at)}.{" "}
                    <button type="button" onClick={load} className="font-semibold text-[--teal]">
                      Check for answers
                    </button>
                  </p>
                )}
                {state === "expired" && (
                  <p className="text-xs text-[--ink-muted] leading-relaxed">
                    This link ran out before anyone answered. You can make a new one.
                  </p>
                )}

                {sharing === r.id && state === "waiting" && <SendPanel r={r} activityId={activityId} accent={accent} />}

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {state === "waiting" && sharing !== r.id && (
                    <button type="button" onClick={() => setSharing(r.id)} className="text-xs font-semibold text-[--teal]">
                      Send it again
                    </button>
                  )}
                  {confirmDelete === r.id ? (
                    <span className="text-xs text-[--ink]">
                      {state === "answered" ? "Delete their answers for good?" : "Cancel this link?"}{" "}
                      <button type="button" onClick={() => remove(r.id)} className="font-semibold text-red-600">
                        Yes
                      </button>{" "}
                      ·{" "}
                      <button type="button" onClick={() => setConfirmDelete(null)} className="font-semibold text-[--ink-muted]">
                        No
                      </button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirmDelete(r.id)} className="text-xs font-medium text-[--ink-muted]">
                      {state === "answered" ? "Delete answers" : state === "waiting" ? "Cancel link" : "Remove"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {making ? (
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-[--ink]">Who&apos;s it for?</span>
            <input
              id={`ask-for-${activityId}`}
              value={forLabel}
              onChange={(e) => setForLabel(e.target.value)}
              maxLength={40}
              placeholder="Grandma, Dad, Aunty Jo"
              className="mt-1 w-full rounded-xl border border-[--border] px-3 py-2.5 text-sm bg-white"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[--ink]">Your name, the way they know you</span>
            <input
              id={`ask-from-${activityId}`}
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              maxLength={40}
              className="mt-1 w-full rounded-xl border border-[--border] px-3 py-2.5 text-sm bg-white"
            />
          </label>
          <p className="text-xs text-[--ink-muted] leading-relaxed">
            They&apos;ll see your name and these questions, nothing else from your
            account. The link works once and lasts {ASK_LINK_DAYS} days.
          </p>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={makeLink}
              disabled={busy}
              className="btn flex-1 py-2.5 rounded-xl text-sm text-white"
              style={{ background: accent }}
            >
              {busy ? "Making the link…" : "Make the link"}
            </button>
            <button type="button" onClick={() => setMaking(false)} className="btn btn-secondary py-2.5 px-4 rounded-xl text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : atLimit ? (
        <p className="text-xs text-[--ink-muted]">
          You&apos;ve got {MAX_OPEN_LINKS} links waiting. Cancel one to make another.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setMaking(true)}
          className="w-full rounded-xl border-2 border-dashed py-2.5 text-sm font-semibold"
          style={{ borderColor: `${accent}55`, color: accent }}
        >
          {requests.length ? "Send to someone else" : "Make a link to send"}
        </button>
      )}
    </div>
  );
}

function whoAnswered(r: ConversationRequest): string {
  return r.responder_name || r.for_label;
}

/** One person's answers, with the questions they were answering. */
function Answers({ r }: { r: ConversationRequest }) {
  const answers = r.answers ?? [];
  const heavy = answers.some((a) => mentionsCrisis(a));
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-[--ink-muted]">
        {whoAnswered(r)} answered {r.answered_at ? shortDate(r.answered_at) : ""}
      </p>
      {heavy && (
        <div className="rounded-xl p-3 text-sm leading-relaxed border border-coral/30 bg-white">
          Some of what they wrote sounds heavy. If it&apos;s brought something up for you,
          you don&apos;t have to carry it on your own.{" "}
          <Link href="/support" className="text-[--teal] underline">
            People you can talk to
          </Link>
        </div>
      )}
      {r.questions.map((q, i) =>
        answers[i]?.trim() ? (
          <div key={i}>
            <div className="text-xs font-semibold text-[--ink-muted] leading-snug mb-0.5">{q}</div>
            <p className="text-sm text-[--ink] leading-relaxed whitespace-pre-wrap">&ldquo;{answers[i].trim()}&rdquo;</p>
          </div>
        ) : null
      )}
    </div>
  );
}

/** Everything needed to send the link from the student's own phone or account. */
function SendPanel({ r, activityId, accent }: { r: ConversationRequest; activityId: string; accent: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const url = askUrl(typeof window === "undefined" ? "" : window.location.origin, r.token);
  const message = shareMessage(activityId, r.for_label, url);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function share() {
    try {
      await navigator.share({ title: "A few questions from " + r.from_name, text: message });
    } catch {
      // Closing the share sheet isn't an error worth showing.
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const subject = encodeURIComponent(`A few questions from ${r.from_name}`);
  const body = encodeURIComponent(message);

  return (
    <div className="mt-2 rounded-xl p-3" style={{ background: `${accent}0D` }}>
      <div className="text-xs font-semibold text-[--ink] mb-1">Send this to {r.for_label}</div>
      <p className="text-sm text-[--ink] leading-relaxed mb-3 select-all break-words">{message}</p>
      <div className="flex flex-wrap gap-2">
        {canShare && (
          <button type="button" onClick={share} className="btn py-2 px-3.5 rounded-xl text-sm text-white" style={{ background: accent }}>
            Share…
          </button>
        )}
        <button type="button" onClick={copy} className="btn btn-secondary py-2 px-3.5 rounded-xl text-sm">
          {copied ? "Copied ✓" : "Copy message"}
        </button>
        <a href={`sms:?&body=${body}`} className="btn btn-secondary py-2 px-3.5 rounded-xl text-sm">
          Text it
        </a>
        <a href={`mailto:?subject=${subject}&body=${body}`} className="btn btn-secondary py-2 px-3.5 rounded-xl text-sm">
          Email it
        </a>
      </div>
    </div>
  );
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}
