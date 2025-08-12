// src/lib/gameStore.ts
import { createStore, produce } from "solid-js/store";
import type { ProfileWithBiomes, EquippedLayers } from "~/types/game"; // Corretto: ProfileWithBiomes
import { getInitialGameData } from "./game-actions";

interface GameStore {
  profile: ProfileWithBiomes | null; // Corretto: ProfileWithBiomes
  isLoading: boolean;
  error: string | null;
}

const [store, setStore] = createStore<GameStore>({
  profile: null,
  isLoading: true,
  error: null,
});

const actions = {
  async loadInitialData() {
    if (store.profile) {
      setStore("isLoading", false);
      return;
    }
    setStore("isLoading", true);
    try {
      const data = await getInitialGameData();
      if (data) {
        setStore(produce(s => {
          s.profile = data as ProfileWithBiomes; // Corretto: ProfileWithBiomes
          s.isLoading = false;
          s.error = null;
        }));
      } else {
        throw new Error("Profilo non trovato.");
      }
    } catch (e: any) {
      setStore(produce(s => {
        s.error = e.message || "Errore sconosciuto";
        s.isLoading = false;
      }));
    }
  },

  updateUsername(newUsername: string) {
    setStore("profile", "username", newUsername);
  },

  revertUsername(originalUsername: string) {
    setStore("profile", "username", originalUsername);
  },

  equipBiomaLayer(layerData: { id: string; asset_url: string | null }, layerType: 'background' | 'bioma') { // Corretto: 'bioma'
    const currentLayers = store.profile?.biomes[0]?.equipped_layers as EquippedLayers || {};
    const newLayers: EquippedLayers = {
      ...currentLayers,
      [layerType]: layerData, 
    };
    setStore("profile", "biomes", 0, "equipped_layers", newLayers);
  }
};

export { store as gameStore, actions as gameStoreActions };