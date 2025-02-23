
import { supabase } from "@/integrations/supabase/client";

export async function saveConversationMetrics(conversationId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No active session");

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
      headers: {
        "xi-api-key": "sk_729872231a93bc5197640dbe5a05c2c2f9b37c438745109c"
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation data');
    }

    const data = await response.json();
    
    // Extract required metrics
    const detected_errors = data.analysis.data_collection_results.detected_errors.value;
    const pronunciation_score = data.analysis.data_collection_results.pronunciation_score.value;
    const correction_attempts = data.analysis.data_collection_results.correction_attempts.value;
    const duration_seconds = data.metadata.call_duration_secs;

    // Save to database
    const { error } = await supabase
      .from('conversation_metrics')
      .insert({
        user_id: session.user.id,
        conversation_id: conversationId,
        detected_errors,
        pronunciation_score,
        correction_attempts,
        duration_seconds
      } as Database['public']['Tables']['conversation_metrics']['Row']);

    if (error) throw error;

  } catch (error) {
    console.error('Error saving conversation metrics:', error);
    throw error;
  }
}
