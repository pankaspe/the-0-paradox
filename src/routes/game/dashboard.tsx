// src/routes/game/dashboard.tsx
import { Show } from "solid-js";
import StatsCard from "~/components/game/dashboard/StatsCard";
import { gameStore } from "~/lib/gameStore";
import Loader from "~/components/ui/Loader";

export default function DashboardPage() {
  return (
    <div class="w-full h-full overflow-y-auto"> 
        <div class="max-w-7xl w-full mx-auto p-4 md:p-6 pb-24">
          <h1 class="text-4xl font-bold text-biolume mb-6">Dashboard</h1>
          <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
            <Show when={gameStore.profile} fallback={<p class="text-red-400">{gameStore.error}</p>}>
              {(profile) => (
                <div class="animate-fade-in">
                  <p class="text-xl">
                    Bentornata, <span class="font-bold text-biolume">{profile().username || "Entità"}</span>.
                  </p>
                  <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatsCard title="Statistiche Entità">
                      <p>Frammenti d'Anima: <span class="font-mono text-biolume">{profile().soul_fragments}</span></p>
                      <p>Energia: <span class="font-mono text-biolume">{profile().energy}</span></p>
                    </StatsCard>
                    <StatsCard title="Pianeta Attivo">
                      <p>Età del Pianeta: <span class="font-mono text-biolume">{profile().biomes[0]?.bioma_age || 0} Anni</span></p>
                      <p>Nome: <span class="font-mono text-biolume">{profile().biomes[0]?.bioma_name || 'Senza Nome'}</span></p>
                    </StatsCard>
                  </div>
                </div>
              )}
            </Show>
          </Show>
        </div>
    </div>
  );
}