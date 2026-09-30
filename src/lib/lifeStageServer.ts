import { cookies } from "next/headers";
import { LIFE_STAGE_COOKIE, parseLifeStage, type LifeStage } from "./lifeStage";

/**
 * The student's life stage for server-rendered pages: the account's
 * users.life_stage, falling back to the cookie that used to be the only record.
 * A cookie-only student has it copied to their account here, once, so the
 * choice follows them to any device from then on.
 *
 * A read error (the column not yet added) leaves the cookie in charge, exactly
 * as before this existed.
 */
export async function getLifeStage(
  supabase: any,
  userId: string
): Promise<LifeStage> {
  const fromCookie = parseLifeStage(cookies().get(LIFE_STAGE_COOKIE)?.value);
  const { data, error } = await supabase
    .from("users")
    .select("life_stage")
    .eq("id", userId)
    .maybeSingle();
  const fromAccount = error ? null : parseLifeStage(data?.life_stage);

  if (!error && !fromAccount && fromCookie) {
    await supabase.from("users").update({ life_stage: fromCookie }).eq("id", userId);
  }
  return fromAccount ?? fromCookie ?? "middle";
}
