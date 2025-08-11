// src/middleware.ts (versione finale e completa)
import { createMiddleware } from "@solidjs/start/middleware";
import { redirect } from "@solidjs/router";
import { createServerClient } from "@supabase/ssr";

export default createMiddleware({
  onRequest: async (event) => {
    const url = new URL(event.request.url);
    const pathname = url.pathname;

    // Creiamo il client Supabase subito, ci servirà in ogni caso.
    const supabase = createServerClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (key) => event.request.headers.get("cookie")?.split('; ').find(c => c.startsWith(key + '='))?.split('=')[1],
        },
      }
    );

    // Verifichiamo lo stato dell'utente con il metodo sicuro.
    const { data: { user } } = await supabase.auth.getUser();
    event.locals.user = user; // Salviamo l'utente (o null) in locals per dopo.

    // --- NUOVA LOGICA: GESTIONE DELLE ROTTE PUBBLICHE PER UTENTI LOGGATI ---
    const publicRoutes = ['/login', '/register']; // Aggiungi qui altre rotte se necessario
    
    if (user && publicRoutes.includes(pathname)) {
      // Se l'utente è loggato (`user` esiste) E sta cercando di visitare
      // una delle rotte pubbliche, lo reindirizziamo alla sua dashboard.
      return redirect("/game/dashboard");
    }
    
    // --- LOGICA ESISTENTE: PROTEZIONE DELLE ROTTE PRIVATE ---
    const isGameRoute = pathname.startsWith('/game');

    if (!user && isGameRoute) {
      // Se l'utente NON è loggato E sta cercando di visitare una rotta di gioco,
      // lo reindirizziamo alla pagina di login.
      return redirect("/login");
    }

    // Se nessuna delle condizioni sopra è vera, la richiesta può procedere normalmente.
  },
});