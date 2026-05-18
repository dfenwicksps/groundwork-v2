import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(d);
}

export function isWithin24Hours(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  return diffMs < 1000 * 60 * 60 * 24;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export type TriCheck = {
  conceptual: string;
  practical: string;
  collective: string;
};

export type ParsedReflection =
  | { type: "tricheck"; tricheck: TriCheck }
  | { type: "plain"; text: string };

export function parseReflection(text: string | null | undefined): ParsedReflection | null {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.conceptual === "string" &&
      typeof parsed.practical === "string" &&
      typeof parsed.collective === "string"
    ) {
      return { type: "tricheck", tricheck: parsed as TriCheck };
    }
  } catch {
    // Not JSON — treat as legacy plain string
  }
  return { type: "plain", text };
}
