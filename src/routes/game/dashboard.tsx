// src/routes/game/dashboard.tsx
import { createAsync, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { Show } from "solid-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "~/types/supabase";

// 1. Creiamo una funzione server più potente per prendere tutti i dati di gioco.
const getGameData = async () => {
  "use server";
  const event = getRequestEvent();

  // Se l'utente non è in locals, il middleware ha già reindirizzato,
  // ma questo è un controllo di sicurezza extra.
  if (!event?.locals.user) {
    throw redirect("/login");
  }

  // Creiamo un client Supabase sul server
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

  // 2. Eseguiamo la query per ottenere il profilo e il pianeta attivo.
  // La magia di Supabase: con `planets(*)` fa una "join" automatica!
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      planets ( * )
    `)
    .eq("id", event.locals.user.id)
    .single(); // .single() ci assicura di ottenere un solo oggetto, non un array.

  if (error || !profile) {
    // Se c'è un errore o il profilo non esiste, qualcosa è andato storto.
    // Meglio mandare l'utente al login.
    throw redirect("/login");
  }

  return profile;
};

// 3. Il nostro componente, ora più ricco.
export default function DashboardPage() {
  // Chiamiamo la nostra nuova funzione server
  const profileData = createAsync(() => getGameData());

  return (
    <div class="max-w-4xl">
      <h1 class="text-4xl font-bold text-biolume mb-4">Dashboard dell'Entità</h1>
      
      <Show when={profileData()} fallback={<p>Caricamento dati Entità...</p>}>
        {/* Qui `p` è l'Accessor, quindi dobbiamo chiamarlo come funzione: p() */}
        {(p) => (
          <div>
            <p class="text-xl">
              Benvenuto, Entità {p().username || p().id}.
            </p>
            
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-starlight/10 p-4 rounded-md">
                <h3 class="text-lg font-bold text-biolume/80">Statistiche Entità</h3>
                <p>Frammenti d'Anima: <span class="font-mono text-biolume">{p().soul_fragments}</span></p>
                <p>Energia: <span class="font-mono text-biolume">{p().energy}</span></p>
              </div>

              <div class="bg-starlight/10 p-4 rounded-md">
                <h3 class="text-lg font-bold text-biolume/80">Pianeta Attivo</h3>
                <p>Età del Pianeta: <span class="font-mono text-biolume">{p().planets[0]?.planet_age || 0} Anni</span></p>
                <p>Nome: <span class="font-mono text-biolume">{p().planets[0]?.planet_name || 'Senza Nome'}</span></p>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}