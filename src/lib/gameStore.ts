// src/lib/gameStore.ts

import { createStore, produce } from "solid-js/store";
import type { ProfileUser, DroppedItem  } from "~/types/game";
import {
  getInitialGameState,
  signOutUser,
  equipAvatar,
} from "./game-actions";

import { themeStoreActions } from "./themeStore";

// =================================================================
// Store Definition and Initial State
// =================================================================

/**
 * Defines the structure for the global game state store.
 * This state is used throughout the application to manage user data,
 * loading states, errors, and UI notifications (toasts).
 */
interface GameStore {
  profile: ProfileUser | null;
  isLoading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info'; id: number } | null;
  isSubmitting: boolean;
  droppedItemModal: DroppedItem | null;
}

/**
 * Initializes the Solid.js store with its default state.
 */
const [store, setStore] = createStore<GameStore>({
  profile: null,
  isLoading: true,
  error: null,
  toast: null,
  isSubmitting: false,
  droppedItemModal: null,
});

/**
 * Variable to hold the timeout ID for the toast notification.
 */
let toastTimeout: ReturnType<typeof setTimeout>;

// =================================================================
// Store Actions
// =================================================================

const actions = {
  // --- Data and State Management ---

  /**
   * Asynchronously loads the initial game state from the server.
   * This action fetches the user's profile and related data, sets the theme preference,
   * and updates the store's state accordingly. It prevents multiple fetches
   * by checking if the profile is already loaded.
   */
  async loadInitialData() {
    if (store.profile) {
      return;
    }

    setStore("isLoading", true);
    try {
      const data = await getInitialGameState();

      if (data && data.profile) {
        themeStoreActions.setTheme(data.profile.preferred_theme as 'light' | 'dark');
        setStore("profile", data.profile);
        setStore("isLoading", false);
        setStore("error", null);
      } else {
        throw new Error("Game state could not be loaded.");
      }
    } catch (e: any) {
      // Use `produce` for a clean state update with a functional setter.
      setStore(produce(s => {
        s.error = e.message || "An unknown error occurred.";
        s.isLoading = false;
      }));
    }
  },

  /**
   * Updates the user's username in the local store.
   * Note: This is a local-only update and should be paired with a server action
   * to persist the change. It's useful for providing instant feedback to the user.
   * @param {string} newUsername The new username to display.
   */
  updateUsername(newUsername: string) {
    if (store.profile) {
      setStore("profile", "username", newUsername);
    }
  },

  /**
   * Reverts the username in the local store to its original value.
   * This is typically used to undo a local change if the server action fails.
   * @param {string} originalUsername The original username.
   */
  revertUsername(originalUsername: string) {
    if (store.profile) {
      setStore("profile", "username", originalUsername);
    }
  },

  /**
   * Equips a new avatar for the user.
   * This action performs a pessimistic UI update: it first updates the local state,
   * then calls the server action to persist the change. If the server action fails,
   * it reverts the local state and shows a toast notification.
   * @param {string} newAvatarId The ID of the avatar to equip.
   */
  async equipAvatar(newAvatarId: string) {
    if (!store.profile || store.profile.active_avatar_id === newAvatarId) {
      return;
    }

    const originalAvatarId = store.profile.active_avatar_id;
    setStore("profile", "active_avatar_id", newAvatarId);

    const result = await equipAvatar(newAvatarId);
    if (!result.success) {
      this.showToast(result.error || "Failed to equip avatar.", 'error');
      // Revert the local state on failure
      setStore("profile", "active_avatar_id", originalAvatarId);
    }
  },

  /**
   * Signs out the user by calling the server action.
   * If successful, it redirects the user to the home page.
   * If it fails, it displays an error toast.
   */
  async signOut() {
    const result = await signOutUser();
    if (result.success) {
      window.location.href = '/';
    } else {
      this.showToast(`Error during logout: ${result.error}`, 'error');
    }
  },

  // =================================================================
  // >>> NUOVE ACTIONS PER IL MODAL <<<
  // =================================================================
  /**
   * Mostra il modal del drop con l'oggetto specificato.
   * @param {DroppedItem} item L'oggetto da mostrare.
   */
  showDropModal(item: DroppedItem) {
    setStore("droppedItemModal", item);
  },

  /**
   * Nasconde il modal del drop.
   */
  hideDropModal() {
    setStore("droppedItemModal", null);
  },


  // --- UI and Toast Management ---

  /**
   * Displays a transient toast notification.
   * It clears any existing toast timeout and sets a new one, ensuring that
   * only one toast is visible at a time.
   * @param {string} message The message to display.
   * @param {'success' | 'error' | 'info'} [type='info'] The type of the toast.
   */
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    clearTimeout(toastTimeout);
    setStore('toast', { message, type, id: Date.now() });
    toastTimeout = setTimeout(() => this.hideToast(), 5000);
  },

  /**
   * Hides the current toast notification.
   * This function clears the timeout and sets the toast state back to null.
   */
  hideToast() {
    clearTimeout(toastTimeout);
    setStore('toast', null);
  },

    /**
   * Aggiorna l'intero oggetto del profilo utente nello store.
   * Utile quando il backend restituisce un profilo aggiornato dopo un'azione.
   * @param {ProfileUser} newProfile L'oggetto completo del nuovo profilo.
   */
  updateProfile(newProfile: ProfileUser) {
    setStore("profile", newProfile);
  },
  
};

// =================================================================
// Exports
// =================================================================

export { store as gameStore, actions as gameStoreActions };