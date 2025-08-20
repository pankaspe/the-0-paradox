import { type Component } from "solid-js";
import { Motion } from "solid-motionone";
import { gameStoreActions } from "~/lib/gameStore";
import type { DroppedItem } from "~/types/game";
import { IoClose } from "solid-icons/io";
import { Image } from "@unpic/solid";

interface Props {
  item: DroppedItem;
}

export const ItemDropModal: Component<Props> = (props) => {

  const imageUrl = () => {
    if (!props.item.asset_url) return '/game/base_avatar.svg';
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${props.item.asset_url}`;
  };

  const rarityClass = () => {
    switch (props.item.rarity.toUpperCase()) {
      case 'RARE': return 'text-sky-400 border-sky-400 bg-sky-400/10';
      case 'EPIC': return 'text-purple-400 border-purple-400 bg-purple-400/10';
      case 'COMMON':
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10';
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={() => gameStoreActions.hideDropModal()}
    >
      <Motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, easing: [0.16, 1, 0.3, 1] }}
        // Evitiamo che il click sul modal lo chiuda
        onClick={(e) => e.stopPropagation()}
        class="w-full max-w-sm bg-surface border border-border rounded-lg p-6 text-center shadow-2xl shadow-primary/20 relative flex flex-col items-center"
      >
        <button 
          onClick={() => gameStoreActions.hideDropModal()}
          class="absolute top-2 right-2 btn-icon"
          title="Chiudi"
        >
          <IoClose size={24} />
        </button>

        <p class="font-mono text-primary tracking-widest text-sm">NUOVO OGGETTO OTTENUTO</p>

        <div class="my-6 w-32 h-32 rounded-full border-2 border-border bg-surface-hover flex items-center justify-center">
          <Image src={imageUrl()} width={128} height={128} alt={props.item.name} />
        </div>

        <h2 class="text-3xl font-bold text-text-main">{props.item.name}</h2>
        <p class={`mt-2 inline-block px-3 py-1 text-sm font-bold rounded-md border ${rarityClass()}`}>
          {props.item.rarity.toUpperCase()}
        </p>

        <button 
          onClick={() => gameStoreActions.hideDropModal()}
          class="mt-8 w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold"
        >
          OK
        </button>
      </Motion.div>
    </Motion.div>
  );
};