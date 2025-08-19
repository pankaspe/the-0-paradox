import { createStore } from "solid-js/store";
import { getParadoxStep, submitParadoxSolution } from "./game-actions";
import { gameStore, gameStoreActions } from "./gameStore";
import type { ProfileUser } from "~/types/game";

// Type Definitions
interface ParadoxStep {
  id: number;
  title: string;       // NUOVO
  intro_text: string;  // NUOVO
  hint: string | null; // NUOVO (può essere nullo)
  core_text: string;
  fragments: string[];
  solutions: string[]; 
}

interface ParadoxStore {
  currentStep: ParadoxStep | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  validationDetails: boolean[] | null; 
}


// Store Definition
const [store, setStore] = createStore<ParadoxStore>({
  currentStep: null,
  isLoading: true,
  isSubmitting: false,
  error: null,
  validationDetails: null, 
});

// Store Actions
const actions = {
  async loadCurrentStep() {
    if (!gameStore.profile) {
      setStore("error", "User profile not loaded. Cannot fetch step.");
      setStore("isLoading", false);
      return;
    }
    setStore("isLoading", true);
    setStore("currentStep", null);
    const stepId = gameStore.profile.current_step_id;
    const result = await getParadoxStep(stepId);

    if (result.success && result.data) {
      setStore("currentStep", result.data as ParadoxStep);
      setStore("isLoading", false);
      setStore("error", null);
    } else {
      setStore("error", result.error || "Failed to load paradox step.");
      setStore("isLoading", false);
    }
  },

  async submitSolution(solutions: (string | null)[]) {
    if (!store.currentStep || store.isSubmitting) return;
    if (solutions.some(s => s === null)) {
      gameStoreActions.showToast("All slots must be filled.", "error");
      return;
    }
    setStore("isSubmitting", true);
    this.resetValidation(); // Chiama l'azione di reset

    const result = await submitParadoxSolution(store.currentStep.id, solutions as string[]);
    
    if (result.updatedProfile) {
      gameStoreActions.updateProfile(result.updatedProfile as ProfileUser);
    }
    if (result.success) {
      gameStoreActions.showToast("Sequence accepted. Evolving...", "success");
      setTimeout(() => this.loadCurrentStep(), 1000);
    } else {
      gameStoreActions.showToast(result.error || "Incorrect sequence.", "error");
      if (result.details) {
        setStore("validationDetails", result.details);
      }
    }
    setStore("isSubmitting", false);
  },

  /**
   * >>> NUOVA AZIONE CORRETTA <<<
   * Resetta lo stato del feedback di validazione.
   */
  resetValidation() {
    setStore("validationDetails", null);
  }
};

export { store as paradoxStore, actions as paradoxStoreActions };