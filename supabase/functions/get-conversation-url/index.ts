
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')!;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Fetching conversation URL from ElevenLabs...');
    
    // Get the request body
    const { scenario, language } = await req.json();

    // Request headers for ElevenLabs API
    const headers = new Headers({
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    });

    // Get the signed URL from ElevenLabs
    const response = await fetch(
      "https://api.elevenlabs.io/v1/conversation/start",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "eleven_turbo_v2",
          name: "Language Practice Assistant",
          description: "A language tutor that helps users practice conversations",
          variables: {
            scenario,
            language
          },
          system_prompt: `You are a helpful language tutor. The student wants to practice ${language} in the following scenario: ${scenario}. 
          Engage in a natural conversation, providing corrections and feedback when needed. Keep responses concise and focused on helping them improve their language skills.`,
          initial_message: `Hello! I'm your ${language} conversation partner for today. We'll practice a conversation about ${scenario}. Would you like to start?`,
          input_audio_config: {
            voice_id: "CwhRBWXzGAHq8TQ4Fs17", // Roger voice
            model_id: "eleven_multilingual_v2",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${await response.text()}`);
    }

    const data = await response.json();
    console.log('Successfully received conversation URL:', data);

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
