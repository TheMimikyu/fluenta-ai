
interface ConversationMetrics {
  id: string;
  user_id: string;
  conversation_id: string;
  detected_errors?: string;
  pronunciation_score?: number;
  correction_attempts?: number;
  duration_seconds?: number;
  created_at: string;
}

declare global {
  type Database = {
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
        };
        conversation_metrics: {
          Row: ConversationMetrics;
        };
      };
    };
  };
}
