import { type RouteSectionProps } from "@solidjs/router";
import { onMount, Show } from "solid-js";
import Topbar from "~/components/game/layout/Topbar";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { Toast } from "~/components/ui/Toast";
import Loader from "~/components/ui/Loader"; // Assicurati che il percorso sia corretto

export default function GameLayout(props: RouteSectionProps) {
  // All'avvio, lancia il caricamento dei dati. Corretto e invariato.
  onMount(() => {
    gameStoreActions.loadInitialData()
  });

  return (
    <div class="h-screen w-screen bg-abyss text-ghost flex flex-col overflow-hidden">
      <Toast />
      
      {/* 1. La Topbar è un elemento fisso del layout. */}
      <Topbar />
      
      <main class="flex-1 overflow-y-auto">
        <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
          <Show when={!gameStore.error} fallback={<div class="p-8 text-center text-red-400">{gameStore.error}</div>}>
            {props.children}
          </Show>
        </Show>
      </main>
    </div>
  );
}