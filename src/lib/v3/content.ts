// ─── v3 content types ────────────────────────────────────────────────────────
// The shapes v3 content takes once it lives in the database (spec sections 5,
// 8 and 10). Central content is written in the repo, checked against these
// types, and published to `content_items` by an import script; a school's
// changes sit on top in `content_overrides`. A student sees: central content,
// minus what their school hides, plus what their school adds or edits.
//
// Types only. Nothing here reads or writes anything, and nothing in v2 imports
// it. The database draft is supabase/v3/schema.sql; the rules about who can
// read what are docs/v3/visibility.md.

// ─── Year level, age band, rating ────────────────────────────────────────────

/** School year. The only age signal v3 holds: no date of birth is collected (D8). */
export type YearLevel = 7 | 8 | 9 | 10 | 11 | 12;

/** Spec section 8's three bands. Not v2's `LifeStage`, which groups 7–9, 10–11, 12. */
export type AgeBand = "7-8" | "9-10" | "11-12";

/**
 * The Australian classification categories v3 can ever show a student. R 18+
 * and X 18+ exist as categories but can't be stored: there is no year level
 * they'd be allowed for.
 */
export type Rating = "G" | "PG" | "M" | "MA15+";

/** The six classifiable elements, used when a curator rates an unrated clip. */
export type RatingElement = "themes" | "violence" | "language" | "drug use" | "nudity" | "sex";

// ─── Sources ─────────────────────────────────────────────────────────────────

/**
 * Where a claim or a story comes from. The HTML master has one free-text
 * source line per self covering the story and the research together; a person
 * splits it and adds the address when the story is verified.
 */
export interface Source {
  text: string;
  url?: string;
}

// ─── Levels ──────────────────────────────────────────────────────────────────

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** A level is a region of the map, not a rung: students open any of them in any order (D3). */
export interface Level {
  id: LevelId;
  name: string;
  /** The question the level asks, e.g. "Who am I, really?" */
  question: string;
  /** The level's colour and its tint, as hex. Presentation only. */
  colour: string;
  tint: string;
}

// ─── Stories ─────────────────────────────────────────────────────────────────

/** The person, film, show or song a story is about. */
export interface StoryFigure {
  /** "Film", "Sport", "Music", "TV", "Real life" */
  kind: string;
  name: string;
  /** One line under the name, e.g. "Paralympian, 2022 Australian of the Year" */
  sub: string;
  /** The moment the story turns on, e.g. "Golden Slam, 2021" */
  moment: string;
  icon: string;
}

/**
 * "celebrity": a well-known person or a film. "peer": someone the student's
 * own age who struggles first and then copes, which v2's multimedia review
 * found works better. A self can carry one of each.
 */
export type StoryKind = "celebrity" | "peer";

export interface Story {
  /** Stable for ever, like a self's key. */
  key: string;
  /** The self this story teaches. */
  selfKey: string;
  kind: StoryKind;
  figure: StoryFigure;
  /** The opening question, shown on its own. */
  hook: string;
  /** Shown one at a time. */
  beats: string[];
  /** The one-line takeaway. */
  turn: string;
  /** The bands this story suits. A story can suit one year level and not another. */
  ageBands: AgeBand[];
  sources: Source[];
  /** ISO date a person last checked the facts. Re-checked yearly. Never set by a script. */
  verifiedAt: string;
  /** Who checked. */
  verifiedBy: string;
}

/**
 * A story as it comes out of the HTML master: complete in its telling, not yet
 * banded or verified. The three fields a person has to supply are null until
 * they do, and a draft is never published.
 */
export type DraftStory = Omit<Story, "ageBands" | "verifiedAt" | "verifiedBy"> & {
  ageBands: AgeBand[] | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
};

// ─── Selves ──────────────────────────────────────────────────────────────────

/**
 * A structured link from a self to the place in the app that builds it. Not
 * free text and not a path, so it survives routes being renamed.
 */
export type BuiltByLink =
  | { kind: "mission-activity"; missionId: number; activityId: string; label: string }
  | { kind: "program-week"; week: number; label: string }
  | { kind: "feature"; feature: AppFeature; label: string };

/** The parts of the app a self can point at that aren't a mission step or a week. */
export type AppFeature =
  | "journal"
  | "support-circle"
  | "the-standard"
  | "habits"
  | "practice-log"
  | "future-self"
  | "next-chapter"
  | "pathways"
  | "hard-on-yourself-card"
  | "strengths";

/**
 * One self, as a student sees it. Field names follow spec section 5's mapping
 * from the HTML master; `what`, `notThis` and `selfCheck` match v2's
 * `selves.ts` so the two texts can be compared field by field.
 */
export interface Self {
  /** Stable for ever: journal entries, media and class focus link to it. */
  key: string;
  name: string;
  level: LevelId;
  /** An emoji, as v2's selves have (D39). The master's line-icon names aren't used. */
  icon: string;
  /** One line, in a teenager's words. */
  short: string;
  /** What it is. */
  what: string;
  /** What it gets confused with: the distinction that does the teaching. */
  notThis: string;
  /** The reflective prompt. Also offered as a journal prompt. Never a risk-language question. */
  selfCheck: string;
  /** The week's challenge, which a student can accept in Grow. */
  livingIt: string;
  /** Where the app builds this. Empty for a self no activity builds yet. */
  builtBy: BuiltByLink[];
  /**
   * The school's own connection, e.g. "Connects to Character Project Session
   * 9". Null centrally: a school sets it through an override.
   */
  localLink: string | null;
  /** Keys of this self's stories, featured first. */
  storyKeys: string[];
  sources: Source[];
}

/** The five places in a lesson a teacher note can attach to, in the master's slide order. */
export type LessonStep = "hook" | "story" | "what-it-is" | "ask" | "living-it";

export const LESSON_STEPS: LessonStep[] = ["hook", "story", "what-it-is", "ask", "living-it"];

export interface TeacherNote {
  step: LessonStep;
  text: string;
}

/**
 * Teacher notes are stored apart from the self and are never part of anything
 * sent to a student session (visibility rule V-C1). There is deliberately no
 * `teacherNotes` field on `Self`.
 */
export interface SelfTeacherNotes {
  selfKey: string;
  notes: TeacherNote[];
}

// ─── Media ───────────────────────────────────────────────────────────────────

export type MediaType = "video" | "song" | "book" | "film";

/** "coping": struggles, then manages. "mastery": already good at it. */
export type MediaModel = "coping" | "mastery";

export type MediaStatus = "active" | "broken" | "retired";

/**
 * One curated record (spec section 8). Only a person creates one: no embed ID
 * or address is ever generated, guessed or completed by code.
 */
export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  creator: string;
  /** For a video: the channel it's embedded from, which must be the rights holder's or official. */
  provider: string;
  /** The provider's ID for an embedded clip. Null for a book or a full film. */
  embedId: string | null;
  /** Start and end, in seconds. Both set for an embedded clip. */
  startS: number | null;
  endS: number | null;
  /** The clip's own rating. */
  rating: Rating;
  ratingDescriptors: RatingElement[];
  /**
   * For a clip from a film or show: the rating of the whole title. A G-rated
   * clip can come from an MA15+ film, and v3 never suggests watching a full
   * title rated above the student's ceiling.
   */
  sourceTitleRating: Rating | null;
  minYearLevel: YearLevel;
  selves: string[];
  strengths: string[];
  /** One line on why it fits. A person approves it. */
  why: string;
  model: MediaModel;
  captions: boolean;
  /** A transcript or short written summary, for students who'd rather read. */
  transcript: string | null;
  verifiedAt: string;
  verifiedBy: string;
  status: MediaStatus;
  /** Null for a central record; set for a school's own. */
  schoolId: string | null;
}

/** At most one featured clip and two extras per self or strength. */
export interface MediaLink {
  mediaId: string;
  targetKind: "self" | "strength";
  targetKey: string;
  featured: boolean;
}

// ─── What `content_items.body` holds, by kind ────────────────────────────────

export type ContentKind = "self" | "strength" | "activity" | "story" | "cluster" | "subject";

export type ContentStatus = "draft" | "published" | "retired";

/** `kind = 'self'`. Teacher notes are not in the body; see `SelfTeacherNotes`. */
export type SelfBody = Self;

/** `kind = 'story'`. */
export type StoryBody = Story;

/**
 * `kind = 'strength'`. v2's `CharacterStrength`, with the practice copy from
 * `boosts.ts` alongside. Strength names only: no VIA survey items.
 */
export interface StrengthBody {
  key: string;
  name: string;
  virtue: "Wisdom" | "Courage" | "Humanity" | "Justice" | "Temperance" | "Transcendence";
  short: string;
  plain: string;
  emoji: string;
  /** What it looks like in practice, and one thing to try this week. */
  inPractice: string | null;
  action: string | null;
}

/**
 * `kind = 'activity'`. A mission step or a program week, carried over from
 * v2's `missions.ts` and `program.ts`. `payload` is the v2 object unchanged
 * (`Activity` or `ProgramWeek`), so no copy is lost in the move; what v3 adds
 * is the tagging.
 */
export interface ActivityBody {
  key: string;
  source: "mission" | "program";
  /** Set for a mission step. */
  missionId: number | null;
  /** Set for a program week. */
  week: number | null;
  title: string;
  /** The selves and strengths this builds: what links Grow back to Me. */
  selves: string[];
  strengths: string[];
  /** Private steps are never sent to the AI (v2's `keepFromAi`). */
  keepFromAi: boolean;
  payload: Record<string, unknown>;
}

/** `kind = 'cluster'`. v2's `CareerCluster`. Indicative and exploratory, never a match. */
export interface ClusterBody {
  key: string;
  name: string;
  emoji: string;
  blurb: string;
  roles: string[];
  /** Subject names as v2 has them. A school's own subjects link to clusters by `SubjectBody.clusters`. */
  subjects: string[];
  nextSteps: string[];
}

/** `kind = 'subject'`. Each school uploads its own list (D11), so most of these are school-added. */
export interface SubjectBody {
  key: string;
  name: string;
  yearLevels: YearLevel[];
  /** e.g. "Mathematics", "The Arts" */
  learningArea: string;
  /** Keys of other subjects, or plain text where the rule isn't a single subject. */
  prerequisites: string[];
  clusters: string[];
}

export interface ContentBodyByKind {
  self: SelfBody;
  strength: StrengthBody;
  activity: ActivityBody;
  story: StoryBody;
  cluster: ClusterBody;
  subject: SubjectBody;
}

/** One row of `content_items`. A key never changes; a new wording is a new version. */
export interface ContentItem<K extends ContentKind = ContentKind> {
  kind: K;
  key: string;
  version: number;
  status: ContentStatus;
  body: ContentBodyByKind[K];
}

// ─── A school's layer ────────────────────────────────────────────────────────

/**
 * The fields of a self a school may change. Everything else on central
 * content is read-only to schools, so a school can't edit `what`, `notThis`,
 * the story or the sources (visibility rule V-A6).
 */
export type SchoolEditableSelfField = "localLink";

export const SCHOOL_EDITABLE_SELF_FIELDS: SchoolEditableSelfField[] = ["localLink"];

/** One row of `content_overrides`. */
export type ContentOverride =
  /** Hide a central item from this school, e.g. a self while a topic is sensitive. */
  | { schoolId: string; op: "hide"; kind: ContentKind; itemKey: string }
  /** Change one of the fields a school is allowed to change. */
  | {
      schoolId: string;
      op: "patch";
      kind: "self";
      itemKey: string;
      body: Partial<Pick<Self, SchoolEditableSelfField>>;
    }
  /** Add the school's own item. Stories and subjects only: a school doesn't add selves or strengths. */
  | { schoolId: string; op: "add"; kind: "story"; itemKey: string; body: StoryBody }
  | { schoolId: string; op: "add"; kind: "subject"; itemKey: string; body: SubjectBody };
