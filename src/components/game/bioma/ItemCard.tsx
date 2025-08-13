// src/components/game/bioma/ItemCard.tsx

import { type Component, Show, type Accessor, createMemo } from "solid-js";
import { Motion } from "solid-motionone";
import type { InventoryItemWithDetails } from "~/types/game";
import Spinner from "~/components/ui/Spinner";
import { FiCheckCircle } from 'solid-icons/fi';

export interface ItemCardProps {
  item: InventoryItemWithDetails;
  isEquipped: Accessor<boolean>; 
  onEquip: (item: InventoryItemWithDetails) => void;
  savingItemId: string | null;
}

export const ItemCard: Component<ItemCardProps> = (props) => {
  const STORAGE_URL = import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/images";
  // Usiamo l'operatore di coalescenza nulla per sicurezza
  const rarity = () => props.item.game_items?.rarity ?? 'common';

    // --- INIZIO NUOVA LOGICA PER IL COLORE ---
  // Creiamo un memo per calcolare il colore dell'aura una sola volta.
  const auraMainColor = createMemo(() => {
    // Prendiamo i dati di stile, se esistono.
    const styleData = props.item.game_items?.style_data as any;

    // Controlliamo se esiste un filtro e se è una stringa.
    if (styleData?.filter && typeof styleData.filter === 'string') {
      // Usiamo una regular expression per trovare la prima occorrenza di 'rgba(...)'.
      const match = styleData.filter.match(/rgba?\(.+?\)/);
      // Se troviamo una corrispondenza, la restituiamo.
      if (match) {
        return match[0]; // es. "rgba(255, 87, 34, 0.9)"
      }
    }
    // Se non troviamo un colore, usiamo il verde 'biolume' come default.
    return 'rgba(110, 231, 183, 0.7)';
  });
  // --- FINE NUOVA LOGICA PER IL COLORE ---

  return (
    <Motion.button
      class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300"
      classList={{
        ['rarity-border-' + rarity()]: true,
        'opacity-50': props.savingItemId !== null && props.savingItemId !== props.item.item_id,
        'ring-2 ring-offset-2 ring-offset-abyss': props.isEquipped(),
        [rarity() === 'common' ? 'ring-green-400' : 
         rarity() === 'rare' ? 'ring-blue-400' :
         rarity() === 'epic' ? 'ring-purple-400' :
         'ring-red-400']: props.isEquipped(),
      }}
      onClick={() => props.onEquip(props.item)}
      disabled={props.savingItemId !== null}
      hover={{ scale: 1.08, zIndex: 10 }}
      press={{ scale: 0.95 }}
    >
      {/* --- INIZIO MODIFICA --- */}
      {/* Aggiungiamo la logica per mostrare il placeholder se manca l'URL dell'immagine */}
      <Show
        when={props.item.game_items?.asset_url}
        fallback={
          <div class="w-full h-full flex items-center justify-center bg-starlight/5">
            <Motion.div 
              class="w-3/5 aspect-square rounded-full bg-biolume/30"
              style={{ "background-color": auraMainColor() }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                easing: "ease-in-out",
              }}
            >
                   <div 
                  class="w-full h-full rounded-full"
                  style={{ 
                    "box-shadow": `0 0 15px 3px ${auraMainColor()}`
                  }}
                />
            </Motion.div>
          </div>
        }
      >
        {/* Se l'URL esiste, mostriamo l'immagine come prima */}
        <img 
          src={`${STORAGE_URL}${props.item.game_items!.asset_url}`}
          alt={props.item.game_items!.name}
          class="w-full h-full object-cover"
        />
      </Show>
      {/* --- FINE MODIFICA --- */}

      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <p class="absolute bottom-1 left-2 right-2 text-xs font-semibold text-ghost truncate">
        {props.item.game_items!.name}
      </p>

      <Show when={props.isEquipped()}>
        <div class="absolute top-1 right-1 bg-biolume/80 rounded-full text-abyss p-0.5">
          <FiCheckCircle class="w-4 h-4" />
        </div>
      </Show>
      
      <Show when={props.savingItemId === props.item.item_id}>
        <div class="absolute inset-0 bg-abyss/70 flex items-center justify-center">
          <Spinner />
        </div>
      </Show>
    </Motion.button>
  );
};