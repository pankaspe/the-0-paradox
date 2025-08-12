// src/components/game/layout/Topbar.tsx
import { type Component, createSignal, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { A } from "@solidjs/router";
import LogoutButton from "../LogoutButton";

// Importiamo le icone
import { IoDiamondOutline, IoFlashOutline } from "solid-icons/io";
import { VsAccount } from "solid-icons/vs";

// Definiamo il tipo per i dati che la Topbar si aspetta di ricevere
interface TopbarProps {
  soul_fragments: number;
  energy: number;
  avatar_id: string | null; // Per ora non lo usiamo, ma lo prepariamo
}

const Topbar: Component<TopbarProps> = (props) => {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  return (
    <header class="h-16 flex-shrink-0 bg-abyss/80 backdrop-blur-sm border-b border-starlight/10 flex items-center justify-between px-6">
      {/* Logo o Nome del Gioco (a sinistra) */}
      <div>
        <h1 class="text-xl font-bold text-biolume">Bioma Zero</h1>
      </div>

      {/* Statistiche e Profilo (a destra) */}
      <div class="flex items-center gap-6">
        {/* Statistiche */}
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

        {/* Menu Profilo */}
        <div class="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen())}
            class="w-10 h-10 rounded-full bg-starlight/20 flex items-center justify-center transition hover:bg-starlight/30"
          >
            {/* Qui in futuro mostreremo l'avatar, per ora un'icona */}
            <VsAccount class="w-6 h-6 text-ghost" />
          </button>

          {/* Menu a Tendina (Dropdown) con animazione */}
          <Presence>
            <Show when={isMenuOpen()}>
              <Motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, easing: "ease-in-out" }}
                class="absolute right-0 mt-2 w-48 bg-abyss border border-starlight/20 rounded-md shadow-lg p-2 z-50"
              >
                <A href="/game/profile" class="block px-4 py-2 text-sm text-ghost rounded hover:bg-starlight/20">Profilo</A>
                <A href="/game/bioma" class="block px-4 py-2 text-sm text-ghost rounded hover:bg-starlight/20">Il Mio Bioma</A>
                <div class="my-1 h-px bg-starlight/10" />
                <LogoutButton />
              </Motion.div>
            </Show>
          </Presence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;