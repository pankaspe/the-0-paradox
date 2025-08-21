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
  { type: 'outcome', text: 'Inizializzazione completata. Interagisci con gli elementi evidenziati nell\'ambiente per raccogliere indizi.' },
  { type: 'outcome', text: '-----------' }

];

interface ParadoxStore {
  currentStep: ParadoxStep | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  validationDetails: boolean[] | null; 
  isDecrypted: boolean;
  interactionLog: InteractionLog[];
  successfulOutcomeText: string | null;
  isSeasonCompleted: boolean;
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
  successfulOutcomeText: null,
  isSeasonCompleted: false
});

// --- STORE ACTIONS ---
const actions = {
  async loadCurrentStep() {
    if (!gameStore.profile) {
      setStore("error", "User profile not loaded. Cannot fetch step.");
      setStore("isLoading", false);
      return;
    }
    setStore("isLoading", true);
    setStore("currentStep", null);
    setStore("isSeasonCompleted", false);
    
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
      // --- MODIFICA CHIAVE QUI ---
      // Controlliamo se l'errore è quello che ci aspettiamo
      if (result.error?.includes('PGRST116')) {
        // Questo non è un errore, ma la fine della stagione!
        setStore("isSeasonCompleted", true);
        setStore("error", null);
      } else {
        // Questo è un vero errore
        setStore("error", result.error || "Failed to load paradox step.");
      }
    }
    setStore("isLoading", false);
  },
  
  async submitSolution(solutions: (string | null)[]) {
    if (!store.currentStep || store.isSubmitting) return;
    if (solutions.some(s => s === null)) {
      gameStoreActions.showToast("All slots must be filled.", "error");
      return;
    }
    setStore("isSubmitting", true);
    this.resetValidation();

    const result = await submitParadoxSolution(store.currentStep!.id, solutions as string[]);
    
    if (result.updatedProfile) {
      gameStoreActions.updateProfile(result.updatedProfile);
    }

    if (result.success) {
      const droppedItem = result.droppedItem;
      const achievement = result.achievementUnlocked;
      if (achievement) {
        setTimeout(() => {
          gameStoreActions.showToast(`🏆 Titolo Sbloccato: [${achievement.title}]!`, "success");
        }, droppedItem ? 1500 : 500); // Ritardo maggiore se c'è un drop
      }

      if (droppedItem) {
        gameStoreActions.showDropModal(droppedItem);
      }
      
      const outcomeMessage = store.currentStep?.outcome_text || "Sequenza stabilizzata. Evoluzione in corso...";
      setStore("successfulOutcomeText", outcomeMessage);

      // --- MODIFICA CHIAVE QUI ---
      // RIMOSSO: setTimeout(() => this.loadCurrentStep(), 2500);
      // Ora non succede nulla finché l'utente non preme "Procedi".

    } else {
      gameStoreActions.showToast(result.error || "Incorrect sequence.", "error");
      if (result.details) {
        setStore("validationDetails", result.details);
      }
    }
    setStore("isSubmitting", false);
  },

  /**
   * Nasconde il modal di outcome e carica il prossimo livello.
   */
  proceedToNextStep() {
    setStore("successfulOutcomeText", null);
    this.loadCurrentStep();
  },

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
  
  resetValidation() {
    setStore("validationDetails", null);
  },
};

export { store as paradoxStore, actions as paradoxStoreActions };