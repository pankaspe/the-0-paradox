// src/components/game/emporium/StoreItemCard.tsx

import { type Component, createMemo, createSignal, Show } from "solid-js";
import { Motion } from "solid-motionone";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { buyItem } from "~/lib/game-actions";
import Spinner from "~/components/ui/Spinner";
// Importiamo il tipo Tables per allineare le props
import type { Tables } from "~/types/supabase";

const rarityStyles = {
  common: { border: "rarity-border-common", text: "rarity-text-common", bg: "rarity-bg-common" },
  rare: { border: "rarity-border-rare", text: "rarity-text-rare", bg: "rarity-bg-rare" },
  epic: { border: "rarity-border-epic", text: "rarity-text-epic", bg: "rarity-bg-epic" },
  seasonal: { border: "rarity-border-seasonal", text: "rarity-text-seasonal", bg: "rarity-bg-seasonal" },
};

// L'interfaccia ora usa il tipo corretto `Tables<'game_items'>`
export interface StoreItemCardProps {
  item: Tables<'game_items'>;
}

export const StoreItemCard: Component<StoreItemCardProps> = (props) => {
  const STORAGE_URL = import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/images";
  const [isBuying, setIsBuying] = createSignal(false);
  const [message, setMessage] = createSignal<{ type: 'success' | 'error'; text: string } | null>(null);

  type RarityKey = keyof typeof rarityStyles;

  const userOwnsItem = createMemo(() => gameStore.profile?.inventory.some(invItem => invItem.item_id === props.item.id));
  const canAffordItem = createMemo(() => (gameStore.profile?.soul_fragments ?? 0) >= props.item.cost);

  const handleBuyClick = async () => {
    if (isBuying() || userOwnsItem() || !canAffordItem()) return;
    setIsBuying(true);
    setMessage(null);
    gameStoreActions.buyItemOptimistic(props.item);
    const result = await buyItem(props.item.id);
    if (result.success && result.data) {
      gameStoreActions.confirmItemPurchase(result.data);
      setMessage({ type: 'success', text: 'Acquisto completato!' });
    } else {
      gameStoreActions.revertItemPurchase(props.item);
      setMessage({ type: 'error', text: result.error || "Errore sconosciuto." });
    }
    setIsBuying(false);
    setTimeout(() => setMessage(null), 4000);
  };

  const itemRarity = (): RarityKey => {
    const rarity = props.item.rarity;
    if (rarity && rarity in rarityStyles) { return rarity as RarityKey; }
    return 'common';
  };
  const styles = () => rarityStyles[itemRarity()];

    // --- AGGIUNGIAMO LA LOGICA PER IL COLORE ANCHE QUI ---
  const auraMainColor = createMemo(() => {
    const styleData = props.item.style_data as any;
    if (styleData?.filter && typeof styleData.filter === 'string') {
      const match = styleData.filter.match(/rgba?\(.+?\)/);
      if (match) {
        return match[0];
      }
    }
    return 'rgba(110, 231, 183, 0.7)';
  });

  return (
    <div class={`bg-abyss/90 border rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${styles().border} ${userOwnsItem() ? 'opacity-50' : 'hover:border-starlight/50 hover:bg-abyss'}`}>
      <div class="h-40 bg-starlight/5 flex items-center justify-center p-4">
        <Show 
          when={props.item.asset_url}
          fallback={
            // Usiamo lo stesso identico placeholder animato e sfocato
            <Motion.div 
              class="w-20 h-20 rounded-full"
              style={{ "background-color": auraMainColor() }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 2.5,
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
          }
        >
          <img 
            src={`${STORAGE_URL}${props.item.asset_url}`} 
            alt={props.item.name} 
            class="max-h-full max-w-full object-contain" 
          />
        </Show>
      </div>

      <div class="p-4 flex-grow flex flex-col">
        <div class="flex justify-between items-start">
          <h3 class="font-bold text-lg text-ghost">{props.item.name}</h3>
          <span class={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${styles().bg} ${styles().text}`}>
            {props.item.rarity}
          </span>
        </div>
        <p class="text-sm text-ghost/70 mt-2 flex-grow">{props.item.description}</p>
        <div class="mt-4 pt-4 border-t border-starlight/10">
          <button onClick={handleBuyClick} disabled={isBuying() || userOwnsItem() || !canAffordItem()} class="w-full h-10 px-4 font-semibold rounded-md transition-all duration-200 flex items-center justify-center bg-starlight/10 text-biolume hover:enabled:bg-biolume hover:enabled:text-abyss disabled:opacity-60 disabled:cursor-not-allowed">
            <Show when={!isBuying()} fallback={<Spinner class="w-5 h-5" />}>
              <Show when={userOwnsItem()} fallback={
                <Show when={!canAffordItem()} fallback={
                  <>
                    <span>Acquista</span>
                    <span class="ml-auto font-mono">{props.item.cost} Frammenti</span>
                  </>
                }>
                  <span>Frammenti Insufficienti</span>
                </Show>
              }>
                <span>Posseduto</span>
              </Show>
            </Show>
          </button>
          <Show when={message()}>
            {msg => (<p class={`text-xs text-center mt-2 ${msg().type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{msg().text}</p>)}
          </Show>
        </div>
      </div>
    </div>
  );
};