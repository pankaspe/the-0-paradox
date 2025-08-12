// src/lib/gameStore.ts
import { createStore, produce } from "solid-js/store";
import type { ProfileWithPlanets } from "~/types/game";
import { getGameData } from "./game-actions";

// 1. Definiamo la forma del nostro store
interface GameStore {
  profile: ProfileWithPlanets | null;
  isLoading: boolean;
  error: string | null;
}

// 2. Creiamo lo store con i valori iniziali
const [store, setStore] = createStore<GameStore>({
  profile: null,
  isLoading: true,
  error: null,
});

// 3. Creiamo le azioni per interagire con lo store
const actions = {
  // Azione per caricare i dati iniziali dal server
  async loadInitialData() {
    // Se i dati sono già stati caricati, non fare nulla
    if (store.profile) return;
    
    setStore("isLoading", true);
    try {
      const data = await getGameData();
      if (data) {
        setStore(produce(s => {
          s.profile = data;
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

  // Azione per aggiornare lo username (aggiornamento ottimistico)
  updateUsername(newUsername: string, originalUsername: string) {
    // Aggiorniamo subito la UI
    setStore("profile", "username", newUsername);
    // Non abbiamo più bisogno di una funzione separata `updateStoreUsername`
  },

  // Azione per ripristinare lo username in caso di errore
  revertUsername(originalUsername: string) {
    setStore("profile", "username", originalUsername);
  }
};

// 4. Esportiamo lo store (sola lettura) e le azioni
export { store as gameStore, actions as gameStoreActions };