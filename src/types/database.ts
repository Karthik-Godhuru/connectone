export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          education: string | null;
          career_domain: string | null;
          primary_goal: string | null;
          secondary_goal: string | null;
          tertiary_goal: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          education?: string | null;
          career_domain?: string | null;
          primary_goal?: string | null;
          secondary_goal?: string | null;
          tertiary_goal?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          education?: string | null;
          career_domain?: string | null;
          primary_goal?: string | null;
          secondary_goal?: string | null;
          tertiary_goal?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          level: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          level?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_id?: string;
          level?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      interests: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_interests: {
        Row: {
          id: string;
          user_id: string;
          interest_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          interest_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          technologies: string[] | null;
          status: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          technologies?: string[] | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          technologies?: string[] | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      connections: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          user_id: string;
          matched_user_id: string | null;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          matched_user_id?: string | null;
          score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          matched_user_id?: string | null;
          score?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      career_roadmaps: {
        Row: {
          id: string;
          user_id: string;
          target_career: string | null;
          current_stage: string | null;
          next_action: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_career?: string | null;
          current_stage?: string | null;
          next_action?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_career?: string | null;
          current_stage?: string | null;
          next_action?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
