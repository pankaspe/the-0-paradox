import { For, Show, createMemo, createSignal, createEffect } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { paradoxStore, paradoxStoreActions } from "~/lib/paradoxStore";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { OutcomeModal } from "~/components/ui/OutcomeModal";

// Importiamo i nostri componenti
import { InteractiveNarrative } from "~/components/game/paradox/InteractiveNarrative";
import { InvestigationConsole } from "~/components/game/paradox/InvestigationConsole";

export default function ParadoxPlayPage() {
  const [currentSolution, setCurrentSolution] = createSignal<(string | null)[]>([]);
  const [activeTab, setActiveTab] = createSignal<'console' | 'fragments'>('console');

  // --- DATA LOADING ---
  gameStoreActions.loadInitialData().then(() => {
    if (gameStore.profile) {
      paradoxStoreActions.loadCurrentStep();
    }
  });
  
  // --- MEMOS & EFFECTS ---
  const encryptedText = createMemo(() => {
    const step = paradoxStore.currentStep as any;
    return step?.encryption_data?.encrypted_text || "##### ###### ERROR ###### #####";
  });

  const puzzleParts = createMemo(() => {
    const step = paradoxStore.currentStep;
    if (!step) return { parts: [], solutionLength: 0 };
    return {
      parts: step.core_text.split('[_____]'),
      solutionLength: step.solutions.length,
    };
  });

  const availableFragments = createMemo(() => {
    if (!paradoxStore.isDecrypted) return [];
    const step = paradoxStore.currentStep;
    if (!step) return [];
    const usedFragments = new Set(currentSolution().filter(s => s !== null));
    return step.fragments.filter(f => !usedFragments.has(f));
  });

  const isSolutionComplete = createMemo(() => {
    return currentSolution().length > 0 && currentSolution().every(slot => slot !== null);
  });

  createEffect(() => {
    if (paradoxStore.currentStep) {
      const solutionLength = paradoxStore.currentStep.solutions.length;
      setCurrentSolution(Array(solutionLength).fill(null));
      paradoxStoreActions.resetValidation(); 
    }
  });
  
  // --- HANDLERS ---
  const handleFragmentTap = (fragment: string) => {
    if (paradoxStore.validationDetails) paradoxStoreActions.resetValidation();
    const firstEmptyIndex = currentSolution().indexOf(null);
    if (firstEmptyIndex !== -1) {
      const newSolution = [...currentSolution()];
      newSolution[firstEmptyIndex] = fragment;
      setCurrentSolution(newSolution);
    }
  };

  const handleSlotTap = (index: number) => {
    if (paradoxStore.validationDetails) paradoxStoreActions.resetValidation();
    const newSolution = [...currentSolution()];
    newSolution[index] = null;
    setCurrentSolution(newSolution);
  };

  const handleSubmit = () => {
    paradoxStoreActions.submitSolution(currentSolution());
  };
  
  const getSlotClass = (index: number) => {
    const details = paradoxStore.validationDetails;
    if (!details) {
        return currentSolution()[index] 
            ? 'border-primary text-primary bg-primary/10' 
            : 'border-border border-dashed text-text-main/50';
    }
    return details[index]
      ? 'border-success text-success bg-success/10 animate-pulse'
      : 'border-error text-error bg-error/10';
  };

  // --- RENDER ---
  return (
    <div class="w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col h-full">
      
      <Show when={!paradoxStore.isLoading && paradoxStore.currentStep} fallback={ <div class="text-text-main/80 text-md text-center p-10">LOADING PARADOX...</div> }>
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0 }} class="flex-grow flex flex-col gap-8">
            
          {/* SEZIONE 1: Narrazione e Titolo */}
          <div class="bg-surface/50 backdrop-blur-sm border border-border/30 p-6 rounded-lg">
            <h1 class="text-2xl md:text-3xl text-primary font-bold tracking-wider mb-6">{`> ${paradoxStore.currentStep!.title}`}</h1>
            <InteractiveNarrative 
              text={paradoxStore.currentStep!.intro_text}
              elements={(paradoxStore.currentStep as any).interactive_elements || []}
            />
          </div>

          {/* SEZIONE 2: Enigma Centrale */}
          <div class="w-full text-center p-6 min-h-[100px] border-y border-border/50 bg-surface/20">
            <Show when={paradoxStore.isDecrypted} fallback={
              <p class="text-xl md:text-2xl text-text-main/50 tracking-widest blur-sm select-none">{encryptedText()}</p>
            }>
              <p class="text-md md:text-xl text-text-main leading-relaxed">
                <For each={puzzleParts().parts}>
                  {(part, i) => (
                    <>
                      {part}
                      <Show when={i() < puzzleParts().solutionLength}>
                        <button onClick={() => handleSlotTap(i())} disabled={currentSolution()[i()] === null} class={`inline-block align-middle text-center min-w-[100px] h-6 mx-2 px-3 border-b transition-all duration-200 ${getSlotClass(i())}`}>
                          {currentSolution()[i()] ?? ''}
                        </button>
                      </Show>
                    </>
                  )}
                </For>
              </p>
            </Show>
          </div>
          
          {/* SEZIONE 3: Tabs e Interazione */}
          {/* === MODIFICA CHIAVE QUI === */}
          {/* Rimosso bg-surface/50 e aggiunto backdrop-blur-sm per un effetto vetro */}
          <div class="flex-grow border border-border/30 rounded-lg p-1 backdrop-blur-sm bg-surface/50">
            <div class="flex items-center border-b border-border/50">
              <button 
                onClick={() => setActiveTab('console')} 
                class={`px-4 py-2 text-sm font-bold tracking-wider transition-colors border-b-2 ${activeTab() === 'console' ? 'border-primary text-primary' : 'border-transparent text-text-main/70 hover:bg-white/5'}`}
              >
                CONSOLE
              </button>
              <button 
                onClick={() => setActiveTab('fragments')} 
                class={`px-4 py-2 text-sm font-bold tracking-wider transition-colors border-b-2 ${activeTab() === 'fragments' ? 'border-primary text-primary' : 'border-transparent text-text-main/70 hover:bg-white/5'}`} 
                disabled={!paradoxStore.isDecrypted}
              >
                FRAMMENTI
              </button>
              <button 
                class="px-4 py-2 text-sm font-bold tracking-wider border-b-2 border-transparent text-text-main/40 cursor-not-allowed"
                disabled
              >
                SKILLS
              </button>
            </div>

            <div class="p-2 md:p-4">
              <div classList={{ hidden: activeTab() !== 'console' }}>
                <InvestigationConsole log={paradoxStore.interactionLog} />
              </div>

              <div classList={{ hidden: activeTab() !== 'fragments' }}>
                <div class="w-full min-h-[150px]">
                  <Show when={paradoxStore.isDecrypted} fallback={
                    <p class="text-center text-text-main/50 pt-10">Nessun frammento disponibile. La sequenza è ancora criptata.</p>
                  }>
                    <div class="min-h-[100px] flex flex-wrap gap-3 items-center justify-center">
                      <For each={availableFragments()}>
                          {(fragment, i) => (
                              <Motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i() * 0.05 }} onClick={() => handleFragmentTap(fragment)} class="px-5 py-2 border border-primary/40 text-primary hover:bg-primary hover:text-white transition-colors duration-200">
                                {fragment}
                              </Motion.button>
                          )}
                      </For>
                    </div>

                    <Show when={isSolutionComplete()}>
                      <Motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition= {{ delay: 0.2 }}
                        class="mt-8 flex justify-center"
                      >
                        <button 
                          onClick={handleSubmit} 
                          disabled={paradoxStore.isSubmitting} 
                          class="px-10 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {paradoxStore.isSubmitting ? 'VERIFYING...' : 'SUBMIT SEQUENCE'}
                        </button>
                      </Motion.div>
                    </Show>
                    
                  </Show>
                </div>
              </div>
            </div>
          </div>

        </Motion.div>
      </Show>

      {/* ================================================================= */}
      {/* >>> NUOVO: Renderizziamo il modal dell'outcome qui <<< */}
      {/* ================================================================= */}
      <Presence>
        <Show when={paradoxStore.successfulOutcomeText}>
          <OutcomeModal text={paradoxStore.successfulOutcomeText!} />
        </Show>
      </Presence>
    </div>
  );
}