// src/components/game/bioma/DesktopPanel.tsx

import { type Component, For, Show, createSignal } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { ItemCard, type ItemCardProps } from "./ItemCard";
import type { EquippedLayers } from "~/types/game";
import { A } from "@solidjs/router";

// Definiamo un tipo per i gruppi di oggetti che riceveremo
type ItemGroup = { type: string; name: string; items: ItemCardProps['item'][]; };

interface DesktopPanelProps {
  groups: ItemGroup[];
  equippedLayers: EquippedLayers | null;
  onEquip: ItemCardProps['onEquip'];
  savingItemId: ItemCardProps['savingItemId'];
}

export const DesktopPanel: Component<DesktopPanelProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal(props.groups[0]?.type);

  return (
    <div class="w-full lg:w-96 flex-shrink-0 bg-abyss/80 backdrop-blur-md border-l border-starlight/10 flex">
      {/* Tab Verticali */}
      <div class="w-24 border-r border-starlight/10 p-2 flex flex-col items-center space-y-4">
        <h2 class="text-xl font-bold text-biolume mt-4 mb-4 writing-mode-vertical-rl rotate-180">EDITA</h2>
        <For each={props.groups}>
          {(group) => (
            <button
              onClick={() => setActiveTab(group.type)}
              class="relative w-full aspect-square rounded-md flex items-center justify-center text-ghost/60 transition-colors hover:bg-starlight/10 hover:text-ghost"
              classList={{ "bg-starlight/20 text-ghost": activeTab() === group.type }}
            >
              <span class="text-xs text-center">{group.name}</span>
            </button>
          )}
        </For>
      </div>

      {/* Contenuto della Tab */}
      <div class="flex-1 p-4 overflow-y-auto">
        <Presence exitBeforeEnter>
          <For each={props.groups}>
            {(group) => (
              <Show when={activeTab() === group.type}>
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  class="grid grid-cols-3 gap-3"
                >
                 <Show 
                    when={group.items.length > 0}
                    fallback={
                      <div class="col-span-3 text-center text-ghost/60 p-8 text-sm">
                        <p>Non possiedi nessun oggetto di tipo "{group.name}".</p>
                        <A href="/game/emporio" class="text-biolume hover:underline mt-2 inline-block">
                          Visita l'Emporio
                        </A>
                      </div>
                    }
                  >
                  <For each={group.items}>
                    {(item) => {
                      const layerKey = group.type.replace('bioma_', '') as keyof EquippedLayers;
                      
                      // Ora passiamo una funzione freccia `() => ...`
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
                  </Show>
                </Motion.div>
              </Show>
            )}
          </For>
        </Presence>
      </div>
    </div>
  );
};