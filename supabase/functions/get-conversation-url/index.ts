
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { scenario, language, difficulty, nativeLanguage } = await req.json()
    console.log('Received request with params:', { scenario, language, difficulty, nativeLanguage })

    // For now, using a fixed agent ID - you'll need to replace this with your actual agent ID
    const agentId = 'ruoVlk0cqI7iUAoJOGLx'
    console.log('Using agent ID:', agentId)

    return new Response(
      JSON.stringify({
        agent_id: agentId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in get-conversation-url function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
