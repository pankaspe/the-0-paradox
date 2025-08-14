// src/components/game/emporium/StoreItemCard.tsx

import { type Component, createMemo, createSignal, Show } from "solid-js";
import { Motion } from "solid-motionone";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { buyItem } from "~/lib/game-actions";
import Spinner from "~/components/ui/Spinner";
import type { Tables } from "~/types/supabase";
import { Image } from "@unpic/solid";

// --- NUOVO MINI-COMPONENTE ---
// Un loader specifico per le immagini. Apparirà centrato e con uno sfondo semi-trasparente.
const ImageLoader: Component = () => (
  <div class="absolute inset-0 flex items-center justify-center bg-abyss/50 backdrop-blur-sm">
    <Spinner class="w-8 h-8 text-biolume" />
  </div>
);

const rarityStyles = {
  common: { border: "rarity-border-common", text: "rarity-text-common", bg: "rarity-bg-common" },
  rare: { border: "rarity-border-rare", text: "rarity-text-rare", bg: "rarity-bg-rare" },
  epic: { border: "rarity-border-epic", text: "rarity-text-epic", bg: "rarity-bg-epic" },
  seasonal: { border: "rarity-border-seasonal", text: "rarity-text-seasonal", bg: "rarity-bg-seasonal" },
};

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

  return (
    <div class={`bg-abyss/90 border rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${styles().border} ${userOwnsItem() ? 'opacity-50' : 'hover:border-starlight/50 hover:bg-abyss'}`}>
      
      {/* --- MODIFICA 1: Aggiungiamo 'relative' qui --- */}
      {/* Questo serve per posizionare correttamente il loader al suo interno. */}
      <div class="relative h-40 bg-starlight/5 flex items-center justify-center p-4">
        <Show 
          when={props.item.asset_url}
          fallback={
            <Motion.div 
              class="w-20 h-20 rounded-full bg-biolume/30"
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, easing: "ease-in-out" }}
            >
              <div class="w-full h-full rounded-full border-2 border-biolume" />
            </Motion.div>
          }
        >
          {/* --- MODIFICA 2: Il Loader è ora un figlio di <Image> --- */}
          {/* Questo <ImageLoader> viene mostrato automaticamente mentre l'immagine
              specificata in 'src' sta caricando, e nascosto al termine. */}
          <Image
            src={`${STORAGE_URL}${props.item.asset_url}`} 
            width={700}
            height={500}
            class="max-h-full max-w-full object-contain animate-fade-in" 
            alt={props.item.name}
            layout="constrained"
          >
            <ImageLoader />
          </Image>
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