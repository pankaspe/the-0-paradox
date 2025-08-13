// src/components/game/bioma/MobilePanel.tsx

import { type Component, For, Show, createSignal } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { ItemCard, type ItemCardProps } from "./ItemCard";
import type { EquippedLayers } from "~/types/game";
import { FiX } from "solid-icons/fi";

type ItemGroup = { type: string; name: string; items: ItemCardProps['item'][]; };

interface MobilePanelProps {
  groups: ItemGroup[];
  equippedLayers: EquippedLayers | null;
  onEquip: ItemCardProps['onEquip'];
  savingItemId: ItemCardProps['savingItemId'];
}

export const MobilePanel: Component<MobilePanelProps> = (props) => {
  const [activeGroup, setActiveGroup] = createSignal<ItemGroup | null>(null);

  return (
    <>
      {/* Barra inferiore con le icone delle categorie */}
      <Motion.div 
        class="fixed bottom-16 left-0 right-0 h-16 bg-abyss/80 backdrop-blur-lg border-t border-starlight/10 z-40 flex justify-around items-center px-2"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, easing: "ease-out" }}
      >
        <For each={props.groups}>
          {(group) => (
            <button
              onClick={() => setActiveGroup(group)}
              class="p-2 rounded-lg text-ghost/80 hover:bg-starlight/20"
            >
              <span class="text-sm font-semibold">{group.name}</span>
            </button>
          )}
        </For>
      </Motion.div>

      {/* Cassetto a comparsa (Drawer) */}
      <Presence>
        <Show when={activeGroup()}>
          {(group) => (
            <Motion.div
              class="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Motion.div
                class="absolute bottom-0 left-0 right-0 h-[60%] bg-abyss border-t-2 border-biolume rounded-t-2xl p-4 flex flex-col"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.4, easing: "ease-in-out" }}
              >
                <div class="flex justify-between items-center mb-4 flex-shrink-0">
                  <h3 class="text-xl font-bold text-biolume">{group().name}</h3>
                  <button onClick={() => setActiveGroup(null)} class="p-2 text-ghost">
                    <FiX class="w-6 h-6" />
                  </button>
                </div>
                <div class="overflow-y-auto flex-1 pr-2">
                  <div class="grid grid-cols-4 sm:grid-cols-5 gap-4">
                    <For each={group().items}>
                      {(item) => {
                        const layerKey = group().type.replace('bioma_', '') as keyof EquippedLayers;
                        
                        // Stessa cosa qui: passiamo una funzione
                        return (
                          <ItemCard 
                            item={item}
                            isEquipped={() => props.equippedLayers?.[layerKey]?.id === item.item_id}
                            onEquip={props.onEquip}
                            savingItemId={props.savingItemId}
                          />
                        );
                      }}
                    </For>
                  </div>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </Show>
      </Presence>
    </>
  );
};