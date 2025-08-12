import { For, Show, createMemo, createSignal, type Component } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import type { InventoryItemWithDetails, EquippedLayers } from "~/types/game";
import Spinner from "~/components/ui/Spinner";
// Rimuoviamo l'import dello store perché non serve più qui
// import { gameStore } from "~/lib/gameStore";

const rarityOrder = { common: 1, rare: 2, epic: 3, season: 4 };
const rarityColors = {
  common: "text-green-400 border-green-400/50",
  rare: "text-blue-400 border-blue-400/50",
  epic: "text-purple-400 border-purple-400/50",
  season: "text-red-400 border-red-400/50",
};

// Aggiorniamo le props per accettare i dati reattivi dal padre
interface CustomizationPanelProps {
  inventory: InventoryItemWithDetails[];
  equippedLayers: EquippedLayers | null; // <-- Prop reattiva
  onEquip: (item: InventoryItemWithDetails) => void;
  savingItemId: string | null;
}

// Aggiorniamo le props di ItemSection per ricevere l'ID specifico
const ItemSection: Component<{ 
  title: string; 
  items: InventoryItemWithDetails[]; 
  equippedId: string | undefined; // <-- Prop reattiva specifica
  onEquip: (item: InventoryItemWithDetails) => void; 
  savingItemId: string | null; 
}> = (props) => {
  const STORAGE_URL = import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/images";
  const [hoveredImage, setHoveredImage] = createSignal<string | null>(null);

  // Rimuoviamo la lettura diretta dallo store, che era la causa del bug
  // const equippedLayers = createMemo(() => ...); // RIMOSSO

  const sortedItems = createMemo(() => 
    [...props.items].sort((a, b) => (rarityOrder[a.game_items!.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[b.game_items!.rarity as keyof typeof rarityOrder] || 0))
  );

  return (
    <div>
      <h3 class="text-lg font-semibold text-biolume/80 mb-3">{props.title}</h3>
      <div class="space-y-2 relative">
        <Presence>
          <Show when={hoveredImage()}>
            <Motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={hoveredImage()!}
              class="absolute -left-48 top-0 w-40 h-40 object-cover rounded-lg border border-starlight/20 shadow-lg pointer-events-none"
            />
          </Show>
        </Presence>
        <For each={sortedItems()}>
          {(item) => {
            const rarity = item.game_items!.rarity as keyof typeof rarityColors;
            // La logica ora usa la prop reattiva, ed è molto più semplice
            const isEquipped = () => props.equippedId === item.item_id;

            return (
              <button
                onClick={() => props.onEquip(item)}
                onMouseEnter={() => {
                  if (item.game_items?.asset_url) {
                    setHoveredImage(`${STORAGE_URL}${item.game_items.asset_url}`);
                  }
                }}
                onMouseLeave={() => setHoveredImage(null)}
                disabled={props.savingItemId === item.item_id}
                class={`w-full text-left p-2 rounded flex items-center gap-3 transition-colors hover:bg-starlight/20 ${isEquipped() ? 'bg-starlight/10' : ''}`}
              >
                <div class={`w-2 h-2 rounded-full ${rarityColors[rarity]?.split(' ')[0].replace('text-', 'bg-')}`} />
                <span class={`flex-1 text-sm ${isEquipped() ? 'text-ghost font-semibold' : 'text-ghost/70'}`}>
                  {item.game_items?.name}
                </span>
                <Show when={props.savingItemId === item.item_id}>
                  <Spinner class="w-4 h-4" />
                </Show>
              </button>
            )
          }}
        </For>
      </div>
    </div>
  );
};

export const CustomizationPanel: Component<CustomizationPanelProps> = (props) => {
  const backgrounds = createMemo(() => props.inventory.filter(i => i.game_items?.item_type === 'bioma_background'));
  const biomes = createMemo(() => props.inventory.filter(i => i.game_items?.item_type === 'bioma_bioma'));

  return (
    <div class="w-full lg:w-96 flex-shrink-0 bg-abyss/80 backdrop-blur-md border-l border-starlight/10 p-6 overflow-y-auto">
      <h2 class="text-2xl font-bold text-biolume mb-6">Personalizza Bioma</h2>
      <div class="space-y-8">
        <ItemSection 
          title="Sfondi Cosmici" 
          items={backgrounds()} 
          // Passiamo l'ID specifico, che è reattivo, al componente figlio
          equippedId={props.equippedLayers?.background?.id}
          onEquip={props.onEquip}
          savingItemId={props.savingItemId}
        />
        <ItemSection 
          title="Nuclei del Bioma" 
          items={biomes()}
          // Passiamo l'ID specifico, che è reattivo, al componente figlio
          equippedId={props.equippedLayers?.bioma?.id}
          onEquip={props.onEquip}
          savingItemId={props.savingItemId}
        />
      </div>
    </div>
  );
};