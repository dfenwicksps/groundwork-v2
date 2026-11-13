import { describe, expect, it } from "vitest";
import { classifySignInProblem, isSignInProblem, signInProblemMessage } from "./signInProblem";

describe("why a sign-in didn't finish", () => {
  it("recognises the errors Supabase sends back", () => {
    expect(classifySignInProblem("Unable to exchange external code: 4/0Ab...")).toBe("provider");
    expect(classifySignInProblem("Database error saving new user")).toBe("database");
    expect(classifySignInProblem("invalid request: both auth code and code verifier should be non-empty")).toBe("expired");
    expect(classifySignInProblem("invalid flow state, no valid flow state found")).toBe("expired");
    expect(classifySignInProblem("access_denied")).toBe("denied");
    expect(classifySignInProblem("something new")).toBe("other");
    expect(classifySignInProblem(null)).toBe("other");
  });

  it("only accepts its own references from the address bar", () => {
    expect(isSignInProblem("provider")).toBe(true);
    expect(isSignInProblem("<script>")).toBe(false);
    expect(isSignInProblem("toString")).toBe(false);
    expect(isSignInProblem(null)).toBe(false);
  });

  it("never blames the person, and carries a reference", () => {
    for (const p of ["provider", "database", "expired", "denied", "other"] as const) {
      const m = signInProblemMessage(p);
      expect(m).toContain(`(Ref: ${p})`);
      expect(m).not.toMatch(/you (did|made|entered) (something )?wrong|your fault/i);
    }
  });
});
