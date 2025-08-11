// src/lib/supabase.client.ts
import { createBrowserClient } from "@supabase/ssr";

// Definiamo un tipo per il nostro database per avere l'autocompletamento in futuro
// Lo lasceremo vuoto per ora
export type Database = any; // TODO: Generare i tipi dal database

export const supabase = createBrowserClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);