import { For, Show, createMemo, createSignal } from "solid-js"; // Aggiunto <For>
import { Motion, Presence } from "solid-motionone";
import { equipItem } from "~/lib/game-actions";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import Loader from "~/components/ui/Loader";
import type { InventoryItemWithDetails, EquippedLayers } from "~/types/game";
import { CustomizationPanel } from "~/components/game/bioma/CustomizationPanel";

export default function BiomaPage() {
  const STORAGE_URL = import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/images";
  const [savingItemId, setSavingItemId] = createSignal<string | null>(null);

  // Questa logica è già corretta
  const handleEquip = async (item: InventoryItemWithDetails) => {
    if (!item.game_items || savingItemId()) return;
    setSavingItemId(item.item_id);

    let layerType: 'background' | 'bioma';
    
    switch (item.game_items.item_type) {
      case 'bioma_background':
        layerType = 'background';
        break;
      case 'bioma_bioma':
        layerType = 'bioma';
        break;
      default:
        console.error("Tipo di oggetto non equipaggiabile:", item.game_items.item_type);
        setSavingItemId(null);
        return;
    }

    gameStoreActions.equipBiomaLayer(
      { id: item.item_id, asset_url: item.game_items.asset_url },
      layerType
    );
    
    await equipItem(item.item_id);
    setSavingItemId(null);
  };

  const equippedLayers = createMemo(() => gameStore.profile?.biomes[0]?.equipped_layers as EquippedLayers | null);

  return (
    <div class="w-full h-full">
      <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
        <Show when={gameStore.profile} fallback={<p class="text-red-400">{gameStore.error}</p>}>
          {(P) => (
            <div class="flex w-full h-full">
              {/* Sezione Sinistra: Visualizzazione del Bioma */}
              <div class="flex-1 bg-black relative">
                
                <Presence>
                  <For each={ equippedLayers()?.background ? [equippedLayers()!.background!] : [] }>
                    {(bg) => (
                      <Motion.img
                        initial={{ opacity: 0, scale: 1.05 }}
                        // 1. PULSAZIONE ACCENTUATA
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          filter: [
                            'blur(8px) brightness(60%)',  // Stato "chiuso": più scuro e meno sfocato
                            'blur(24px) brightness(75%)' // Stato "aperto": più luminoso e molto più sfocato
                          ]
                        }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ 
                          duration: 0.8, 
                          easing: "ease-in-out",
                          filter: { 
                            duration: 4, // Un po' più veloce per un effetto più marcato
                            repeat: Infinity,
                            direction: 'alternate',
                          }
                        }}
                        src={`${STORAGE_URL}${bg.asset_url}`} 
                        alt="Sfondo" 
                        class="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </For>
                </Presence>

                <Motion.div
                  class="absolute inset-0 grid-overlay pointer-events-none"
                  animate={{
                    opacity: [0.2, 0.6] // Pulsa da 20% a 60% di opacità
                  }}
                  transition={{
                    duration: 3,            // Durata di ogni pulsazione
                    repeat: Infinity,       // Ripeti all'infinito
                    direction: 'alternate', // Effetto pulsante (avanti e indietro)
                  }}
                />
                
                {/* --- MODIFICA DEFINITIVA PER IL BIOMA --- */}
                <Presence>
                  <For each={ equippedLayers()?.bioma ? [equippedLayers()!.bioma!] : [] }>
                    {(planet) => ( // 'planet' è l'oggetto, non un accessor
                      <Motion.img
                        initial={{ opacity: 0, scale: 0.45 }}
                        animate={{ opacity: 1, scale: 0.5 }}
                        exit={{ opacity: 0, scale: 0.45 }}
                        transition={{ duration: 0.8, easing: "ease-in-out" }}
                        src={`${STORAGE_URL}${planet.asset_url}`}
                        alt="Pianeta" 
                        class="absolute inset-0 w-full h-full object-contain"
                      />
                    )}
                  </For>
                </Presence>
              </div>

              {/* Sezione Destra: Pannello (già corretto) */}
              <CustomizationPanel 
                inventory={gameStore.profile!.inventory}
                equippedLayers={equippedLayers()}
                onEquip={handleEquip}
                savingItemId={savingItemId()}
              />
            </div>
          )}
        </Show>
      </Show>
    </div>
  );
}