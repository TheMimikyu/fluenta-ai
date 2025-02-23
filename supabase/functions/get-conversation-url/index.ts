
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')!;
const AGENT_ID = 'ruoVlk0cqI7iUAoJOGLx';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting conversation setup with ElevenLabs...');
    
    // Get the request body and authorization header
    const { scenario, language: target_language, difficulty, nativeLanguage: native_language } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client to get user data
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user data from the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user) {
      throw new Error('Failed to get user data');
    }

    // Get user's full name from profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to get user profile');
    }

    const user_name = profile.full_name || 'Student';
    console.log('Got user name:', user_name);

    // Request headers for ElevenLabs API
    const headers = new Headers({
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    });

    // Get the signed URL with dynamic variables
    const urlResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${AGENT_ID}&user_name=${encodeURIComponent(user_name)}&target_language=${encodeURIComponent(target_language)}&environment=${encodeURIComponent(scenario)}&difficulty=${encodeURIComponent(difficulty)}&native_language=${encodeURIComponent(native_language)}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!urlResponse.ok) {
      throw new Error(`ElevenLabs API error: ${await urlResponse.text()}`);
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
