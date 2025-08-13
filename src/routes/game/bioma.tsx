// routes/game/bioma.tsx
import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { A } from "@solidjs/router"; // Aggiungiamo l'import per il link
import { equipItem } from "~/lib/game-actions";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import Loader from "~/components/ui/Loader";
import type { InventoryItemWithDetails, EquippedLayers } from "~/types/game";
import { CustomizationPanel } from "~/components/game/bioma/CustomizationPanel";

export default function BiomaPage() {
  const STORAGE_URL = import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/images";
  const [savingItemId, setSavingItemId] = createSignal<string | null>(null);

  const handleEquip = async (item: InventoryItemWithDetails) => {
    if (!item.game_items || savingItemId()) return;
    setSavingItemId(item.item_id);

    let layerType: 'background' | 'bioma' | 'aura';
    
    switch (item.game_items.item_type) {
      case 'bioma_background': layerType = 'background'; break;
      case 'bioma_bioma': layerType = 'bioma'; break;
      case 'aura': layerType = 'aura'; break;
      default: console.error("Tipo di oggetto non equipaggiabile:", item.game_items.item_type); setSavingItemId(null); return;
    }

    const result = await equipItem(item.item_id);

    if (result.success) {
      gameStoreActions.equipBiomaLayer(
        { id: item.item_id, asset_url: item.game_items.asset_url, style_data: item.game_items.style_data as Record<string, any> | null },
        layerType
      );
      if (result.success) {
        gameStoreActions.showToast(`${item.game_items?.name} equipaggiato!`, 'success');
      } else {
        gameStoreActions.showToast(`Errore: ${result.error}`, 'error');
      }
    } else {
      // gameStoreActions.showToast(`Errore: ${result.error}`, 'error');
      console.error("Failed to equip item:", result.error);
    }
    
    setSavingItemId(null);
  };

  const equippedLayers = createMemo(() => gameStore.profile?.biomes[0]?.equipped_layers as EquippedLayers | null);
  const auraStyle = createMemo(() => equippedLayers()?.aura?.style_data ?? {});

  const [loadingImages, setLoadingImages] = createSignal(new Set<string>());
  
  const handleImageLoad = (url: string) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  };

  const isSceneLoading = createMemo(() => loadingImages().size > 0);

  // --- NUOVO MEMO PER CONTROLLARE SE LA SCENA È VUOTA ---
  const isScenePopulated = createMemo(() => equippedLayers()?.background || equippedLayers()?.bioma);

  return (
    <div class="w-full h-full">
      <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
        <Show when={gameStore.profile} fallback={<p class="text-red-400">{gameStore.error}</p>}>
          <div class="flex w-full h-full">
            <div class="flex-1 bg-black relative">

              {/* Usiamo un <Show> per decidere se mostrare la scena o il messaggio di fallback */}
              <Show
                when={isScenePopulated()}
                fallback={
                  <Motion.div
                    class="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p class="text-2xl font-bold text-starlight mb-2">Il tuo Bioma attende.</p>
                    <p class="text-ghost/70 max-w-sm mb-6">Equipaggia uno Sfondo o un Nucleo per iniziare a dargli forma. Puoi trovarli nell'Emporio.</p>
                    <A href="/game/emporio" class="py-3 px-6 font-semibold text-abyss bg-biolume rounded-md transition-transform hover:scale-105 shadow-lg shadow-biolume/20">
                      Visita l'Emporio
                    </A>
                  </Motion.div>
                }
              >
                {/* --- TUTTA LA LOGICA DI VISUALIZZAZIONE ESISTENTE VA QUI DENTRO --- */}
                <Presence>
                  <Show when={isSceneLoading()}>
                    <Motion.div 
                      class="absolute inset-0 z-10 bg-abyss/80 backdrop-blur-sm flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Loader />
                    </Motion.div>
                  </Show>
                </Presence>
                  
                <Presence>
                  <For each={equippedLayers()?.background ? [equippedLayers()!.background!] : []}>
                    {(bg) => {
                      if (bg.asset_url) onMount(() => setLoadingImages(prev => new Set(prev).add(bg.asset_url!)));
                      return (
                        <Motion.img
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1, filter: ['blur(8px) brightness(50%)', 'blur(18px) brightness(75%)'] }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.8, easing: "ease-in-out", filter: { duration: 4, repeat: Infinity, direction: 'alternate' } }}
                          src={`${STORAGE_URL}${bg.asset_url}`} 
                          alt="Sfondo" 
                          class="absolute inset-0 w-full h-full object-cover"
                          onLoad={() => handleImageLoad(bg.asset_url!)}
                          onError={() => handleImageLoad(bg.asset_url!)}
                        />
                      );
                    }}
                  </For>
                </Presence>

                <Motion.div
                  class="absolute inset-0 grid-overlay pointer-events-none"
                  animate={{ opacity: [0.2, 0.9] }}
                  transition={{ duration: 3, repeat: Infinity, direction: 'alternate' }}
                />

                <div class="absolute inset-0 w-full h-full">
                  <Presence>
                    <For each={equippedLayers()?.bioma ? [equippedLayers()!.bioma!] : []}>
                      {(planet) => {
                        if (planet.asset_url) onMount(() => setLoadingImages(prev => new Set(prev).add(planet.asset_url!)));
                        return (
                          <div class="absolute inset-0 w-full h-full" style={auraStyle()}>
                            <Motion.img
                              initial={{ opacity: 0, scale: 0.45 }}
                              animate={{ opacity: 2, scale: 0.5 }}
                              exit={{ opacity: 0, scale: 0.45 }}
                              transition={{ duration: 0.8, easing: "ease-in-out" }}
                              src={`${STORAGE_URL}${planet.asset_url}`}
                              alt="Pianeta"
                              class="absolute inset-0 w-full h-full object-contain"
                              onLoad={() => handleImageLoad(planet.asset_url!)}
                              onError={() => handleImageLoad(planet.asset_url!)}
                            />
                          </div>
                        );
                      }}
                    </For>
                  </Presence>
                </div>
              </Show>
            </div>

            <CustomizationPanel 
              inventory={gameStore.profile!.inventory}
              equippedLayers={equippedLayers()}
              onEquip={handleEquip}
              savingItemId={savingItemId()}
            />
          </div>
        </Show>
      </Show>
    </div>
  );
}