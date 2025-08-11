// src/routes/game/dashboard.tsx
import { createAsync } from "@solidjs/router";
import { Show, onMount, Suspense, type Component } from "solid-js";
import { getGameData } from "~/lib/game-actions"; // Importiamo la nostra azione
import StatsCard from "~/components/game/dashboard/StatsCard"; // Importiamo il nostro componente UI
import { animate, stagger } from "motion"; // Importiamo le funzioni di animazione
import type { Tables } from "~/types/supabase";
import Loader from "~/components/ui/Loader";

type ProfileData = Tables<'profiles'> & { planets: Tables<'planets'>[] };

{/* DASHBOARD VIEW COMPONENT */}
const DashboardView: Component<{ profile: ProfileData }> = (props) => {
  onMount(() => {
    const keyframes: Record<string, any> = {
      opacity: [0, 1],
      transform: ["translateY(10px)", "translateY(0px)"],
    };

    const options = {
      delay: stagger(0.2),
      duration: 0.8,
      easing: "ease-in-out" as const, 
    };

    animate(".animate-on-load", keyframes, options);
  });

  return (
    <>
      <p class="text-xl animate-on-load">
        Benvenuto, Entità {props.profile.username || props.profile.id}.
      </p>
      
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="animate-on-load">
          <StatsCard title="Statistiche Entità">
            <p>Frammenti d'Anima: <span class="font-mono text-biolume">{props.profile.soul_fragments}</span></p>
            <p>Energia: <span class="font-mono text-biolume">{props.profile.energy}</span></p>
          </StatsCard>
        </div>

        <div class="animate-on-load">
          <StatsCard title="Pianeta Attivo">
            <p>Età del Pianeta: <span class="font-mono text-biolume">{props.profile.planets[0]?.planet_age || 0} Anni</span></p>
            <p>Nome: <span class="font-mono text-biolume">{props.profile.planets[0]?.planet_name || 'Senza Nome'}</span></p>
          </StatsCard>
        </div>
      </div>
    </>
  );
};
{/* END DASHBOARD VIEW COMPONENT */}


{/* MAIN COMPONENT PAGE */}
export default function DashboardPage() {
  const profileData = createAsync(() => getGameData());

  return (
    <div class="max-w-4xl">
      <h1 class="text-4xl font-bold text-biolume mb-6">Dashboard dell'Entità</h1>
      
      {/* 1. Avvolgiamo tutto in <Suspense> e gli diamo il nostro Loader */}
      <Suspense fallback={<Loader />}>
        {/* 2. <Show> ora gestisce il caso in cui i dati arrivano ma sono null/error */}
        <Show when={profileData()} fallback={<p>Errore nel caricamento dei dati.</p>}>
          {(p) => <DashboardView profile={p()} />}
        </Show>
      </Suspense>
    </div>
  );
}