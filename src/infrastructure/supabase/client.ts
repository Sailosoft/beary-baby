import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Beary namespace schema (per spec: Namespace: beary, not public).
 * Selectable via DB_SCHEMA env var; defaults to "beary".
 */
export const schemaName = process.env.DB_SCHEMA || "beary";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BearySupabaseClient = SupabaseClient<any, string>;

function createDb(): BearySupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set. Copy .env.example to .env.local and fill them in.",
    );
  }

  return createClient(url, publishableKey, {
    db: { schema: schemaName },
    auth: { persistSession: false },
  });
}

// Lazy singleton: avoids throwing at module evaluation (e.g. during build
// page-data collection) and reuses one client across hot reloads.
const globalForDb = globalThis as unknown as {
  __bearySupabase?: BearySupabaseClient;
};

export function getSupabase(): BearySupabaseClient {
  if (!globalForDb.__bearySupabase) {
    globalForDb.__bearySupabase = createDb();
  }
  return globalForDb.__bearySupabase;
}
