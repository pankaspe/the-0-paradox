// src/components/game/emporium/StoreItemCard.tsx

import { type Component, createMemo, createSignal, Show } from "solid-js";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { buyItem } from "~/lib/game-actions";
import Spinner from "~/components/ui/Spinner";
import type { Tables } from "~/types/supabase";

// Gli stili di rarità sono strettamente legati a questa card, quindi vivono qui con lei.
const rarityStyles = {
  common: { border: "rarity-border-common", text: "rarity-text-common", bg: "rarity-bg-common" },
  rare: { border: "rarity-border-rare", text: "rarity-text-rare", bg: "rarity-bg-rare" },
  epic: { border: "rarity-border-epic", text: "rarity-text-epic", bg: "rarity-bg-epic" },
  seasonal: { border: "rarity-border-seasonal", text: "rarity-text-seasonal", bg: "rarity-bg-seasonal" },
};

// Definiamo un tipo per le props che il nostro componente accetterà.
export interface StoreItemCardProps {
  item: Tables<'game_items'>;
}

/**
 * StoreItemCard Component
 * -----------------------
 * A self-contained component that displays a single item for sale in the Emporio.
 * It's now in its own file for better code organization.
 */
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

  return (
    <div class={`bg-abyss/60 border rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${styles().border} ${userOwnsItem() ? 'opacity-50' : 'hover:border-starlight/50 hover:bg-abyss'}`}>
      <div class="h-40 bg-starlight/5 flex items-center justify-center p-4">
        <img src={`${STORAGE_URL}${props.item.asset_url}`} alt={props.item.name} class="max-h-full max-w-full object-contain" />
      </div>
      <div class="p-4 flex-grow flex flex-col">
        <div class="flex justify-between items-start">
          <h3 class="font-bold text-lg text-ghost">{props.item.name}</h3>
          <span class={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${styles().bg} ${styles().text}`}>{props.item.rarity}</span>
        </div>
        <p class="text-sm text-ghost/70 mt-2 flex-grow">{props.item.description}</p>
        <div class="mt-4 pt-4 border-t border-starlight/10">
          <button onClick={handleBuyClick} disabled={isBuying() || userOwnsItem() || !canAffordItem()} class="w-full h-10 px-4 font-semibold rounded-md transition-all duration-200 flex items-center justify-center bg-starlight/10 text-biolume hover:enabled:bg-biolume hover:enabled:text-abyss disabled:opacity-60 disabled:cursor-not-allowed">
            <Show when={!isBuying()} fallback={<Spinner class="w-5 h-5" />}><Show when={userOwnsItem()} fallback={<Show when={!canAffordItem()} fallback={<><span>Acquista</span><span class="ml-auto font-mono">{props.item.cost} Frammenti</span></>} ><span>Frammenti Insufficienti</span></Show>}><span>Posseduto</span></Show></Show>
          </button>
          <Show when={message()}>{msg => (<p class={`text-xs text-center mt-2 ${msg().type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{msg().text}</p>)}</Show>
        </div>
      </div>
    </div>
  );
};