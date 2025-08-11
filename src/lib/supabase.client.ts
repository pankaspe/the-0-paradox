// src/lib/supabase.client.ts
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "~/types/supabase";

export const supabase = createBrowserClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);