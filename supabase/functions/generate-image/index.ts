
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FAL_KEY = Deno.env.get("FAL_KEY");
const FAL_API_URL = "https://queue.fal.run/fal-ai/flux-lora";

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
    console.log("Using FAL API URL:", FAL_API_URL);
    
    // Initial request to start image generation
    try {
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
        const errorText = await response.text();
        console.error("FAL API error response:", errorText);
        throw new Error(`FAL AI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Initial response:", result);

      if (!result.request_id) {
        throw new Error('No request ID received from FAL AI');
      }

      // Poll for the result using the request ID
      const pollUrl = `${FAL_API_URL}/${result.request_id}`;
      let imageUrl = null;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts && !imageUrl) {
        console.log(`Polling attempt ${attempts + 1} for request ID: ${result.request_id}`);
        const pollResponse = await fetch(pollUrl, {
          headers: {
            "Authorization": `Key ${FAL_KEY}`,
          },
        });

        if (!pollResponse.ok) {
          const errorText = await pollResponse.text();
          console.error("Poll error response:", errorText);
          throw new Error(`Error polling result: ${pollResponse.status} ${pollResponse.statusText}`);
        }

        const pollResult = await pollResponse.json();
        console.log("Poll result status:", pollResult.status);

        if (pollResult.status === "completed" && pollResult.image?.url) {
          imageUrl = pollResult.image.url;
          console.log("Successfully received image URL:", imageUrl);
          break;
        }

        // Wait 1 second before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!imageUrl) {
        throw new Error('Image generation timed out or failed');
      }

      return new Response(
        JSON.stringify({ 
          imageUrl,
          success: true 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } catch (fetchError) {
      console.error("Fetch error details:", fetchError);
      throw fetchError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: `Failed to generate image: ${error.toString()}`
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
