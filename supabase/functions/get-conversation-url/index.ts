
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
    const body = await req.json();
    console.log('Request body:', body);
    
    const { scenario, language: target_language, difficulty, nativeLanguage: native_language } = body;
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client to get user data
    console.log('Creating Supabase client...');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user data from the token
    console.log('Getting user data from token...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    console.log('User data result:', { user: !!user, error: userError });
    
    if (userError || !user) {
      throw new Error('Failed to get user data');
    }

    // Get user's full name from profiles
    console.log('Getting user profile...');
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    console.log('Profile data result:', { profile, error: profileError });

    if (profileError) {
      throw new Error('Failed to get user profile');
    }

    const user_name = profile.full_name || 'Student';
    console.log('Using user name:', user_name);

    // Request headers for ElevenLabs API
    const headers = new Headers({
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    });

    // Get the signed URL with dynamic variables
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${AGENT_ID}&user_name=${encodeURIComponent(user_name)}&target_language=${encodeURIComponent(target_language)}&environment=${encodeURIComponent(scenario)}&difficulty=${encodeURIComponent(difficulty)}&native_language=${encodeURIComponent(native_language)}`;
    console.log('Requesting signed URL:', url);
    
    const urlResponse = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!urlResponse.ok) {
      const errorText = await urlResponse.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${errorText}`);
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
