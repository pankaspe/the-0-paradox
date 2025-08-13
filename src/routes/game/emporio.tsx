// src/routes/game/emporio.tsx

import { type Component, createMemo, For, onMount, Show, createSignal, createEffect } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import Loader from "~/components/ui/Loader";
import type { Tables } from "~/types/supabase";

import { StoreItemCard } from "~/components/game/emporium/StoreItemCard";

const groupDisplayNames: Record<string, string> = {
  bioma_background: "Sfondi Cosmici",
  bioma_bioma: "Nuclei del Bioma",
  avatar: "Avatar",
  aura: "Aure",
};
const rarityOrder: Record<string, number> = { common: 1, rare: 2, epic: 3, seasonal: 4 };

const TabButton: Component<{ onClick: () => void; isActive: boolean; label: string; }> = (props) => {
  return (
    <Motion.button
      class="relative px-4 py-2 text-lg font-semibold transition-colors"
      classList={{
        "text-ghost": props.isActive,
        "text-ghost/50 hover:text-ghost/80": !props.isActive,
      }}
      onClick={props.onClick}
      // Correzione: la prop corretta è `hover`
      hover={{ scale: 1.05 }}
    >
      {props.label}
      <Show when={props.isActive}>
        <Motion.div
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-biolume"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, easing: "ease-in-out" }}
        />
      </Show>
    </Motion.button>
  );
};

export default function EmporioPage() {
  onMount(() => {
    if (gameStore.storeItems.length === 0) {
      gameStoreActions.loadStoreItems();
    }
  });
  
  const [activeTab, setActiveTab] = createSignal<string | null>(null);

  const groupedAndSortedItems = createMemo(() => {
    const groups = new Map<string, Tables<'game_items'>[]>();
    for (const item of gameStore.storeItems) {
      if (!groups.has(item.item_type)) { groups.set(item.item_type, []); }
      groups.get(item.item_type)!.push(item);
    }
    return Array.from(groups.entries()).map(([type, items]) => ({
      type: type,
      groupName: groupDisplayNames[type] || type,
      items: items.sort((a, b) => (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0)),
    }));
  });

  createEffect(() => {
    const groups = groupedAndSortedItems();
    if (!activeTab() && groups.length > 0) {
      setActiveTab(groups[0].type);
    }
  });

  return (
    <div class="relative w-full h-full">
      <div class="fixed inset-0 -z-10">
        <Presence>
          <Motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1, filter: ['blur(8px) brightness(50%)', 'blur(18px) brightness(75%)'] }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, easing: "ease-in-out", filter: { duration: 4, repeat: Infinity, direction: 'alternate' } }}
            src="/game/emporium.svg"
            class="w-full h-full object-cover"
          />
        </Presence>      
        <Motion.div
          class="absolute inset-0 grid-overlay pointer-events-none"
          animate={{ opacity: [0.2, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, direction: 'alternate' }}
        />
      </div>

      <div class="w-full h-full overflow-y-auto">
        <div class="max-w-7xl w-full mx-auto p-4 md:p-6 pb-24">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h1 class="text-4xl font-bold text-biolume">Emporio</h1>
              <p class="text-ghost/70 mt-1">Scambia i tuoi Frammenti d'Anima per oggetti unici.</p>
            </div>
            <div class="bg-starlight/10 px-4 py-2 rounded-lg text-right flex-shrink-0">
                <div class="text-xs text-ghost/60">Il tuo Saldo</div>
                <div class="text-xl font-mono text-biolume">{gameStore.profile?.soul_fragments ?? 0}</div>
            </div>
          </div>
          
          <div class="border-b border-starlight/20 mb-8 flex items-center space-x-4">
            <For each={groupedAndSortedItems()}>
              {(group) => (
                <TabButton
                  label={group.groupName}
                  isActive={activeTab() === group.type}
                  onClick={() => setActiveTab(group.type)}
                />
              )}
            </For>
          </div>

          <Show when={!gameStore.isStoreLoading} fallback={<div class="w-full h-64 flex items-center justify-center"><Loader /></div>}>
            {/* Correzione: Rimuoviamo la `key` e usiamo un <For> con <Show> per ogni tab.
                Presence gestirà l'animazione di ogni singolo <Motion.div> quando appare/scompare. */}
            <For each={groupedAndSortedItems()}>
              {(group) => (
                <Show when={activeTab() === group.type}>
                  <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <For each={group.items}>
                        {(item) => <StoreItemCard item={item} />}
                      </For>
                    </div>
                  </Motion.div>
                </Show>
              )}
            </For>
          </Show>
        </div>
      </div>
    </div>
  );
}