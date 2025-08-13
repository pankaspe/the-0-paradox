// src/components/game/bioma/ItemCard.tsx

import { type Component, Show, type Accessor } from "solid-js";
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
  const rarity = () => props.item.game_items!.rarity;

  return (
    <Motion.button
      class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300"
      classList={{
        ['rarity-border-' + rarity()]: true,
        'opacity-50': props.savingItemId !== null && props.savingItemId !== props.item.item_id,
        'ring-2 ring-biolume ring-offset-2 ring-offset-abyss': props.isEquipped(),
      }}
      onClick={() => props.onEquip(props.item)}
      disabled={props.savingItemId !== null}
      hover={{ scale: 1.08, zIndex: 10 }}
      press={{ scale: 0.95 }}
    >
      <img 
        src={`${STORAGE_URL}${props.item.game_items!.asset_url}`}
        alt={props.item.game_items!.name}
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <p class="absolute bottom-1 left-2 right-2 text-xs font-semibold text-ghost truncate">
        {props.item.game_items!.name}
      </p>

      {/* Indicatore di oggetto equipaggiato */}
      <Show when={props.isEquipped()}>
        <div class="absolute top-1 right-1 bg-biolume/80 rounded-full text-abyss p-0.5">
          <FiCheckCircle class="w-4 h-4" />
        </div>
      </Show>
      
      {/* Spinner durante il salvataggio */}
      <Show when={props.savingItemId === props.item.item_id}>
        <div class="absolute inset-0 bg-abyss/70 flex items-center justify-center">
          <Spinner />
        </div>
      </Show>
    </Motion.button>
  );
};