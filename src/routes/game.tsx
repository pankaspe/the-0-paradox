import { type RouteSectionProps } from "@solidjs/router";
import { onMount, Show, type Component } from "solid-js";
import Topbar from "~/components/game/layout/Topbar";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { Toast } from "~/components/ui/Toast";
import Loader from "~/components/ui/Loader";
import { Motion } from "solid-motionone";

// 1. Definiamo il componente dello sfondo direttamente qui per semplicità
const AnimatedBackground: Component = () => {
  return (
    // Questo contenitore ha il colore di base (bg-page) E gli elementi animati
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

export default function GameLayout(props: RouteSectionProps) {
  onMount(() => {
    gameStoreActions.loadInitialData();
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

      {/* === LA MODIFICA CHIAVE È QUI === */}
      {/* Rimuoviamo la classe 'bg-page' da questo div. Ora è TRASPARENTE */}
      <div class="h-screen w-screen text-text-main flex flex-col overflow-hidden font-mono relative transition-colors duration-500">
        
        {/* Lo sfondo ora è l'unico elemento a fornire un colore di base */}
        <AnimatedBackground />

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
    </>
  );
}