import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase-server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, entryId } = await request.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ reflection: null });
    }

    // Truncate if very long — just use the first ~500 chars for the prompt
    const truncatedText = text.slice(0, 500);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 250,
      system: `You are a warm, thoughtful guide helping a teenager reflect more deeply on their personal growth. Based on what they've written, generate exactly three short follow-up questions — one for each dimension below.

"conceptual": A question about what this reveals about their beliefs or values (what they think or care about).
"practical": A question about a small real-world action they could take this week that reflects what they wrote.
"collective": A question about a specific person in their life who relates to this (e.g. a friend, family member, or mentor).

Rules:
- Each question must be open, curious, and non-clinical. One sentence each.
- Do not give advice. Do not summarise what they wrote.
- Never use the word "I" or refer to yourself.
- Never mention AI, artificial intelligence, or technology.

Return ONLY valid JSON with no other text before or after it:
{"conceptual":"...","practical":"...","collective":"..."}`,
      messages: [
        {
          role: "user",
          content: truncatedText,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : null;

    // Validate the response is the expected JSON shape; fall back to null if not
    let reflection: string | null = null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.conceptual === "string" &&
          typeof parsed.practical === "string" &&
          typeof parsed.collective === "string"
        ) {
          reflection = raw;
        }
      } catch {
        // Model returned non-JSON — discard rather than show malformed output
      }
    }

    // Store reflection alongside the journal entry
    if (reflection && entryId) {
      // Cast needed due to auto-generated types not including ai_reflection in Update
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("journal_entries") as any)
        .update({ ai_reflection: reflection })
        .eq("id", entryId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ reflection });
  } catch {
    // Fail silently — don't expose errors to the user
    return NextResponse.json({ reflection: null });
  }
}
