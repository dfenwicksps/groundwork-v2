export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          onboarding_complete: boolean;
          active_mission: number;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          onboarding_complete?: boolean;
          active_mission?: number;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          onboarding_complete?: boolean;
          active_mission?: number;
        };
      };
      onboarding_results: {
        Row: {
          id: string;
          user_id: string;
          why_here: string | null;
          strengths: string[] | null;
          values: string[] | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          why_here?: string | null;
          strengths?: string[] | null;
          values?: string[] | null;
          completed_at?: string;
        };
        Update: {
          why_here?: string | null;
          strengths?: string[] | null;
          values?: string[] | null;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          mission_id: number;
          activity_id: string;
          prompt: string;
          response: string;
          ai_reflection: string | null;
          is_milestone: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: number;
          activity_id: string;
          prompt: string;
          response?: string;
          ai_reflection?: string | null;
          is_milestone?: boolean;
          created_at?: string;
        };
        Update: {
          response?: string;
          ai_reflection?: string | null;
          updated_at?: string;
          is_milestone?: boolean;
        };
      };
      challenges: {
        Row: {
          id: string;
          user_id: string;
          mission_id: number;
          challenge_text: string;
          issued_at: string;
          completed_at: string | null;
          debrief_response: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: number;
          challenge_text: string;
          issued_at?: string;
          completed_at?: string | null;
          debrief_response?: string | null;
        };
        Update: {
          completed_at?: string | null;
          debrief_response?: string | null;
        };
      };
      support_circle: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          relationship: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          relationship: string;
          added_at?: string;
        };
        Update: {
          name?: string;
          relationship?: string;
        };
      };
      mission_progress: {
        Row: {
          id: string;
          user_id: string;
          mission_id: number;
          activity_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: number;
          activity_id: string;
          completed_at?: string;
        };
        Update: Record<string, never>;
      };
      stories: {
        Row: {
          id: string;
          mission_id: number;
          title: string;
          teaser: string;
          context: string;
          turning_point: string;
          reflection_prompts: string[];
          tags: string[];
        };
        Insert: {
          id?: string;
          mission_id: number;
          title: string;
          teaser: string;
          context: string;
          turning_point: string;
          reflection_prompts: string[];
          tags?: string[];
        };
        Update: {
          title?: string;
          teaser?: string;
          context?: string;
          turning_point?: string;
          reflection_prompts?: string[];
          tags?: string[];
        };
      };
    };
  };
};

// Convenience types
export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
export type Challenge = Database["public"]["Tables"]["challenges"]["Row"];
export type SupportContact = Database["public"]["Tables"]["support_circle"]["Row"];
export type MissionProgress = Database["public"]["Tables"]["mission_progress"]["Row"];
export type Story = Database["public"]["Tables"]["stories"]["Row"];
export type OnboardingResult = Database["public"]["Tables"]["onboarding_results"]["Row"];
