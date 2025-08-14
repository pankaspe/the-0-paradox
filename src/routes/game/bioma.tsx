// routes/game/bioma.tsx

import { For, Show, createMemo, createSignal, onMount, createEffect } from "solid-js"; // 1. Importa createEffect
import { Motion, Presence } from "solid-motionone";
import { A } from "@solidjs/router";
import { equipItem } from "~/lib/game-actions";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import Loader from "~/components/ui/Loader";
import type { InventoryItemWithDetails, EquippedLayers } from "~/types/game";
import { CustomizationPanel } from "~/components/game/bioma/CustomizationPanel";

import { Image } from "@unpic/solid";

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
      gameStoreActions.showToast(`${item.game_items?.name} equipaggiato!`, 'success');
    } else {
      console.error("Failed to equip item:", result.error);
      gameStoreActions.showToast(`Errore: ${result.error || 'Sconosciuto'}`, 'error');
    }
    
    setSavingItemId(null);
  };

  // --- LOGICA REATTIVA PER I LAYER ---
  const equippedLayers = createMemo(() => gameStore.profile?.biomes[0]?.equipped_layers as EquippedLayers | null);
  const auraStyle = createMemo(() => equippedLayers()?.aura?.style_data ?? {});
  
  // Memo specifici per gli URL, per rendere il codice più pulito
  const backgroundAssetUrl = createMemo(() => equippedLayers()?.background?.asset_url);
  const biomaLayer = createMemo(() => equippedLayers()?.bioma);
  const biomaAssetUrl = createMemo(() => biomaLayer()?.asset_url);

  // --- LOGICA DI CARICAMENTO IMMAGINI (CORRETTA) ---
  const [loadingImages, setLoadingImages] = createSignal(new Set<string>());
  
  const handleImageLoad = (url: string) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  };
  
  // 2. Usiamo createEffect per aggiungere reattivamente gli URL alla lista di caricamento.
  // Questo effect si attiva ogni volta che 'backgroundAssetUrl' cambia.
  createEffect(() => {
    const url = backgroundAssetUrl();
    if (url) {
      // Aggiunge l'URL al Set. Se è già presente, non succede nulla.
      setLoadingImages(prev => new Set(prev).add(url));
    }
  });

  // Questo effect si attiva ogni volta che 'biomaAssetUrl' cambia.
  createEffect(() => {
    const url = biomaAssetUrl();
    if (url) {
      setLoadingImages(prev => new Set(prev).add(url));
    }
  });

  const isSceneLoading = createMemo(() => loadingImages().size > 0);
  const isScenePopulated = createMemo(() => equippedLayers()?.background || equippedLayers()?.bioma);

  return (
    <div class="absolute inset-0 z-0">
      <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
        <Show when={gameStore.profile} fallback={<p class="text-red-400">{gameStore.error}</p>}>
          <div class="flex w-full h-full">
            
            <div class="flex-1 bg-black relative">

              {/* 1. LAYER DELLO SFONDO */}
              <Presence>
                {/* 3. Rimuoviamo la logica di 'onMount' da qui, ora è gestita globalmente da createEffect */}
                <For each={equippedLayers()?.background ? [equippedLayers()!.background!] : []}>
                  {(bg) => (
                      <Motion.div
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1, filter: ['blur(8px) brightness(50%)', 'blur(18px) brightness(75%)'] }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.8, easing: "ease-in-out", filter: { duration: 4, repeat: Infinity, direction: 'alternate' } }}
                        class="absolute inset-0 w-full h-full"
                      >
                        <Image
                          src={`${STORAGE_URL}${bg.asset_url}`} alt="Sfondo" class="w-full h-full object-cover"
                          layout="fullWidth" 
                          onLoad={() => handleImageLoad(bg.asset_url!)}
                          onError={() => handleImageLoad(bg.asset_url!)} 
                          priority={true}
                        />
                      </Motion.div>
                    )
                  }
                </For>
              </Presence>

              <Motion.div class="absolute inset-0 grid-overlay pointer-events-none"
                animate={{ opacity: [0.2, 0.9] }} transition={{ duration: 3, repeat: Infinity, direction: 'alternate' }}
              />

              {/* 2. LAYER DEL PIANETA (NUCLEO) */}
              <div class="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                <Motion.div
                  initial={false}
                  animate={{
                    opacity: biomaLayer() ? 1 : 0,
                    scale: biomaLayer() ? 0.5 : 0,
                  }}
                  transition={{ duration: 0.8, easing: "ease-in-out" }}
                  style={auraStyle()}
                >
                  <Show when={biomaLayer()}>
                    <Image
                      src={`${STORAGE_URL}${biomaLayer()!.asset_url}`}
                      alt="Nucleo" class="object-contain" 
                      layout="constrained"
                      width={1300} height={1300} 
                      priority={true}
                      onLoad={() => handleImageLoad(biomaLayer()!.asset_url!)}
                      onError={() => handleImageLoad(biomaLayer()!.asset_url!)}
                    />
                  </Show>
                </Motion.div>
              </div>

              {/* 3. MESSAGGIO DI FALLBACK */}
              <Show when={!isScenePopulated() && !gameStore.isLoading}>
                <Motion.div class="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <p class="text-2xl font-bold text-starlight mb-2">Il tuo Bioma attende.</p>
                  <p class="text-ghost/70 max-w-sm mb-6">Equipaggia uno Sfondo o un Nucleo per iniziare a dargli forma. Puoi trovarli nell'Emporio.</p>
                  <A href="/game/emporio" class="py-3 px-6 font-semibold text-abyss bg-biolume rounded-md transition-transform hover:scale-105 shadow-lg shadow-biolume/20">
                    Visita l'Emporio
                  </A>
                </Motion.div>
              </Show>

              {/* 4. LOADER DELLA SCENA */}
              <Presence>
                <Show when={isSceneLoading()}>
                  <Motion.div class="absolute inset-0 z-10 bg-abyss/80 backdrop-blur-sm flex items-center justify-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader />
                  </Motion.div>
                </Show>
              </Presence>
            </div>

            <CustomizationPanel 
              inventory={gameStore.profile!.inventory} equippedLayers={equippedLayers()}
              onEquip={handleEquip} savingItemId={savingItemId()}
            />
          </div>
        </Show>
      </Show>
    </div>
  );
}