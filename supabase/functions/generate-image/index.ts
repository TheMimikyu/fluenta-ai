
import { serve } from "https://deno.fresh.dev/std@v1/http/server.ts";
// Using the ESM URL for fal-ai
import { fal } from "https://esm.sh/@fal-ai/serverless-client@1.2.3";
import { corsHeaders } from "../_shared/cors.ts";

const FAL_KEY = Deno.env.get("FAL_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario } = await req.json();

    if (!FAL_KEY) {
      console.error("FAL_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Configure fal-ai client
    fal.config({
      credentials: FAL_KEY
    });

    console.log("Starting image generation for scenario:", scenario);
    
    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt: `Realistic scene of ${scenario}, photographic style, detailed environment, natural lighting`,
      },
      logs: true,
    });

    return new Response(
      JSON.stringify({ 
        imageUrl: result.data.images?.[0]?.url,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
