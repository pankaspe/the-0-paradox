// src/middleware.ts
import { createMiddleware } from "@solidjs/start/middleware";
import { redirect } from "@solidjs/router";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export default createMiddleware({
  onRequest: async (event) => {
    const url = new URL(event.request.url);
    const pathname = url.pathname;

    const supabase = createServerClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Passiamo l'intero oggetto event.nativeEvent che contiene
          // gli helper per la gestione dei cookie.
          // Questo è il modo moderno e più semplice.
          // NOTA: Richiede di importare `getCookie, setCookie, deleteCookie` da `vinxi/http`
          // ma spesso `createServerClient` li gestisce internamente se gli passi l'evento.
          // Per la massima compatibilità, definiamo i metodi manualmente.
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

    const { data: { user } } = await supabase.auth.getUser();
    event.locals.user = user;

    const publicRoutes = ['/login', '/register'];
    if (user && publicRoutes.includes(pathname)) {
      return redirect("/game/dashboard");
    }
    
    const isGameRoute = pathname.startsWith('/game');
    if (!user && isGameRoute) {
      return redirect("/login");
    }
  },
});