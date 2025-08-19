// src/components/AnomalySolver.tsx

import { createSignal, Show } from "solid-js";
import { Motion } from "solid-motionone";
import { gameStoreActions } from "~/lib/gameStore";
import { paradoxStore, paradoxStoreActions, type Anomaly } from "~/lib/paradoxStore";

/**
 * AnomalySolver Component
 * Renders the UI for a detected anomaly event and handles its resolution logic.
 */
export function AnomalySolver(props: { anomaly: Anomaly }) {
  // Local state to hold user input for the challenge.
  const [userInput, setUserInput] = createSignal("");

  /**
   * Handles the submission of the anomaly solution.
   * Logic is branched based on the `resolution_type` of the anomaly.
   */
  const handleSolve = () => {
    // Logic for sequence-based anomalies.
    if (props.anomaly.resolution_type === 'SEQUENCE') {
      if (userInput().toLowerCase() === props.anomaly.config.solution.toLowerCase()) {
        paradoxStoreActions.resolveAnomaly();
      } else {
        gameStoreActions.showToast("Incorrect override sequence.", "error");
        // Optional: Add a small focus penalty for failing the anomaly.
      }
    }
    
    // Future logic for other anomaly types can be added here.
    // else if (props.anomaly.resolution_type === 'DECODE') { ... }
  };

  /**
   * Handles key presses in the input field.
   * Specifically, triggers the solve action when "Enter" is pressed.
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSolve();
    }
  };

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      {/* Renders the UI for a SEQUENCE type anomaly */}
      <Show when={props.anomaly.resolution_type === 'SEQUENCE'}>
        <div class="flex flex-col items-center gap-4">
          <label for="anomaly-input" class="text-text-main/70">
            {props.anomaly.config.prompt}
          </label>
          <input 
            id="anomaly-input"
            type="text" 
            value={userInput()} 
            onInput={(e) => setUserInput(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            class="font-mono bg-background text-primary w-full max-w-xs p-2 rounded border border-border text-center tracking-widest"
            autofocus
          />
          <button 
            onClick={handleSolve} 
            class="mt-4 px-8 py-2 bg-error hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
          >
            EXECUTE
          </button>
        </div>
      </Show>

      {/* Placeholder for other resolution types */}
      <Show when={props.anomaly.resolution_type !== 'SEQUENCE'}>
        <p class="text-text-main/50">Anomaly type '{props.anomaly.resolution_type}' not yet implemented.</p>
      </Show>
    </Motion.div>
  );
}