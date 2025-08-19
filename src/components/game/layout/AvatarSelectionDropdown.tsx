import { createMemo, For, Show } from "solid-js";
import type { InventoryItemWithDetails } from "~/types/game";
import { Motion } from "solid-motionone";
import { Image } from "@unpic/solid";

interface AvatarSelectionDropdownProps {
  inventory: InventoryItemWithDetails[];
  activeAvatarId: string | null;
  onSelect: (avatarId: string) => void;
}

export function AvatarSelectionDropdown(props: AvatarSelectionDropdownProps) {
  const STORAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images`;
  const FALLBACK_AVATAR = '/game/base_avatar.svg';

  const availableAvatars = createMemo(() => 
    (props.inventory || []).filter(item => item.game_items?.item_type === 'AVATAR')
  );

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15, easing: "ease-in-out" }}
      // La classe `right-0` è stata rimossa qui, la metteremo nel genitore
      class="absolute mt-3 w-64 bg-abyss border border-starlight/20 rounded-lg shadow-lg z-50 p-4"
    >
      <p class="text-sm text-ghost/70 mb-3">Seleziona un Avatar</p>
      
      {/* --- NUOVA LOGICA CON SHOW/FALLBACK --- */}
      <Show 
        when={availableAvatars().length > 0}
        fallback={
          <p class="text-center text-ghost/50 text-sm py-4">
            Nessun avatar trovato... ancora.
          </p>
        }
      >
        <div class="grid grid-cols-4 gap-3">
          <For each={availableAvatars()}>
            {(item) => (
              <button
                onClick={() => props.onSelect(item.item_id)}
                class="aspect-square rounded-full border-2 transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-biolume"
                classList={{
                  'border-biolume': item.item_id === props.activeAvatarId,
                  'border-starlight/30 hover:border-starlight/70': item.item_id !== props.activeAvatarId
                }}
                title={item.game_items?.name}
              >
                <Image
                  src={item.game_items?.asset_url ? `${STORAGE_URL}${item.game_items.asset_url}` : FALLBACK_AVATAR}
                  height={64} 
                  width={64} 
                  alt={item.game_items?.name || 'Avatar'}
                  class="w-full h-full object-cover"
                />
              </button>
            )}
          </For>
        </div>
      </Show>
    </Motion.div>
  );
}