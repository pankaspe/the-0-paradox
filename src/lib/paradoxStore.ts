// src/lib/paradoxStore.ts

import { createStore } from "solid-js/store";
import { getParadoxStep, submitParadoxSolution } from "./game-actions";
import { gameStore, gameStoreActions } from "./gameStore";
import type { ProfileUser } from "~/types/game";

// --- TYPE DEFINITIONS ---

/**
 * Represents a single step or puzzle in the Paradox game.
 */
export interface ParadoxStep {
  id: number;
  title: string;
  intro_text: string;
  hint: string | null;
  core_text: string;
  fragments: string[];
  solutions: string[];
  outcome_text: string;
}

/**
 * Represents an Anomaly event, triggered by consecutive failures.
 */
export interface Anomaly {
  id: number;
  name: string;
  description: string;
  resolution_type: string;
  config: any; // Using `any` for flexibility with different config structures.
}

/**
 * Defines the structure for the paradox-specific game state.
 */
interface ParadoxStore {
  currentStep: ParadoxStep | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  validationDetails: boolean[] | null; 
  activeAnomaly: Anomaly | null; // Holds the currently active anomaly event.
}


// --- STORE DEFINITION ---
const [store, setStore] = createStore<ParadoxStore>({
  currentStep: null,
  isLoading: true,
  isSubmitting: false,
  error: null,
  validationDetails: null,
  activeAnomaly: null, // Initial state is no anomaly.
});


// --- STORE ACTIONS ---
const actions = {
  /**
   * Fetches the current paradox step data from the server based on the user's profile.
   */
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

  /**
   * Submits the user's proposed solution to the server for validation.
   * Handles success (advancing to the next step) and failure (showing errors and potentially triggering an Anomaly).
   */
  async submitSolution(solutions: (string | null)[]) {
    if (!store.currentStep || store.isSubmitting) return;
    if (solutions.some(s => s === null)) {
      gameStoreActions.showToast("All slots must be filled.", "error");
      return;
    }
    setStore("isSubmitting", true);
    this.resetValidation();

    const result = await submitParadoxSolution(store.currentStep.id, solutions as string[]);
    
    if (result.updatedProfile) {
      gameStoreActions.updateProfile(result.updatedProfile as ProfileUser);
    }

    if (result.success) {
      const outcomeMessage = store.currentStep?.outcome_text || "Sequence accepted. Evolving...";
      gameStoreActions.showToast(outcomeMessage, "success");
      // Wait for the toast to be readable before loading the next step.
      setTimeout(() => this.loadCurrentStep(), 2500);
    } else {
      // On failure, show an error toast.
      gameStoreActions.showToast(result.error || "Incorrect sequence.", "error");

      // If the server returned an anomaly, set it in the store to trigger the UI.
      if (result.anomaly) {
        setStore("activeAnomaly", result.anomaly as Anomaly);
      }

      // If the server returned validation details, update the store.
      if (result.details) {
        setStore("validationDetails", result.details);
      }
    }
    setStore("isSubmitting", false);
  },

  /**
   * Clears the current validation feedback state (e.g., green/red highlighting).
   */
  resetValidation() {
    setStore("validationDetails", null);
  },

  /**
   * Clears the active anomaly from the store, effectively closing its UI.
   * Called by the AnomalySolver component upon successful resolution.
   */
  resolveAnomaly() {
    setStore("activeAnomaly", null);
    gameStoreActions.showToast("Anomaly neutralized. Connection restored.", "success");
  }
};

export { store as paradoxStore, actions as paradoxStoreActions };