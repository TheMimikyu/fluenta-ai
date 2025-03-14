
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database";

type ConversationMetrics = Database['public']['Tables']['conversation_metrics']['Insert'];

export async function saveConversationMetrics(conversationId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No active session");

    // Fetch the complete conversation data with transcript and metrics
    console.log(`Fetching conversation data for ID: ${conversationId}`);
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
      headers: {
        "xi-api-key": "sk_729872231a93bc5197640dbe5a05c2c2f9b37c438745109c"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API response error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch conversation data: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received conversation data:", data);
    
    // Extract required metrics - handle potential undefined values safely
    const detected_errors = data.analysis?.data_collection_results?.detected_errors?.value || "";
    const pronunciation_score = parseFloat(data.analysis?.data_collection_results?.pronunciation_score?.value || 0);
    const correction_attempts = parseInt(data.analysis?.data_collection_results?.correction_attempts?.value || 0);
    const duration_seconds = data.metadata?.call_duration_secs || 0;
    
    // Get transcript summary, handling potential undefined values
    let transcript_summary = "";
    try {
      if (data.analysis?.transcript_summary) {
        transcript_summary = data.analysis.transcript_summary;
      } else if (data.dialogue && Array.isArray(data.dialogue)) {
        // If no summary, try to create one from dialogue array
        transcript_summary = data.dialogue
          .map(entry => `${entry.role}: ${entry.text}`)
          .join('\n');
      }
    } catch (error) {
      console.warn('Error extracting transcript summary:', error);
    }

    // Prepare metrics for storage
    const metrics: ConversationMetrics = {
      user_id: session.user.id,
      conversation_id: conversationId,
      detected_errors,
      pronunciation_score,
      correction_attempts,
      duration_seconds,
      transcript_summary
    };

    console.log("Saving metrics to database:", metrics);

    // Save to database
    const { error } = await supabase
      .from('conversation_metrics')
      .insert(metrics);

    if (error) {
      console.error('Database error when saving metrics:', error);
      throw error;
    }
    
    console.log("Metrics saved successfully");
    return { success: true, metrics };

  } catch (error) {
    console.error('Error saving conversation metrics:', error);
    throw error;
  }
}
