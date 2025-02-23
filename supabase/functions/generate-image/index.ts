
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FAL_KEY = Deno.env.get("FAL_KEY");
const FAL_API_URL = "https://api.fal.ai/api/v1/lora/flux/stability";

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

    console.log("Starting image generation for scenario:", scenario);
    
    const response = await fetch(FAL_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Realistic scene of ${scenario}, photographic style, detailed environment, natural lighting`,
      }),
    });

    if (!response.ok) {
      throw new Error(`FAL AI API error: ${response.statusText}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ 
        imageUrl: result.images?.[0]?.url || result.image?.url,
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
