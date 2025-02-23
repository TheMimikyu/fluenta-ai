
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FAL_KEY = Deno.env.get("FAL_KEY");
const FAL_API_URL = "https://queue.fal.run/fal-ai/flux-lora";

console.log("Edge function starting...");

serve(async (req) => {
  console.log("Received request:", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
  });

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request body",
          details: "Request body must be valid JSON"
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Parsed request body:", body);

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
        return new Response(
          JSON.stringify({ 
            error: "FAL API error",
            details: `${response.status}: ${response.statusText}`
          }),
          { 
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Error parsing FAL API response:", parseError);
        return new Response(
          JSON.stringify({ 
            error: "Invalid FAL API response",
            details: "Could not parse response from FAL API"
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      console.log("Initial FAL API response:", result);

      if (!result.request_id) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid response",
            details: "No request ID received from FAL AI"
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Poll for the result using the request ID
      const pollUrl = `${FAL_API_URL}/${result.request_id}`;
      let imageUrl = null;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts && !imageUrl) {
        console.log(`Polling attempt ${attempts + 1} for request ID: ${result.request_id}`);
        
        const pollResponse = await fetch(pollUrl, {
          method: "GET",
          headers: {
            "Authorization": `Key ${FAL_KEY}`,
            "Content-Type": "application/json",
          },
        });

        if (!pollResponse.ok) {
          const errorText = await pollResponse.text();
          console.error("Poll error response:", errorText);
          return new Response(
            JSON.stringify({ 
              error: "Polling error",
              details: `${pollResponse.status}: ${pollResponse.statusText}`
            }),
            { 
              status: pollResponse.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }

        let pollResult;
        try {
          pollResult = await pollResponse.json();
        } catch (parseError) {
          console.error("Error parsing poll response:", parseError);
          return new Response(
            JSON.stringify({ 
              error: "Invalid polling response",
              details: "Could not parse polling response"
            }),
            { 
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }

        console.log("Poll result:", pollResult);

        if (pollResult.status === "completed" && pollResult.image?.url) {
          imageUrl = pollResult.image.url;
          console.log("Successfully received image URL:", imageUrl);
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!imageUrl) {
        return new Response(
          JSON.stringify({ 
            error: "Timeout",
            details: "Image generation timed out or failed"
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } catch (fetchError) {
      console.error("Fetch error details:", fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Network error",
          details: fetchError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ 
        error: "Server error",
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
