
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          avatar_url: string | null;
          full_name: string | null;
          email: string | null;
          username: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          avatar_url?: string | null;
          full_name?: string | null;
          email?: string | null;
          username?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          avatar_url?: string | null;
          full_name?: string | null;
          email?: string | null;
          username?: string | null;
        };
      };
      conversation_metrics: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string;
          detected_errors: string | null;
          pronunciation_score: number | null;
          correction_attempts: number | null;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id: string;
          detected_errors?: string | null;
          pronunciation_score?: number | null;
          correction_attempts?: number | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conversation_id?: string;
          detected_errors?: string | null;
          pronunciation_score?: number | null;
          correction_attempts?: number | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
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
}
