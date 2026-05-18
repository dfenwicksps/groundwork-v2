/**
 * Type-safe wrappers for Supabase operations.
 *
 * The @supabase/ssr package sometimes fails to propagate the Database generic
 * through chained query builders, producing `never` for update/insert types.
 * These helpers use explicit casts to work around that.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export function dbFrom(client: AnyClient, table: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client as any).from(table);
}

export async function dbUpdate(
  client: AnyClient,
  table: string,
  values: Record<string, unknown>,
  filters: Record<string, unknown>
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (client as any).from(table).update(values);
  for (const [col, val] of Object.entries(filters)) {
    query = query.eq(col, val);
  }
  await query;
}

export async function dbInsert(
  client: AnyClient,
  table: string,
  values: Record<string, unknown>
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from(table)
    .insert(values)
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id as string;
}

export async function dbUpsert(
  client: AnyClient,
  table: string,
  values: Record<string, unknown>
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (client as any).from(table).upsert(values);
}
