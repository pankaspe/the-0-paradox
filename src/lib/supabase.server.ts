// src/lib/supabase.server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { APIEvent } from "@solidjs/start/server";

export function createSupabaseServerClient(event: APIEvent) {
  const cookieOptions: CookieOptions = {
    path: "/",
    secure: true, // Imposta a true in produzione
    httpOnly: true,
    sameSite: "lax",
  };

  const supabase = createServerClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key: string) {
          return event.request.headers.get("cookie")
            ? event.request.headers.get("cookie")!.split('; ').find(row => row.startsWith(key + '='))?.split('=')[1]
            : undefined;
        },
        set(key: string, value: string, options: CookieOptions) {
          event.response.headers.append("Set-Cookie", `${key}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`);
        },
        remove(key: string, options: CookieOptions) {
          event.response.headers.append("Set-Cookie", `${key}=; Path=${options.path}; Max-Age=0; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`);
        },
      },
      cookieOptions,
    }
  );

  return supabase;
}