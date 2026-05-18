import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import SupportClient from "./SupportClient";

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: contacts } = await supabase
    .from("support_circle")
    .select("*")
    .eq("user_id", user.id)
    .order("added_at");

  return <SupportClient contacts={contacts || []} userId={user.id} />;
}
