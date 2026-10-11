import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Creates a privileged Supabase client using the SERVICE_ROLE_KEY.
 *
 * CRITICAL SECURITY RULES:
 * 1. This client bypasses Row Level Security (RLS).
 * 2. It must ONLY be imported and executed in secure server environments (e.g., background jobs, privileged webhooks).
 * 3. It will throw an error immediately if executed in a browser/client environment.
 * 4. NEVER pass this client or the service role key to client components.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY VIOLATION: createAdminClient cannot and must not be used on the client side!"
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your server environment."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
