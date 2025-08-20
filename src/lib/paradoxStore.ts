// src/lib/paradoxStore.ts

import { createStore } from "solid-js/store";
import { getParadoxStep, submitParadoxSolution, performInteraction } from "./game-actions";
import { gameStore, gameStoreActions } from "./gameStore";
import type { ProfileUser } from "~/types/game";


// --- TYPE DEFINITIONS ---

export type InteractionLog = {
  type: 'command' | 'outcome';
  text: string;
};

const CONSOLE_WELCOME_MESSAGE: InteractionLog[] = [
  { type: 'outcome', text: 'Kernel v0.0.1 :: PARADOX OS' },
  { type: 'outcome', text: 'Inizializzazione completata. Interagisci con gli elementi evidenziati nell\'ambiente per raccogliere indizi.' }
];

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
 * Defines the structure for the paradox-specific game state.
 */
interface ParadoxStore {
  currentStep: ParadoxStep | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  validationDetails: boolean[] | null; 
  isDecrypted: boolean; // L'enigma è stato sbloccato?
  interactionLog: InteractionLog[]; // Cronologia per la console
}


// --- STORE DEFINITION ---
const [store, setStore] = createStore<ParadoxStore>({
  currentStep: null,
  isLoading: true,
  isSubmitting: false,
  error: null,
  validationDetails: null,
  isDecrypted: false,
  interactionLog: CONSOLE_WELCOME_MESSAGE, 
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
      setStore("isDecrypted", false); // Ogni nuovo step parte criptato
      setStore("interactionLog", CONSOLE_WELCOME_MESSAGE); // Pulisci la console
      setStore("validationDetails", null); // Pulisci la validazione precedente

      if (!(result.data as any).encryption_data) {
        setStore("isDecrypted", true);
      }
      setStore("isLoading", false);
      setStore("error", null);
    } else {
      setStore("error", result.error || "Failed to load paradox step.");
      setStore("isLoading", false);
    }
  },

  async handleInteraction(target: string, command: string) {
    if (!store.currentStep) return;

    // Aggiungiamo il comando dell'utente al log per un feedback immediato
    setStore("interactionLog", prev => [...prev, { type: 'command', text: `${command} ${target}` }]);

    const result = await performInteraction(store.currentStep.id, target, command);
    
    if (result.success) {
      // Aggiungiamo il risultato al log
      setStore("interactionLog", prev => [...prev, { type: 'outcome', text: result.outcome_text! }]);
      
      // Se l'azione ha sbloccato l'enigma, aggiorniamo lo stato!
      if (result.reveals_key) {
        setStore("isDecrypted", true);
        gameStoreActions.showToast("Intuizione Raggiunta. Canale Dati Decriptato.", "success");
      }
    } else {
      gameStoreActions.showToast(result.error || "Interferenza nel segnale.", "error");
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

};

export { store as paradoxStore, actions as paradoxStoreActions };