"use client";
import ThemeSettings from "@/app/settings/ThemeSettings";
const db = { from: () => ({ update: () => ({ eq: async () => ({ error: { message: "x" } }) }) }) };
export default function P() { return <div className="p-4"><ThemeSettings db={db} userId="u1" initialTheme={null} /></div>; }
