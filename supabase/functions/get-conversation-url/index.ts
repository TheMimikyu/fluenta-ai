
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')!;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting conversation setup with ElevenLabs...');
    
    // Get the request body
    const { scenario, language } = await req.json();
    console.log('Received scenario:', scenario, 'language:', language);

    // Request headers for ElevenLabs API
    const headers = new Headers({
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    });

    // First, create the conversation agent
    const createResponse = await fetch(
      "https://api.elevenlabs.io/v1/convai/agents",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: "Language Practice Assistant",
          description: "A language tutor that helps users practice conversations",
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

    if (!createResponse.ok) {
      throw new Error(`ElevenLabs API error (create agent): ${await createResponse.text()}`);
    }

    const { agent_id } = await createResponse.json();
    console.log('Successfully created agent with ID:', agent_id);

    // Then, get the signed URL for this agent
    const urlResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agent_id}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!urlResponse.ok) {
      throw new Error(`ElevenLabs API error (get URL): ${await urlResponse.text()}`);
    }

    const { signed_url } = await urlResponse.json();
    console.log('Successfully received conversation URL');

    return new Response(
      JSON.stringify({ conversation_url: signed_url }),
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
