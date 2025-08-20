import { createStore } from "solid-js/store";
import { getParadoxStep, submitParadoxSolution, performInteraction } from "./game-actions";
import { gameStore, gameStoreActions } from "./gameStore";
import type { ProfileUser, SubmitSolutionResult } from "~/types/game";

// --- TYPE DEFINITIONS ---

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

export type InteractionLog = {
  type: 'command' | 'outcome';
  text: string;
};

const CONSOLE_WELCOME_MESSAGE: InteractionLog[] = [
  { type: 'outcome', text: 'Kernel v0.0.1 :: PARADOX OS' },
  { type: 'outcome', text: 'Inizializzazione completata. Interagisci con gli elementi evidenziati nell\'ambiente per raccogliere indizi.' }
];

interface ParadoxStore {
  currentStep: ParadoxStep | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  validationDetails: boolean[] | null; 
  isDecrypted: boolean;
  interactionLog: InteractionLog[];
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
      setStore("isDecrypted", false);
      setStore("interactionLog", CONSOLE_WELCOME_MESSAGE);
      setStore("validationDetails", null);
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

  /**
   * Submits the user's proposed solution to the server for validation.
   */
 async submitSolution(solutions: (string | null)[]) {
    if (!store.currentStep || store.isSubmitting) return;
    if (solutions.some(s => s === null)) {
      gameStoreActions.showToast("All slots must be filled.", "error");
      return;
    }
    setStore("isSubmitting", true);
    this.resetValidation();

    // Non è più necessario specificare il tipo qui, perché la funzione lo "promette"
    const result = await submitParadoxSolution(store.currentStep.id, solutions as string[]);
    
    if (result.updatedProfile) {
      gameStoreActions.updateProfile(result.updatedProfile);
    }

    if (result.success) {
      const outcomeMessage = store.currentStep?.outcome_text || "Sequence accepted. Evolving...";
      gameStoreActions.showToast(outcomeMessage, "success");

      const droppedItem = result.droppedItem;
      if (droppedItem) {
        gameStoreActions.showDropModal(droppedItem);;
      }

      setTimeout(() => this.loadCurrentStep(), 2500);
    } else {
      gameStoreActions.showToast(result.error || "Incorrect sequence.", "error");
      if (result.details) {
        setStore("validationDetails", result.details);
      }
    }
    setStore("isSubmitting", false);
  },

  /**
   * Gestisce l'interazione narrativa.
   */
  async handleInteraction(target: string, command: string) {
    if (!store.currentStep) return;

    setStore("interactionLog", prev => [...prev, { type: 'command', text: `${command} ${target}` }]);

    const result = await performInteraction(store.currentStep.id, target, command);
    
    if (result.success) {
      setStore("interactionLog", prev => [...prev, { type: 'outcome', text: result.outcome_text! }]);
      
      if (result.reveals_key) {
        setStore("isDecrypted", true);
        gameStoreActions.showToast("Intuizione Raggiunta. Canale Dati Decriptato.", "success");
      }
    } else {
      gameStoreActions.showToast(result.error || "Interferenza nel segnale.", "error");
    }
  },

  /**
   * Clears the current validation feedback state.
   */
  resetValidation() {
    setStore("validationDetails", null);
  },
};

export { store as paradoxStore, actions as paradoxStoreActions };