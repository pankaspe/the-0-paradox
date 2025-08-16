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
          get: (key) => event.request.headers.get("cookie")?.split('; ').find(c => c.startsWith(key + '='))?.split('=')[1],
          set: (key, value, options) => event.response.headers.append("Set-Cookie", `${key}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`),
          remove: (key, options) => event.response.headers.append("Set-Cookie", `${key}=; Path=${options.path}; Max-Age=0; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`),
        },
      }
    );

    // 1. Otteniamo l'utente
    const { data: { user } } = await supabase.auth.getUser();
    event.locals.user = user;

    const isUserLoggedIn = !!user;
    const isAuthRoute = pathname === '/login' || pathname === '/register';
    const isGameRoute = pathname.startsWith('/game');

    // 2. CASO A: Utente loggato che prova ad andare su /login o /register
    if (isUserLoggedIn && isAuthRoute) {
      // Reindirizzalo via, non ha senso che sia qui.
      return redirect('/game/bioma');
    }

    // 3. CASO B: Utente NON loggato che prova ad andare in una rotta di gioco
    if (!isUserLoggedIn && isGameRoute) {
      // Reindirizzalo al login. Questo risolve il tuo problema del 404.
      return redirect('/login');
    }

    // 4. In tutti gli altri casi (utente loggato in rotta di gioco, utente sloggato
    // su rotta pubblica come '/'), non fare nulla e lascia che la richiesta proceda.
  },
});