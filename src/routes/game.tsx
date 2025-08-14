// src/routes/game.tsx

import { useLocation, type RouteSectionProps } from "@solidjs/router";
import { onMount, Show } from "solid-js";
import SideNav from "~/components/game/SideNav";
import Topbar from "~/components/game/layout/Topbar";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { Toast } from "~/components/ui/Toast";
// --- NUOVI IMPORT ---
import { Motion, Presence } from "solid-motionone";
import { TbLayoutSidebarLeftExpand } from "solid-icons/tb";


export default function GameLayout(props: RouteSectionProps) {
  // Quando il layout viene montato, lancia il caricamento dei dati
  onMount(() => {
    gameStoreActions.loadInitialData();
  });

  const location = useLocation(); // Hook per ottenere l'URL corrente

  // Determina se siamo nella pagina del bioma
  const isBiomaPage = () => location.pathname === "/game/bioma";

  return (
    <div class="h-screen text-ghost flex overflow-hidden">
      <Toast />
      <SideNav />
      <div class="relative flex-1 flex flex-col w-full">
        
        {/* --- CONTENITORE TOPBAR MODIFICATO --- */}
        {/* Questo div ora contiene sia la Topbar che il pulsante per mostrarla. */}
        <div class="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 pointer-events-none">
          
          {/* Usiamo <Presence> per animare l'entrata e l'uscita della Topbar */}
          <Presence>
            {/* Usiamo <Show> per renderizzare la Topbar solo se gameStore.isTopbarVisible è true */}
            <Show when={gameStore.isTopbarVisible}>
              <Motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.5, easing: "ease-in-out" }}
              >
                <Topbar 
                  username={gameStore.profile?.username ?? null}
                  soul_fragments={gameStore.profile?.soul_fragments ?? 0}
                  energy={gameStore.profile?.energy ?? 0}
                  avatar_id={gameStore.profile?.active_avatar_id ?? null}
                  // Colleghiamo il pulsante 'nascondi' all'azione dello store
                  onToggleVisibility={gameStoreActions.toggleTopbar}
                />
              </Motion.div>
            </Show>
          </Presence>

          {/* --- PULSANTE PER MOSTRARE LA TOPBAR --- */}
          {/* Questo pulsante appare solo quando la Topbar è nascosta */}
          <Show when={!gameStore.isTopbarVisible}>
             <Motion.button
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, easing: "ease-in-out", delay: 0.1 }}
                onClick={gameStoreActions.toggleTopbar}
                class="pointer-events-auto absolute top-4 md:top-6 left-4 md:left-6 w-12 h-12 flex items-center justify-center bg-abyss/80 backdrop-blur-lg border border-starlight/10 rounded-full shadow-lg hover:border-biolume transition-colors"
                title="Mostra la barra"
             >
                <TbLayoutSidebarLeftExpand class="w-6 h-6 text-ghost" />
             </Motion.button>
          </Show>
        </div>
        
        <main class={`flex-1 overflow-y-auto transition-all duration-500 ${isBiomaPage() ? 'p-0' : 'p-4 md:p-8'}`}>
          {/* 
            Questo padding è stato modificato per essere condizionale. 
            Se la topbar è visibile, aggiunge lo spazio in alto. Altrimenti no.
            Ho aggiunto anche una transizione per rendere il cambio di padding più fluido.
          */}
          <div class={`${gameStore.isTopbarVisible ? 'pt-24' : 'pt-8'} ${!isBiomaPage() ? 'pb-20 md:pb-8 px-4 md:px-0' : 'h-full'}`}>
            {props.children}
          </div>
        </main>
      </div>
    </div>
  );
}