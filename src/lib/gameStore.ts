import { createStore, produce } from "solid-js/store";
import type { ProfileWithBiomes } from "~/types/game";
import type { Tables } from "~/types/supabase";
// Importiamo TUTTE le azioni che ci servono
import { getInitialGameState, makeChoice, signOutUser, equipAvatar } from "./game-actions";

type ChoiceWithOutcomes = Tables<'choices'> & {
  choice_outcomes: Tables<'choice_outcomes'>[];
};

export type EventWithChoices = Tables<'events'> & {
  choices: ChoiceWithOutcomes[];
};

interface GameStore {
  profile: ProfileWithBiomes | null;
  currentEvent: EventWithChoices | null;
  isLoading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info'; id: number } | null;
}

const [store, setStore] = createStore<GameStore>({
  profile: null,
  currentEvent: null,
  isLoading: true,
  error: null,
  toast: null,
});

let toastTimeout: ReturnType<typeof setTimeout>;

const actions = {
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    clearTimeout(toastTimeout);
    setStore('toast', { message, type, id: Date.now() });
    toastTimeout = setTimeout(() => actions.hideToast(), 5000);
  },

  hideToast() {
    clearTimeout(toastTimeout);
    setStore('toast', null);
  },

  async loadInitialData() {
    if (store.profile) return setStore("isLoading", false);
    setStore("isLoading", true);
    try {
      const data = await getInitialGameState();
      if (data) {
        setStore(produce(s => {
          s.profile = data.profile;
          s.currentEvent = data.currentEvent;
          s.isLoading = false;
          s.error = null;
        }));
      } else {
        throw new Error("Game state could not be loaded.");
      }
    } catch (e: any) {
      setStore(produce(s => {
        s.error = e.message || "An unknown error occurred.";
        s.isLoading = false;
      }));
    }
  },

  async processChoice(choiceId: string) {
    const result = await makeChoice(choiceId);

    if (result.success && result.updatedBiome && result.updatedProfile && result.nextEvent)  {
      setStore(produce(s => {
        if (!s.profile) return;

        s.profile.energy = result.updatedProfile.energy;

        const biomeIndex = s.profile.biomes.findIndex(b => b.id === result.updatedBiome!.id);
        if (biomeIndex > -1) {
          s.profile.biomes[biomeIndex] = result.updatedBiome;
        }
        s.currentEvent = result.nextEvent;
      }));
      return { success: true, feedback: result.feedbackNarrative };
    } else {
      actions.showToast(result.error || 'Errore sconosciuto', 'error');
      return { success: false, feedback: null };
    }
  },

  // Azioni per l'update ottimistico dei nomi
  updateUsername(newUsername: string) {
    if (store.profile) {
      setStore("profile", "username", newUsername);
    }
  },

  revertUsername(originalUsername: string) {
    if (store.profile) {
      setStore("profile", "username", originalUsername);
    }
  },

  updateBiomeName(newName: string) {
    if (store.profile?.biomes[0]) {
      setStore("profile", "biomes", 0, "bioma_name", newName);
    }
  },

  revertBiomeName(originalName: string) {
    if (store.profile?.biomes[0]) {
      setStore("profile", "biomes", 0, "bioma_name", originalName);
    }
  },


    async equipAvatar(newAvatarId: string) {
    if (!store.profile || store.profile.active_avatar_id === newAvatarId) return;

    // Salviamo l'ID originale per un eventuale ripristino
    const originalAvatarId = store.profile.active_avatar_id;

    // 1. Aggiornamento Ottimistico: cambiamo subito l'ID nello store
    setStore("profile", "active_avatar_id", newAvatarId);

    // 2. Chiamata al Backend
    const result = await equipAvatar(newAvatarId); // Assicurati di importare equipAvatar da 'game-actions'

    // 3. Gestione dell'Errore
    if (!result.success) {
      actions.showToast(result.error || "Impossibile equipaggiare l'avatar.", 'error');
      // Ripristiniamo l'avatar originale se il server ha fallito
      setStore("profile", "active_avatar_id", originalAvatarId);
    }
  },

  // Azione per il logout, fondamentale per la Topbar
  async signOut() {
    const result = await signOutUser();
    if (result.success) {
      // Potremmo voler fare un redirect o pulire lo store qui
      window.location.href = '/'; // Semplice redirect
    } else {
      actions.showToast(`Errore durante il logout: ${result.error}`, 'error');
    }
  }
};

export { store as gameStore, actions as gameStoreActions };