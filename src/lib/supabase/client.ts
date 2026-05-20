import { createBrowserClient } from '@supabase/ssr';
import { createClient as createNewClient } from '@supabase/supabase-js';

import { Database } from '@/types/database.types';

// ── Singletons ────────────────────────────────────────────────────────────────
// createBrowserClient ya maneja internamente un singleton por URL+key,
// pero lo hacemos explícito para garantizarlo en cualquier versión

let browserInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!browserInstance) {
    browserInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return browserInstance;
}

// Admin solo se usa en Server Actions / Route Handlers, nunca en el cliente
// NEXT_PUBLIC_* en el admin client sería un leak de la service role key
let adminInstance: ReturnType<typeof createNewClient<Database>> | null = null;

export function createAdminClient() {
  if (!adminInstance) {
    adminInstance = createNewClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← sin NEXT_PUBLIC_, solo server
    );
  }
  return adminInstance;
}
