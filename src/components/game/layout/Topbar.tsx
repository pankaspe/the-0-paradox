// src/components/game/layout/Topbar.tsx

import { type Component, createSignal, Show, onCleanup, onMount, createMemo } from "solid-js";
import { isServer } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";
import { A } from "@solidjs/router";
import { gameStore } from "~/lib/gameStore";
import LogoutButton from "../LogoutButton";
import { IoDiamondOutline, IoFlashOutline } from "solid-icons/io";
import { Image } from "@unpic/solid";
// --- NUOVO IMPORT ---
// Importiamo un'icona per il pulsante nascondi/mostra
import { TbLayoutSidebarLeftCollapse } from 'solid-icons/tb'


interface TopbarProps {
  username: string | null;
  soul_fragments: number;
  energy: number;
  avatar_id: string | null;
  // --- NUOVA PROP ---
  // Aggiungiamo una prop per passare la funzione che nasconderà la barra.
  onToggleVisibility: () => void;
}

const Topbar: Component<TopbarProps> = (props) => {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  let menuRef: HTMLDivElement | undefined;

  if (!isServer) {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef && !menuRef.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    onMount(() => { document.addEventListener("mousedown", handleClickOutside); });
    onCleanup(() => { document.removeEventListener("mousedown", handleClickOutside); });
  }

  const activeAvatarUrl = createMemo(() => {
    const FALLBACK_AVATAR = "/game/base_avatar.svg"; 
    if (!props.avatar_id) {
      return FALLBACK_AVATAR;
    }
    const BASE_URL = import.meta.env.VITE_SUPABASE_URL;
    if (!BASE_URL) {
      console.error("VITE_SUPABASE_URL non è impostato nel file .env!");
      return FALLBACK_AVATAR;
    }
    const STORAGE_URL = `${BASE_URL}/storage/v1/object/public/images`;
    const inventoryItem = gameStore.profile?.inventory.find(i => i.item_id === props.avatar_id);
    if (inventoryItem && inventoryItem.game_items?.asset_url) {
      return `${STORAGE_URL}${inventoryItem.game_items.asset_url}`;
    }
    return FALLBACK_AVATAR;
  });

  return (
    <header class="pointer-events-auto w-full max-w-5xl mx-auto h-16 flex-shrink-0 bg-abyss/80 backdrop-blur-lg border border-starlight/10 rounded-full shadow-2xl shadow-starlight/5 flex items-center justify-between px-4 sm:px-6">
      
      {/* --- BLOCCO DI SINISTRA MODIFICATO --- */}
      {/* Ora questo è un pulsante che contiene l'icona e il nome utente. */}
      <button 
        onClick={props.onToggleVisibility} 
        class="flex items-center gap-3 text-ghost/80 hover:text-biolume transition-colors duration-200 rounded-full p-2 -ml-2"
        title="Nascondi la barra"
      >
        <TbLayoutSidebarLeftCollapse class="w-6 h-6" />
        <p class="hidden sm:block">
          Entità: <span class="font-bold">{props.username || "Senza Nome"}</span>
        </p>
      </button>

      {/* Blocco Utente a destra (Statistiche + Avatar) */}
      <div class="flex items-center gap-4 sm:gap-6">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="flex items-center gap-2 text-ghost/80" title="Frammenti d'Anima">
            <IoDiamondOutline class="w-5 h-5 text-biolume" />
            <span class="font-mono text-sm sm:text-base">{props.soul_fragments}</span>
          </div>
          <div class="flex items-center gap-2 text-ghost/80" title="Energia">
            <IoFlashOutline class="w-5 h-5 text-yellow-400" />
            <span class="font-mono text-sm sm:text-base">{props.energy}</span>
          </div>
        </div>
        
        {/* Menu a tendina con l'Avatar come pulsante */}
        <div class="relative" ref={menuRef}>
          <Motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen())}
            class="w-10 h-10 rounded-full border-2 border-starlight/50 overflow-hidden focus:outline-none focus:ring-2 focus:ring-biolume"
            hover={{ scale: 1.1 }}
          >
            <Image
               src={activeAvatarUrl()}
               height={100} 
               width={100}
               alt="User Avatar" 
               class="w-full h-full object-cover"
            />
          </Motion.button>
          
          <Presence>
            <Show when={isMenuOpen()}>
              <Motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, easing: "ease-in-out" }}
                class="absolute right-0 mt-3 w-56 bg-abyss border border-starlight/20 rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <div class="px-4 py-3 border-b border-starlight/10">
                  <p class="text-sm text-ghost/70">Accesso come</p>
                  <p class="font-semibold text-ghost truncate">{props.username || "Entità"}</p>
                </div>
                <div class="p-2">
                  <A href="/game/profile" class="block w-full text-left px-3 py-2 text-sm text-ghost rounded-md hover:bg-starlight/20">
                    Vai al Profilo
                  </A>
                </div>
                <div class="p-2 border-t border-starlight/10">
                   <LogoutButton class="block w-full text-left px-3 py-2 text-sm text-red-400/80 rounded-md hover:bg-red-400/20 hover:text-red-400" />
                </div>
              </Motion.div>
            </Show>
          </Presence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;