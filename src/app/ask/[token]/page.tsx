import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase-server";
import { ASK_TOPICS } from "@/lib/askLink";
import AnswerForm from "./AnswerForm";

export const dynamic = "force-dynamic";

// A private link: never indexed, never previewed with the questions in it.
export const metadata: Metadata = {
  title: "A few questions — Groundwork",
  robots: { index: false, follow: false },
};

/**
 * Where someone answers a student's questions (lib/askLink.ts). No account and
 * no app shell: the person is usually a parent or grandparent opening a link
 * from a text. They see the name the student gave and the questions, nothing
 * else, through a function that only answers for this one token.
 */
export default async function AskPage({ params }: { params: { token: string } }) {
  const supabase = createServerClient() as any;
  const { data } = await supabase.rpc("get_conversation_request", { p_token: params.token });
  const req = (Array.isArray(data) ? data[0] : null) as {
    from_name: string;
    for_label: string;
    questions: string[];
    activity_id: string;
    status: "open" | "answered" | "expired";
  } | null;

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="max-w-xl mx-auto px-5 pt-8 pb-24">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-navy rounded-md flex items-center justify-center" aria-hidden>
            <span className="text-white text-xs font-semibold">G</span>
          </div>
          <span className="font-semibold text-navy text-lg" style={{ fontFamily: "var(--font-display)" }}>
            Groundwork
          </span>
        </div>

        {!req ? (
          <Notice title="This link doesn't work">
            It may have been typed wrong, or cancelled. Ask whoever sent it to send it again.
          </Notice>
        ) : req.status === "answered" ? (
          <Notice title="These questions have been answered">
            {req.from_name} has the answers. Each link can only be answered once, so if you
            want to add something, tell them directly.
          </Notice>
        ) : req.status === "expired" ? (
          <Notice title="This link has expired">
            Links last 30 days. Ask {req.from_name} to send you a new one.
          </Notice>
        ) : (
          <AnswerForm
            token={params.token}
            fromName={req.from_name}
            forLabel={req.for_label}
            about={ASK_TOPICS[req.activity_id]?.about ?? "a few things"}
            questions={req.questions}
          />
        )}
      </div>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h1 className="text-2xl text-navy mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
        {title}
      </h1>
      <p className="text-sm text-ink-muted leading-relaxed">{children}</p>
    </div>
  );
}
