import { type Component } from "solid-js";
import { Motion } from "solid-motionone";
import { paradoxStoreActions } from "~/lib/paradoxStore";

interface Props {
  text: string;
}

export const OutcomeModal: Component<Props> = (props) => {
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[90] p-4"
    >
      <Motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, easing: [0.16, 1, 0.3, 1] }}
        class="w-full max-w-xl bg-surface border border-border/50 rounded-lg p-8 text-center shadow-lg flex flex-col items-center font-mono"
      >
        <p class="text-sm text-primary tracking-widest">[ STABILIZZAZIONE COMPLETATA ]</p>
        
        <p 
          class="my-6 text-lg text-text-main/90 leading-relaxed"
          innerHTML={props.text}
        />

        <button 
          onClick={() => paradoxStoreActions.proceedToNextStep()}
          class="mt-4 px-8 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold tracking-wider"
        >
          [ PROCEDI ]
        </button>
      </Motion.div>
    </Motion.div>
  );
};