
import { fal } from "@fal-ai/client";

// Configure fal-ai client with the API key from Supabase secrets
fal.config({
  // The key is automatically injected from Supabase secrets
  credentials: import.meta.env.FAL_AI_API_KEY,
});

export { fal };
