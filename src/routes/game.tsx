// src/routes/game.tsx

import { type RouteSectionProps } from "@solidjs/router";
import { onMount, Show } from "solid-js";
import Topbar from "~/components/game/layout/Topbar";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { Toast } from "~/components/ui/Toast";
import Loader from "~/components/ui/Loader";

export default function GameLayout(props: RouteSectionProps) {
  onMount(() => {
    gameStoreActions.loadInitialData();
  });

  return (
    // =================================================================
    // >>> LA MODIFICA È QUI <<<
    // Aggiungiamo 'transition-colors' e 'duration-500' per animare
    // il cambio di colore dello sfondo (bg-page) e del testo (text-text-main).
    // =================================================================
    <div class="h-screen w-screen bg-page text-text-main flex flex-col overflow-hidden font-sans transition-colors duration-500">
      <Toast />
      <Topbar />
      
      <main class="flex-1 overflow-y-auto pt-16">
        <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
          <Show when={!gameStore.error} fallback={<div class="p-8 text-center text-error">{gameStore.error}</div>}>
            {props.children}
          </Show>
        </Show>
      </main>
    </div>
  );
}