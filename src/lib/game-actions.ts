// src/lib/game-actions.ts
"use server"; // Applichiamo la direttiva a tutto il file

import { redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "~/types/supabase";

export const getGameData = async () => {
  const event = getRequestEvent();

  if (!event?.locals.user) {
    throw redirect("/login");
  }

  const supabase = createServerClient<Database>(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key: string) {
          return event.request.headers.get("cookie")?.split('; ').find(c => c.startsWith(key + '='))?.split('=')[1];
        },
        set(key: string, value: string, options: CookieOptions) {
          event.response.headers.append("Set-Cookie", `${key}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`);
        },
        remove(key: string, options: CookieOptions) {
          event.response.headers.append("Set-Cookie", `${key}=; Path=${options.path}; Max-Age=0; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`);
        },
      },
    }
  );

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      planets ( * )
    `)
    .eq("id", event.locals.user.id)
    .single();
    
  if (error || !profile) {
    throw redirect("/login");
  }

  return profile;
};