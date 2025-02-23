
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

    // Step 1: Submit the initial request
    console.log("Submitting initial request to FAL API with scenario:", scenario);
    const initialResponse = await fetch(FAL_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Realistic scene of ${scenario}, photographic style, detailed environment, natural lighting`,
      }),
    });

    if (!initialResponse.ok) {
      const errorText = await initialResponse.text();
      console.error("FAL API initial request error:", errorText);
      return new Response(
        JSON.stringify({
          error: "FAL API error",
          details: `${initialResponse.status}: ${initialResponse.statusText}`
        }),
        {
          status: initialResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const initialData = await initialResponse.json();
    console.log("FAL API initial response:", initialData);

    if (!initialData.request_id) {
      return new Response(
        JSON.stringify({
          error: "Invalid FAL response",
          details: "No request ID received"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const requestId = initialData.request_id;
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 1000;

    // Step 2: Poll for status until complete
    while (attempts < maxAttempts && !imageUrl) {
      console.log(`Polling attempt ${attempts + 1} for request ${requestId}`);
      
      // Check status
      const statusUrl = `${FAL_API_URL}/requests/${requestId}/status`;
      const statusResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Authorization": `Key ${FAL_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!statusResponse.ok) {
        console.error(`Status check failed on attempt ${attempts + 1}:`, await statusResponse.text());
        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      const statusData = await statusResponse.json();
      console.log("Status response:", statusData);

      if (statusData.status === "COMPLETED") {
        // Step 3: Get the final result using the response_url from status
        const resultResponse = await fetch(statusData.response_url, {
          method: "GET",
          headers: {
            "Authorization": `Key ${FAL_KEY}`,
            "Content-Type": "application/json",
          },
        });

        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          console.log("Result data:", resultData);
          
          // Check for images array and get the first image URL
          if (resultData.images?.[0]?.url) {
            imageUrl = resultData.images[0].url;
            break;
          } else {
            console.error("No image URL in result data:", resultData);
          }
        } else {
          console.error("Failed to get result:", await resultResponse.text());
        }
      } else if (statusData.status === "FAILED") {
        return new Response(
          JSON.stringify({
            error: "Generation failed",
            details: statusData.error || "Image generation failed"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          error: "Generation timeout",
          details: "Image generation timed out or no image URL received"
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
