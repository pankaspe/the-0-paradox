// src/lib/gameStore.ts
import { createStore, produce } from "solid-js/store";
import type { ProfileWithPlanets, EquippedLayers } from "~/types/game";
import { getInitialGameData } from "./game-actions";

interface GameStore {
  profile: ProfileWithPlanets | null;
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
          s.profile = data as ProfileWithPlanets;
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

 // --- SOLUZIONE REATTIVA E TYPESAFE ---
  // --- QUESTA È LA VERSIONE FINALE E CORRETTA ---
  equipBiomaLayer(layerData: { id: string; asset_url: string | null }, layerType: 'background' | 'planet') {
    // Prendiamo l'oggetto `equipped_layers` attuale.
    // Se è null o non definito, partiamo da un oggetto vuoto {}.
    const currentLayers = store.profile?.planets[0]?.equipped_layers as EquippedLayers || {};

    // Creiamo un oggetto `newLayers` completamente nuovo.
    // Copiamo i layer esistenti e sovrascriviamo solo quello modificato.
    // Questo garantisce la corretta SOSTITUZIONE e non la sovrapposizione.
    const newLayers: EquippedLayers = {
      ...currentLayers,
      [layerType]: layerData, 
    };

    // Sostituiamo l'INTERO oggetto `equipped_layers`.
    // Questa operazione è 100% reattiva e typesafe.
    setStore("profile", "planets", 0, "equipped_layers", newLayers);
  }
};

export { store as gameStore, actions as gameStoreActions };