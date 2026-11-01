"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  THEME_SYNCED_KEY,
  applyTheme,
  getStoredTheme,
  parseTheme,
  saveTheme,
} from "@/lib/theme";

/**
 * Brings this browser's copy of the look into line with the account, once per
 * visit (lib/theme.ts). On a new device that means picking up the look chosen
 * elsewhere. A browser-only choice, made before the look lived on the account,
 * is copied up to it instead.
 *
 * A read error (signed out, offline, the column not yet added) leaves the
 * browser copy in charge and tries again on the next page.
 */
export default function ThemeSync() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(THEME_SYNCED_KEY)) return;
    } catch {
      // No sessionStorage: check on every page, which is still correct.
    }
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id;
      if (!userId || cancelled) return;

      const db = supabase as any;
      const { data, error } = await db
        .from("users")
        .select("theme")
        .eq("id", userId)
        .maybeSingle();
      if (error || cancelled) return;

      const fromAccount = parseTheme(data?.theme);
      const local = getStoredTheme();
      if (fromAccount) {
        if (fromAccount !== local) applyTheme(fromAccount);
      } else if (local) {
        if (!(await saveTheme(db, userId, local))) return;
      }
      try {
        sessionStorage.setItem(THEME_SYNCED_KEY, "1");
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
