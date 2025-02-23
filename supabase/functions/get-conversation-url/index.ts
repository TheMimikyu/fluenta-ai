
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

    // Get the signed URL from ElevenLabs using the correct endpoint
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversation/get_signed_url",
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${await response.text()}`);
    }

    const { signed_url } = await response.json();
    console.log('Successfully received conversation URL:', signed_url);

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
