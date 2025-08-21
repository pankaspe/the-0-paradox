import { type RouteSectionProps } from "@solidjs/router";
import { createEffect, Show, type Component } from "solid-js";
import Topbar from "~/components/game/layout/Topbar";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { Toast } from "~/components/ui/Toast";
import Loader from "~/components/ui/Loader";
import { Motion, Presence } from "solid-motionone";
import { ItemDropModal } from "~/components/ui/ItemDropModal";
import { OnboardingTutorial } from "~/components/game/layout/OnboardingTutorial";
import { supabase } from "~/lib/supabase.client";

/**
 * Componente per lo sfondo animato.
 */
const AnimatedBackground: Component = () => {
  return (
    <div class="absolute inset-0 -z-10 overflow-hidden bg-page transition-colors duration-500">
      <div class="animated-grid" />
      <Motion.div
        class="absolute top-0 left-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        animate={{ x: [-100, 200, -100], y: [50, 250, 50] }}
        transition={{ duration: 60, repeat: Infinity, direction: 'alternate', easing: 'ease-in-out' }}
      />
      <Motion.div
        class="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl"
        animate={{ x: [100, -200, 100], y: [-50, -250, -50] }}
        transition={{ duration: 70, repeat: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: 5 }}
      />
    </div>
  );
};

/**
 * Layout principale per tutte le schermate di gioco.
 */
export default function GameLayout(props: RouteSectionProps) {


  createEffect(async () => {
    // 1. Chiediamo subito la sessione. Questo inizializza il client.
    const { data: { session } } = await supabase.auth.getSession();
    
    // 2. A PRESCINDERE dal risultato, ora sappiamo lo stato.
    // Se c'è una sessione o no, l'autenticazione è "pronta".
    gameStoreActions.setAuthReady(true);
    
    // 3. SE c'è una sessione, carichiamo i dati.
    if (session && !gameStore.profile) {
      gameStoreActions.loadInitialData();
    }
  });

  return (
    <>
      <style>{`
        .animated-grid {
          width: 100vw; height: 100vh; position: fixed;
          top: 0; left: 0; z-index: -1;
          background-image: linear-gradient(to right, var(--color-border) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: pan 60s linear infinite;
        }
        @keyframes pan { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
      `}</style>

      <div class="h-screen w-screen text-text-main flex flex-col overflow-hidden font-mono relative transition-colors duration-500">
        
        <AnimatedBackground />

               {/* 3. La nostra logica di rendering ora ha 3 stati */}
        <Show 
          when={gameStore.authReady} 
          fallback={<Loader inCenter={true} text="Verifica autorizzazione..." />}
        >
          {/* Se l'autenticazione è pronta, mostriamo il resto */}
          <Show when={gameStore.profile && gameStore.profile.username === null}>
            <OnboardingTutorial />
          </Show>

          <Toast />
          <Topbar />
          
          <main class="flex-1 overflow-y-auto pt-16">
            <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
              <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Show when={!gameStore.error} fallback={<div class="p-8 text-center text-error">{gameStore.error}</div>}>
                  {props.children}
                </Show>
              </Motion.div>
            </Show>
          </main>

          <Presence>
            <Show when={gameStore.droppedItemModal}>
              <ItemDropModal item={gameStore.droppedItemModal!} />
            </Show>
          </Presence>
        </Show>
      </div>
    </>
  );
}