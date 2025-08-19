// src/routes/play.tsx

import { For, Show, createMemo, createSignal } from "solid-js";
import { Motion } from "solid-motionone"; // Usando l'import che hai indicato.
import { paradoxStore, paradoxStoreActions } from "~/lib/paradoxStore";
import { gameStore, gameStoreActions } from "~/lib/gameStore";

export default function ParadoxPlayPage() {
  // --- STATE ---
  const [currentSolution, setCurrentSolution] = createSignal<(string | null)[]>([]);
  const [activeTab, setActiveTab] = createSignal<'main' | 'debug'>('main');
  
  // Segnale per controllare la sequenza delle animazioni di comparsa
  const [introFinished, setIntroFinished] = createSignal(false);

  // --- DATA LOADING ---
  gameStoreActions.loadInitialData().then(() => {
    if (gameStore.profile) {
      paradoxStoreActions.loadCurrentStep();
    }
  });

  // --- MEMOS ---
  // Memo per dividere l'enigma in parti di testo e calcolare la lunghezza della soluzione
  const puzzleParts = createMemo(() => {
    const step = paradoxStore.currentStep;
    if (!step) return { parts: [], solutionLength: 0 };
    return {
      parts: step.core_text.split('[_____]'),
      solutionLength: step.solutions.length,
    };
  });

  // Memo per calcolare quali frammenti non sono ancora stati usati
  const availableFragments = createMemo(() => {
    const step = paradoxStore.currentStep;
    if (!step) return [];
    const usedFragmentsInSolution = new Set(currentSolution().filter(s => s !== null));
    return step.fragments.filter(f => !usedFragmentsInSolution.has(f));
  });

  // Memo per dividere il testo introduttivo in parole per l'animazione
  const introWords = createMemo(() => 
    paradoxStore.currentStep?.intro_text.split(' ') ?? []
  );

  // --- EFFECT ---
  // Resetta lo stato locale quando cambia il livello del paradosso
  createMemo(() => {
    if (paradoxStore.currentStep) {
      setIntroFinished(false); // Resetta l'animazione per il nuovo livello
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

  return (
    <div class="w-full max-w-5xl mx-auto p-4 md:p-8 font-mono flex flex-col h-full">
      {/* CSS per l'animazione del cursore lampeggiante del terminale */}
      <style>{`
        .blinking-cursor {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
      
      {/* Navigazione a Tab */}
      <div class="flex items-center border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('main')}
          class={`px-4 py-2 text-sm transition-colors ${activeTab() === 'main' ? 'text-primary border-b-2 border-primary' : 'text-text-main/70 hover:text-text-main'}`}
        >
          PARADOX INTERFACE
        </button>
        <button
          onClick={() => setActiveTab('debug')}
          class={`px-4 py-2 text-sm transition-colors ${activeTab() === 'debug' ? 'text-primary border-b-2 border-primary' : 'text-text-main/70 hover:text-text-main'}`}
        >
          DEBUG CONSOLE
        </button>
      </div>

      {/* Contenuto dei Tab */}
      <div class="flex-grow flex flex-col">
        <Show when={activeTab() === 'main'}>
            <Show when={!paradoxStore.isLoading && paradoxStore.currentStep} fallback={
                <div class="text-text-main/80 text-md text-center p-10">LOADING PARADOX...</div>
            }>
                <div class="flex flex-col items-center justify-between h-full gap-y-8">
                    {/* Sezione Narrativa con animazione parola per parola */}
                    <div class="w-full">
                        <h1 class="text-2xl md:text-3xl text-primary font-bold tracking-wider mb-6">
                            {`ID_${paradoxStore.currentStep!.id}: ${paradoxStore.currentStep!.title}`}
                        </h1>
                        <p class="text-md text-text-main/80 italic mx-auto leading-relaxed">
                          <For each={introWords()}>
                            {(word, i) => (
                              <Motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: i() * 0.08, easing: "ease-in-out" }}
                                onMotionComplete={() => {
                                  if (i() === introWords().length - 1) {
                                    setIntroFinished(true);
                                  }
                                }}
                              >
                                {word + ' '}
                              </Motion.span>
                            )}
                          </For>
                        </p>
                    </div>

                    {/* Area di Gioco che appare solo dopo la fine dell'intro */}
                    <Show when={introFinished()}>
                      <Motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, easing: "ease-out" }}
                        class="w-full"
                      >
                        {/* Enigma con gli slot */}
                        <div class="w-full flex items-center justify-center text-center p-6 min-h-[150px]">
                          <p class="text-md md:text-xl text-text-main leading-relaxed">
                            <For each={puzzleParts().parts}>
                                {(part, i) => (
                                <>
                                    {part}
                                    <Show when={i() < puzzleParts().solutionLength}>
                                    <button
                                        onClick={() => handleSlotTap(i())}
                                        disabled={currentSolution()[i()] === null}
                                        class={`inline-block align-middle text-center min-w-[100px] h-6 mx-2 px-3 border-b transition-all duration-200 ${getSlotClass(i())}`}
                                    >
                                        {currentSolution()[i()] ?? ''}
                                    </button>
                                    </Show>
                                </>
                                )}
                            </For>
                          </p>
                        </div>

                        {/* Area dei frammenti e pulsante di invio */}
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4, easing: "ease-out" }} 
                            class="w-full p-6 bg-surface/50 border border-border rounded-xl"
                        >
                            <h3 class="text-sm text-text-main/60 mb-4 tracking-widest">AVAILABLE FRAGMENTS</h3>
                            <div class="min-h-[100px] flex flex-wrap gap-3 items-center justify-center">
                                <For each={availableFragments()}>
                                    {(fragment, i) => (
                                        <Motion.button
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, delay: i() * 0.06, easing: [0.22, 1, 0.36, 1] }}
                                            onClick={() => handleFragmentTap(fragment)}
                                            class="px-5 py-2 border border-primary/40 rounded-full text-primary hover:bg-primary hover:text-white transition-colors duration-200"
                                        >
                                        {fragment}
                                        </Motion.button>
                                    )}
                                </For>
                            </div>
                            <div class="mt-6 flex justify-center">
                                <button
                                    onClick={handleSubmit}
                                    disabled={paradoxStore.isSubmitting || currentSolution().some(s => s === null)}
                                    class="px-10 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {paradoxStore.isSubmitting ? 'VERIFYING...' : 'SUBMIT SEQUENCE'}
                                </button>
                            </div>
                        </Motion.div>
                      </Motion.div>
                    </Show>
                </div>
            </Show>
        </Show>

        {/* Tab "Debug" con stile terminale criptico */}
        <Show when={activeTab() === 'debug'}>
           <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, easing: "ease-in" }}
            class="p-6 bg-black border border-green-500/30 rounded-md text-green-400"
          >
              <div class="flex items-center gap-2">
                <span class="text-green-600">[root@paradox ~]#</span>
                <span>access_hint --id {paradoxStore.currentStep?.id}</span>
              </div>
              <div class="mt-4 whitespace-pre-wrap">
                <p>ACCESSING HINT NODE...</p>
                <p>DECRYPTING PAYLOAD...</p>
                <p class="text-green-300">SUCCESS.</p>
                <br/>
                <Show when={paradoxStore.currentStep?.hint} fallback={
                  <p class="italic text-green-500/60">&gt; // Anomaly signature weak. No valid hint data stream found.</p>
                }>
                  <p class="text-md italic text-green-300">
                      &gt; {paradoxStore.currentStep!.hint}
                  </p>
                </Show>
                <div class="mt-4">
                  <span class="text-green-600">[root@paradox ~]#</span>
                  <span class="inline-block w-2 h-5 bg-green-400 translate-y-1 ml-1 blinking-cursor" />
                </div>
              </div>
          </Motion.div>
        </Show>
      </div>
    </div>
  );
}