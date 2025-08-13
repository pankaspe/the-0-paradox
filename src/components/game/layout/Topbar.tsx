// src/components/game/layout/Topbar.tsx

import { type Component, createSignal, Show, onCleanup, onMount, createMemo } from "solid-js";
import { isServer } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";
import { A } from "@solidjs/router";
import { gameStore } from "~/lib/gameStore"; // Importiamo lo store per accedere all'inventario
import LogoutButton from "../LogoutButton";
import { IoDiamondOutline, IoFlashOutline } from "solid-icons/io";

interface TopbarProps {
  username: string | null;
  soul_fragments: number;
  energy: number;
  avatar_id: string | null;
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

  // --- LOGICA PER L'AVATAR ---
  // Un memo reattivo per trovare l'URL dell'avatar attivo.
  // Si aggiornerà automaticamente quando l'utente ne equipaggia uno nuovo.
  const activeAvatarUrl = createMemo(() => {
    // Se non c'è un avatar_id, usiamo un'immagine di default.
    if (!props.avatar_id) {
      return "/default-avatar.svg"; // Assicurati di avere un avatar di default in /public
    }
    
    // Cerchiamo l'oggetto corrispondente nell'inventario dello store.
    const inventoryItem = gameStore.profile?.inventory.find(i => i.item_id === props.avatar_id);
    
    // Se lo troviamo e ha un asset_url, costruiamo l'URL completo.
    if (inventoryItem && inventoryItem.game_items?.asset_url) {
      const STORAGE_URL = import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/images";
      return `${STORAGE_URL}${inventoryItem.game_items.asset_url}`;
    }

    // Altrimenti, torniamo al default.
    return "/default-avatar.svg";
  });

  return (
    <Motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, easing: "ease-out" }}
      class="pointer-events-auto w-full max-w-5xl mx-auto h-16 flex-shrink-0 bg-abyss/80 backdrop-blur-lg border border-starlight/10 rounded-full shadow-2xl shadow-starlight/5 flex items-center justify-between px-4 sm:px-6"
    >
      {/* Messaggio di benvenuto - può essere rimosso per un look più minimalista se preferisci */}
      <div>
        <p class="hidden sm:block text-ghost/80">
          Entità: <span class="font-bold text-biolume">{props.username || "Senza Nome"}</span>
        </p>
      </div>

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
            <img src={activeAvatarUrl()} alt="User Avatar" class="w-full h-full object-cover" />
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
                {/* Header del menu */}
                <div class="px-4 py-3 border-b border-starlight/10">
                  <p class="text-sm text-ghost/70">Accesso come</p>
                  <p class="font-semibold text-ghost truncate">{props.username || "Entità"}</p>
                </div>
                {/* Corpo del menu */}
                <div class="p-2">
                  <A href="/game/profile" class="block w-full text-left px-3 py-2 text-sm text-ghost rounded-md hover:bg-starlight/20">
                    Vai al Profilo
                  </A>
                  {/* Altri link futuri qui... */}
                </div>
                {/* Footer del menu */}
                <div class="p-2 border-t border-starlight/10">
                   <LogoutButton class="block w-full text-left px-3 py-2 text-sm text-red-400/80 rounded-md hover:bg-red-400/20 hover:text-red-400" />
                </div>
              </Motion.div>
            </Show>
          </Presence>
        </div>
      </div>
    </Motion.header>
  );
};

export default Topbar;