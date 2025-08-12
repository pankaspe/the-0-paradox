// src/routes/game.tsx
import { type RouteSectionProps } from "@solidjs/router";
import { Suspense, onMount } from "solid-js";
import SideNav from "~/components/game/SideNav";
import Topbar from "~/components/game/layout/Topbar";
import Loader from "~/components/ui/Loader";
import { gameStore, gameStoreActions } from "~/lib/gameStore";

export default function GameLayout(props: RouteSectionProps) {
  // Quando il layout viene montato, lancia il caricamento dei dati
  onMount(() => {
    gameStoreActions.loadInitialData();
  });

  return (
    <div class="h-screen bg-abyss text-ghost flex overflow-hidden">
      <SideNav />
      <div class="relative flex-1 flex flex-col w-full">
        <div class="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 pointer-events-none">
          {/* La Topbar ora legge direttamente dallo store globale */}
          <Topbar 
            username={gameStore.profile?.username ?? null}
            soul_fragments={gameStore.profile?.soul_fragments ?? 0}
            energy={gameStore.profile?.energy ?? 0}
            avatar_id={gameStore.profile?.active_avatar_id ?? null}
          />
        </div>
        
        <main class="flex-1 overflow-y-auto">
          <div class="pt-24 pb-20 md:pb-8 px-4 md:px-0 md:px-4">
            {props.children}
          </div>
        </main>
      </div>
    </div>
  );
}