import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FAL_KEY = Deno.env.get("FAL_KEY");
const FAL_API_URL = "https://queue.fal.run/fal-ai/flux-lora";

console.log("Edge function starting...");

serve(async (req) => {
  // Log request details
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Clone the request body for logging
    const reqBody = await req.text();
    console.log("Raw request body:", reqBody);

    // Parse the JSON body
    let body;
    try {
      body = JSON.parse(reqBody);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON",
          details: parseError.message
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Parsed body:", body);

    // Validate scenario
    const { scenario } = body;
    if (!scenario) {
      return new Response(
        JSON.stringify({
          error: "Missing scenario",
          details: "Scenario is required in the request body"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Validate FAL API key
    if (!FAL_KEY) {
      console.error("FAL_KEY not found");
      return new Response(
        JSON.stringify({
          error: "Configuration error",
          details: "FAL API key not configured"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Make initial request to FAL API
    console.log("Making request to FAL API with scenario:", scenario);
    const falResponse = await fetch(FAL_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Realistic scene of ${scenario}, photographic style, detailed environment, natural lighting`,
      }),
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error("FAL API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "FAL API error",
          details: `${falResponse.status}: ${falResponse.statusText}`
        }),
        {
          status: falResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const falData = await falResponse.json();
    console.log("FAL API initial response:", falData);

    if (!falData.status_url) {
      return new Response(
        JSON.stringify({
          error: "Invalid FAL response",
          details: "No status URL received"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Poll for results using the status_url
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts && !imageUrl) {
      console.log(`Polling attempt ${attempts + 1} using status URL: ${falData.status_url}`);
      const pollResponse = await fetch(falData.status_url, {
        method: "GET",
        headers: {
          "Authorization": `Key ${FAL_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.error(`Polling error on attempt ${attempts + 1}:`, errorText);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay between retries
        continue;
      }

      const pollData = await pollResponse.json();
      console.log("Poll response:", pollData);

      if (pollData.status === "completed" && pollData.image?.url) {
        imageUrl = pollData.image.url;
        break;
      } else if (pollData.status === "failed") {
        return new Response(
          JSON.stringify({
            error: "Generation failed",
            details: pollData.error || "Image generation failed"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between polls
      attempts++;
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          error: "Generation timeout",
          details: "Image generation timed out"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        imageUrl,
        success: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
