// src/routes/game/dashboard.tsx
import { Show } from "solid-js";
import { createAsync } from "@solidjs/router";
import StatsCard from "~/components/game/dashboard/StatsCard";
import { getGameData } from "~/lib/game-actions"; // La dashboard ora chiama l'azione direttamente

export default function DashboardPage() {
  // 1. La dashboard ora carica i suoi dati, proprio come faceva la Topbar.
  const profileData = createAsync(() => getGameData());

  return (
    <div class="max-w-4xl">
      <h1 class="text-4xl font-bold text-biolume mb-6">Dashboard dell'Entità</h1>
      
      {/* 
        2. Usiamo <Show> con il nostro `Resource` locale.
           Poiché il caricamento avviene qui, e il genitore ha <Suspense>,
           il loader apparirà correttamente.
      */}
      <Show 
        when={profileData()} 
        fallback={<p class="text-red-400">Errore nel caricamento dei dati del profilo.</p>}
      >
        {(profile) => (
          <div>
            <p class="text-xl">
              Benvenuto, Entità {profile().username || profile().id}.
            </p>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard title="Statistiche Entità">
                <p>Frammenti d'Anima: <span class="font-mono text-biolume">{profile().soul_fragments}</span></p>
                <p>Energia: <span class="font-mono text-biolume">{profile().energy}</span></p>
              </StatsCard>
              <StatsCard title="Pianeta Attivo">
                <p>Età del Pianeta: <span class="font-mono text-biolume">{profile().planets[0]?.planet_age || 0} Anni</span></p>
                <p>Nome: <span class="font-mono text-biolume">{profile().planets[0]?.planet_name || 'Senza Nome'}</span></p>
              </StatsCard>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}