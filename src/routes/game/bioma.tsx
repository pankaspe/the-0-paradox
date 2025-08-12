// src/routes/game/bioma.tsx
import { Show, For, createMemo } from "solid-js";
import { equipItem } from "~/lib/game-actions";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import Loader from "~/components/ui/Loader";
import type { InventoryItemWithDetails, EquippedLayers } from "~/types/game"; // Importiamo i nuovi tipi

export default function BiomaPage() {
  const STORAGE_URL = import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/images";

  const handleEquip = async (item: InventoryItemWithDetails) => {
    if (!item.game_items) return;

    // 1. Determiniamo il TIPO CORRETTO per lo store
    let layerType: 'background' | 'planet' | null = null;
    
    switch (item.game_items.item_type) {
      case 'bioma_background':
        layerType = 'background';
        break;
      case 'bioma_planet':
        layerType = 'planet';
        break;
      default:
        // Gestiamo il caso in cui l'oggetto non sia equipaggiabile
        console.error("Tipo di oggetto non equipaggiabile:", item.game_items.item_type);
        alert("Questo oggetto non può essere equipaggiato qui.");
        return;
    }

    // 2. Chiamiamo l'azione dello store con i dati GIUSTI
    gameStoreActions.equipBiomaLayer(
      { id: item.item_id, asset_url: item.game_items.asset_url },
      layerType // Ora passiamo 'background' o 'planet', correttamente!
    );

    // 3. Salviamo sul server (questa parte era già corretta)
    const result = await equipItem(item.item_id);
    if (!result.success) {
      alert(`Errore nel salvataggio: ${result.error}`);
      // Qui potresti voler implementare una logica per annullare la modifica locale
    }
  };
  
  const backgrounds = createMemo(() => 
    gameStore.profile?.inventory?.filter(item => item.game_items?.item_type === 'bioma_background')
  );
  const planets = createMemo(() =>
    gameStore.profile?.inventory?.filter(item => item.game_items?.item_type === 'bioma_planet')
  );

  return (
    <div>
      <h1 class="text-4xl font-bold text-biolume mb-8">Il Tuo Bioma</h1>
      
      <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
        <Show when={gameStore.profile} fallback={<p class="text-red-400">{gameStore.error}</p>}>
          {(profile) => {
            // Facciamo un "cast" dei layer equipaggiati al nostro tipo definito
            const equipped = () => profile().planets[0]?.equipped_layers as EquippedLayers | null;

            return (
              <div class="flex flex-col lg:flex-row gap-8 animate-fade-in">
                <div class="flex-1 aspect-square bg-black/50 rounded-2xl relative overflow-hidden border border-starlight/10 shadow-2xl shadow-starlight/5">
                  <div class="absolute inset-0 bg-black/30 z-10" />
                  <Show 
                    when={equipped()} 
                    fallback={<div class="w-full h-full flex items-center justify-center"><p class="text-ghost/50">Equipaggia degli oggetti per vedere il tuo Bioma.</p></div>}
                  >
                    {/* Ora TypeScript sa che equipped() ha le proprietà .background e .planet */}
                    {equipped()?.background?.asset_url && (
                      <img src={`${STORAGE_URL}${equipped()!.background!.asset_url}`} alt="Sfondo" class="absolute inset-0 w-full h-full object-cover" />
                    )}
                    {equipped()?.planet?.asset_url && (
                      <img src={`${STORAGE_URL}${equipped()!.planet!.asset_url}`} alt="Pianeta" class="absolute inset-0 w-full h-full object-cover scale-50" />
                    )}
                  </Show>
                </div>

                <div class="w-full lg:w-80 flex-shrink-0">
                  <div class="bg-starlight/5 rounded-2xl p-6 border border-starlight/10">
                    <h2 class="text-xl font-semibold text-biolume/80 mb-4">Inventario</h2>
                    <div class="space-y-6">
                      <div>
                        <h3 class="text-ghost/60 mb-2 text-sm">Sfondi</h3>
                        <div class="grid grid-cols-4 gap-3">
                          <For each={backgrounds()}>
                            {(item: InventoryItemWithDetails) => (
                              <button 
                                onClick={() => handleEquip(item)}
                                class="aspect-square bg-black rounded-lg border-2 border-transparent hover:border-biolume focus:outline-none focus:border-biolume transition-all"
                                classList={{ '!border-biolume shadow-lg shadow-biolume/20': equipped()?.background?.id === item.item_id }}
                              >
                                <img src={`${STORAGE_URL}${item.game_items?.asset_url}`} alt={item.game_items?.name ?? ''} class="w-full h-full object-cover rounded-md" />
                              </button>
                            )}
                          </For>
                        </div>
                      </div>
                      <div>
                        <h3 class="text-ghost/60 mb-2 text-sm">Pianeti</h3>
                        <div class="grid grid-cols-4 gap-3">
                          <For each={planets()}>
                            {(item: InventoryItemWithDetails) => (
                              <button 
                                onClick={() => handleEquip(item)}
                                class="aspect-square bg-black rounded-lg border-2 border-transparent hover:border-biolume focus:outline-none focus:border-biolume transition-all"
                                classList={{ '!border-biolume shadow-lg shadow-biolume/20': equipped()?.planet?.id === item.item_id }}
                              >
                                <img src={`${STORAGE_URL}${item.game_items?.asset_url}`} alt={item.game_items?.name ?? ''} class="w-full h-full object-cover rounded-md" />
                              </button>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        </Show>
      </Show>
    </div>
  );
}