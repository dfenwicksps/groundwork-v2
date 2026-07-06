// ─── Career pathways ──────────────────────────────────────────────────────────
// Maps VIA character strengths + chosen values onto career clusters, so the app
// can show each student where THEIR profile could take them. Hand-authored,
// informed by the strengths-at-work literature (Niemiec, Character Strengths
// Interventions). Indicative and exploratory — never prescriptive.

import { strengthName } from "./strengths";

export interface CareerCluster {
  key: string;
  name: string;
  emoji: string;
  blurb: string;
  roles: string[];
  subjects: string[];
}

export const CLUSTERS: CareerCluster[] = [
  {
    key: "creating",
    name: "Creative Arts & Media",
    emoji: "🎨",
    blurb: "Making things people watch, read, hear, and feel.",
    roles: ["Designer", "Filmmaker / editor", "Writer or journalist", "Musician / producer", "Content creator"],
    subjects: ["Art & Design", "Media", "English", "Music", "Drama"],
  },
  {
    key: "tech",
    name: "Tech & Digital",
    emoji: "💻",
    blurb: "Building the software, games, and systems the world runs on.",
    roles: ["Software developer", "Game designer", "Cybersecurity analyst", "Data scientist", "AI engineer"],
    subjects: ["Digital Technologies", "Maths", "Physics"],
  },
  {
    key: "stem",
    name: "Science & Discovery",
    emoji: "🔬",
    blurb: "Asking hard questions and finding real answers.",
    roles: ["Researcher", "Lab scientist", "Environmental scientist", "Engineer", "Data analyst"],
    subjects: ["Biology", "Chemistry", "Physics", "Maths"],
  },
  {
    key: "helping",
    name: "Health & Helping",
    emoji: "🩺",
    blurb: "Careers where someone's day is genuinely better because you showed up.",
    roles: ["Doctor / nurse", "Psychologist", "Physiotherapist", "Social worker", "Paramedic"],
    subjects: ["Biology", "Psychology", "Health & PE"],
  },
  {
    key: "teaching",
    name: "Education & Coaching",
    emoji: "🏫",
    blurb: "Helping people grow — in classrooms, on fields, everywhere.",
    roles: ["Teacher", "Sports coach", "Youth worker", "Trainer", "Learning designer"],
    subjects: ["English", "Psychology", "plus whatever you'd love to teach"],
  },
  {
    key: "justice",
    name: "Law, Advocacy & Policy",
    emoji: "⚖️",
    blurb: "Standing up for people and making the rules fairer.",
    roles: ["Lawyer", "Policy advisor", "Investigative journalist", "Advocate", "HR specialist"],
    subjects: ["Legal Studies", "English", "Modern History"],
  },
  {
    key: "business",
    name: "Business & Entrepreneurship",
    emoji: "📈",
    blurb: "Spotting opportunities and building things that work.",
    roles: ["Founder / entrepreneur", "Manager", "Marketer", "Analyst", "Product manager"],
    subjects: ["Business", "Economics", "Maths"],
  },
  {
    key: "community",
    name: "Community & Service",
    emoji: "🤝",
    blurb: "Work that holds communities together when it matters most.",
    roles: ["Emergency services", "Not-for-profit worker", "Local government", "Defence", "Community organiser"],
    subjects: ["Humanities", "Health", "Legal Studies"],
  },
  {
    key: "nature",
    name: "Environment & Outdoors",
    emoji: "🌏",
    blurb: "Protecting and working with the natural world.",
    roles: ["Conservationist", "Marine biologist", "Agricultural scientist", "Park ranger", "Outdoor educator"],
    subjects: ["Biology", "Geography", "Agricultural Science"],
  },
  {
    key: "performance",
    name: "Sport & Performance",
    emoji: "🏅",
    blurb: "Discipline, pressure, and getting better in public.",
    roles: ["Athlete", "Physiotherapist", "Strength & conditioning coach", "Events manager", "Performer"],
    subjects: ["Health & PE", "Biology", "Business"],
  },
  {
    key: "making",
    name: "Building & Making",
    emoji: "🛠️",
    blurb: "Turning ideas into physical things that last.",
    roles: ["Engineer", "Builder / trades", "Product designer", "Architect", "Chef"],
    subjects: ["Design & Technology", "Maths", "Physics"],
  },
];

const CLUSTER_BY_KEY = Object.fromEntries(CLUSTERS.map((c) => [c.key, c]));

// Each strength points at the clusters where it does the heaviest lifting.
export const STRENGTH_CLUSTERS: Record<string, string[]> = {
  creativity: ["creating", "tech", "making"],
  curiosity: ["stem", "tech", "creating"],
  judgment: ["justice", "stem", "business"],
  "love-of-learning": ["stem", "teaching", "tech"],
  perspective: ["teaching", "justice", "community"],
  bravery: ["community", "justice", "performance"],
  perseverance: ["performance", "making", "business"],
  honesty: ["justice", "community", "business"],
  zest: ["performance", "creating", "business"],
  love: ["helping", "teaching", "community"],
  kindness: ["helping", "community", "teaching"],
  "social-intelligence": ["helping", "business", "teaching"],
  teamwork: ["community", "performance", "making"],
  fairness: ["justice", "community", "teaching"],
  leadership: ["business", "community", "justice"],
  forgiveness: ["helping", "community", "teaching"],
  humility: ["community", "helping", "making"],
  prudence: ["business", "stem", "justice"],
  "self-regulation": ["performance", "stem", "making"],
  appreciation: ["creating", "nature", "making"],
  gratitude: ["community", "helping", "teaching"],
  hope: ["teaching", "community", "business"],
  humor: ["creating", "teaching", "performance"],
  spirituality: ["community", "helping", "teaching"],
};

// Values add a second, lighter signal.
export const VALUE_CLUSTERS: Record<string, string[]> = {
  Courage: ["community", "justice"],
  Kindness: ["helping", "community"],
  Honesty: ["justice", "community"],
  Creativity: ["creating", "tech"],
  Loyalty: ["community", "performance"],
  Fairness: ["justice", "community"],
  Growth: ["teaching", "business"],
  Family: ["helping", "teaching"],
  Independence: ["business", "tech"],
  Humour: ["creating", "performance"],
  Compassion: ["helping", "community"],
  Adventure: ["nature", "performance"],
  Justice: ["justice"],
  Faith: ["community", "helping"],
  Discipline: ["performance", "stem"],
  Connection: ["helping", "community"],
  Curiosity: ["stem", "tech"],
  Service: ["community", "helping"],
  Resilience: ["performance", "community"],
  Authenticity: ["creating", "justice"],
};

export interface PathwaySuggestion {
  cluster: CareerCluster;
  /** The user's own strengths that point here (display names) */
  fromStrengths: string[];
  /** The user's own values that point here */
  fromValues: string[];
}

/**
 * Suggest the top career clusters for a user. Strengths carry more weight than
 * values (3 vs 1), and higher-ranked strengths more than lower ones.
 */
export function suggestPathways(
  top5StrengthKeys: string[],
  values: string[],
  count = 3
): PathwaySuggestion[] {
  const score: Record<string, number> = {};
  const fromStrengths: Record<string, string[]> = {};
  const fromValues: Record<string, string[]> = {};

  top5StrengthKeys.forEach((k, i) => {
    const weight = 3 + (top5StrengthKeys.length - i); // rank 1 counts most
    for (const c of STRENGTH_CLUSTERS[k] || []) {
      score[c] = (score[c] || 0) + weight;
      (fromStrengths[c] ||= []).push(strengthName(k));
    }
  });
  for (const v of values) {
    for (const c of VALUE_CLUSTERS[v] || []) {
      score[c] = (score[c] || 0) + 1;
      (fromValues[c] ||= []).push(v);
    }
  }

  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => ({
      cluster: CLUSTER_BY_KEY[key],
      fromStrengths: Array.from(new Set(fromStrengths[key] || [])),
      fromValues: Array.from(new Set(fromValues[key] || [])),
    }))
    .filter((s) => !!s.cluster);
}
