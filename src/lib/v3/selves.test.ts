import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_HTML } from "../../../scripts/v3/selves-master";
import { buildContent } from "../../../scripts/v3/content-import";
import type { Self } from "./content";
import { SELVES_TEXT } from "./selves";

describe("the selves' text in the app", () => {
  it("is exactly what the master file says, for all 25", () => {
    const rows = buildContent(readFileSync(DEFAULT_HTML, "utf8")).rows.filter((r) => r.kind === "self");
    expect(SELVES_TEXT).toHaveLength(25);
    expect(SELVES_TEXT).toEqual(
      rows.map((r) => {
        const s = r.body as Self;
        return { key: s.key, name: s.name, level: s.level, short: s.short, what: s.what, notThis: s.notThis, ask: s.selfCheck, livingIt: s.livingIt };
      })
    );
  });
});
