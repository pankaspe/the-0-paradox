// src/components/game/layout/Topbar.tsx
import { type Component, createSignal, Show, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web"; // Importiamo `isServer`
import { Motion, Presence } from "solid-motionone";
import { A } from "@solidjs/router";
import LogoutButton from "../LogoutButton";
import { IoDiamondOutline, IoFlashOutline } from "solid-icons/io";
import { VsAccount } from "solid-icons/vs";

interface TopbarProps {
  username: string | null;
  soul_fragments: number;
  energy: number;
  avatar_id: string | null;
}

const Topbar: Component<TopbarProps> = (props) => {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  let menuRef: HTMLDivElement | undefined;

  // Questa logica ora viene eseguita solo nel browser
  if (!isServer) {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef && !menuRef.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    onMount(() => {
      document.addEventListener("mousedown", handleClickOutside);
    });

    onCleanup(() => {
      document.removeEventListener("mousedown", handleClickOutside);
    });
  }

  return (
    // 1. Il contenitore ora è una "pillola" fluttuante
    <Motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, easing: "ease-out" }}
      // Aggiungiamo `pointer-events-auto` per renderla di nuovo cliccabile
      class="pointer-events-auto w-full max-w-5xl mx-auto h-16 flex-shrink-0 bg-abyss/80 backdrop-blur-lg border border-starlight/10 rounded-full shadow-2xl shadow-starlight/5 flex items-center justify-between px-6"
    >
      {/* 2. Messaggio di Benvenuto Personalizzato */}
      <div>
        <p class="text-ghost/80">
          Bentornata, <span class="font-bold text-biolume">{props.username || "Entità"}</span>
        </p>
      </div>

      {/* 3. Statistiche e Profilo (a destra) - Invariati nella logica */}
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-ghost/80">
            <IoDiamondOutline class="w-5 h-5 text-biolume" />
            <span class="font-mono">{props.soul_fragments}</span>
          </div>
          <div class="flex items-center gap-2 text-ghost/80">
            <IoFlashOutline class="w-5 h-5 text-yellow-400" />
            <span class="font-mono">{props.energy}</span>
          </div>
        </div>
        
        <div class="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen())}
            class="w-10 h-10 rounded-full bg-starlight/20 flex items-center justify-center transition hover:bg-starlight/30"
          >
            <VsAccount class="w-6 h-6 text-ghost" />
          </button>
          <Presence>
            <Show when={isMenuOpen()}>
              <Motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, easing: "ease-in-out" }}
                class="absolute right-0 mt-2 w-48 bg-abyss border border-starlight/20 rounded-md shadow-lg p-2 z-50"
              >
                <A href="/game/profile" class="block w-full text-left px-4 py-2 text-sm text-ghost rounded hover:bg-starlight/20">Profilo</A>
                <A href="/game/bioma" class="block w-full text-left px-4 py-2 text-sm text-ghost rounded hover:bg-starlight/20">Il Mio Bioma</A>
                <div class="my-1 h-px bg-starlight/10" />
                <LogoutButton class="block w-full text-left px-4 py-2 text-sm text-ghost rounded hover:bg-starlight/20" />
              </Motion.div>
            </Show>
          </Presence>
        </div>
      </div>
    </Motion.header>
  );
};

export default Topbar;