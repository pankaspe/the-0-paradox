import { For, Show, createMemo, createSignal, createEffect } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { paradoxStore, paradoxStoreActions } from "~/lib/paradoxStore";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { OutcomeModal } from "~/components/ui/OutcomeModal";
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
  
  // --- MEMOS & EFFECTS (invariati) ---
  const encryptedText = createMemo(() => { const step = paradoxStore.currentStep as any; return step?.encryption_data?.encrypted_text || "##### ERROR #####"; });
  const puzzleParts = createMemo(() => { const step = paradoxStore.currentStep; if (!step) return { parts: [], solutionLength: 0 }; return { parts: step.core_text.split('[_____]'), solutionLength: step.solutions.length }; });
  const availableFragments = createMemo(() => {
    if (!paradoxStore.isDecrypted) return [];
    const step = paradoxStore.currentStep;
    if (!step) return [];

    // 1. Contiamo quante volte ogni frammento appare nella soluzione attuale.
    const usedCounts = new Map<string, number>();
    for (const sol of currentSolution()) {
      if (sol !== null) {
        usedCounts.set(sol, (usedCounts.get(sol) || 0) + 1);
      }
    }

    // 2. Contiamo quante volte ogni frammento appare nel pool originale.
    const totalCounts = new Map<string, number>();
    for (const frag of step.fragments) {
      totalCounts.set(frag, (totalCounts.get(frag) || 0) + 1);
    }
    
    // 3. Un frammento è "disponibile" se il numero di volte che l'abbiamo usato
    //    è MINORE del numero totale di volte che è presente nel pool originale.
    return step.fragments.filter(f => (usedCounts.get(f) || 0) < (totalCounts.get(f) || 0));
  });
  const isSolutionComplete = createMemo(() => currentSolution().length > 0 && currentSolution().every(slot => slot !== null));
  createEffect(() => { if (paradoxStore.currentStep) { const len = paradoxStore.currentStep.solutions.length; setCurrentSolution(Array(len).fill(null)); paradoxStoreActions.resetValidation(); } });
  
  // --- HANDLERS (invariati) ---
  const handleFragmentTap = (fragment: string) => { if (paradoxStore.validationDetails) paradoxStoreActions.resetValidation(); const idx = currentSolution().indexOf(null); if (idx !== -1) { const newSol = [...currentSolution()]; newSol[idx] = fragment; setCurrentSolution(newSol); } };
  const handleSlotTap = (index: number) => { if (paradoxStore.validationDetails) paradoxStoreActions.resetValidation(); const newSol = [...currentSolution()]; newSol[index] = null; setCurrentSolution(newSol); };
  const handleSubmit = () => { paradoxStoreActions.submitSolution(currentSolution()); };
  const getSlotClass = (index: number) => { const d = paradoxStore.validationDetails; if (!d) return currentSolution()[index] ? 'border-primary text-primary bg-primary/10' : 'border-border border-dashed text-text-main/50'; return d[index] ? 'border-success text-success bg-success/10 animate-pulse' : 'border-error text-error bg-error/10'; };

  // --- RENDER ---
  return (
    <>
      {/* CSS per scrollbar personalizzata e fade effect */}
      <style>{`
        .scrollable-narrative {
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
        }
        .scrollable-narrative::-webkit-scrollbar { width: 8px; }
        .scrollable-narrative::-webkit-scrollbar-track { background: transparent; }
        .scrollable-narrative::-webkit-scrollbar-thumb { background-color: var(--color-border); border-radius: 4px; }
        .scrollable-narrative::-webkit-scrollbar-thumb:hover { background-color: var(--color-primary); }
      `}</style>
      
      <div class="w-full max-w-5xl mx-auto flex flex-col h-full relative">
        <Show when={!paradoxStore.isLoading && paradoxStore.currentStep} fallback={ <div class="text-text-main/80 text-md text-center p-10">LOADING PARADOX...</div> }>
          
          {/* === NUOVA STRUTTURA DI LAYOUT A 3 PARTI === */}
          <div class="flex flex-col h-full p-4 md:p-8">

            {/* 1. Area Superiore Scrollabile (solo narrazione) */}
            <div class="flex-grow overflow-y-auto scrollable-narrative pr-4">
              <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <div class="p-6">
                  <h1 class="text-2xl md:text-3xl text-secondary font-bold tracking-wider mb-6">{`> ${paradoxStore.currentStep!.title}`}</h1>
                  <InteractiveNarrative 
                    text={paradoxStore.currentStep!.intro_text}
                    elements={(paradoxStore.currentStep as any).interactive_elements || []}
                  />
                </div>
              </Motion.div>
            </div>

            {/* 2. Area Centrale Fissa (enigma) */}
            <div class="flex-shrink-0 py-6">
              <Motion.div 
                class="w-full text-center p-6 min-h-[100px] border-y border-border/50 bg-surface/20 transition-all duration-700"
                initial={{ filter: "blur(8px)", opacity: 0.5 }}
                animate={{ 
                  filter: paradoxStore.isDecrypted ? "blur(0px)" : "blur(8px)",
                  opacity: paradoxStore.isDecrypted ? 1 : 0.5
                }}
              >
                <Show when={paradoxStore.isDecrypted} fallback={ <p class="text-xl md:text-2xl text-text-main/50 tracking-widest select-none">{encryptedText()}</p> }>
                  <p class="text-sm md:text-md text-text-main leading-relaxed">
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
              </Motion.div>
            </div>

            {/* 3. Area Inferiore Fissa (console/tabs) */}
            <div class="flex-shrink-0">
              <div class="border border-border/30 rounded-lg backdrop-blur-sm bg-surface/50">
                <div class="flex items-center border-b border-border/50">
                  <button onClick={() => setActiveTab('console')} class={`px-4 py-2 text-xs md:text-sm font-bold tracking-wider transition-colors border-b-2 ${activeTab() === 'console' ? 'border-primary text-primary' : 'border-transparent text-text-main/70 hover:bg-white/5'}`}>CONSOLE</button>
                  <button onClick={() => setActiveTab('fragments')} class={`px-4 py-2 text-xs md:text-sm font-bold tracking-wider transition-colors border-b-2 ${activeTab() === 'fragments' ? 'border-primary text-primary' : 'border-transparent text-text-main/70 hover:bg-white/5'}`} disabled={!paradoxStore.isDecrypted}>FRAMMENTI</button>
                  <button class="px-4 py-2 text-xs md:text-sm font-bold tracking-wider border-b-2 border-transparent text-text-main/40 cursor-not-allowed" disabled>SKILLS</button>
                </div>
                <div class="p-2 md:p-4">
                  <div classList={{ hidden: activeTab() !== 'console' }}><InvestigationConsole log={paradoxStore.interactionLog} /></div>
                  <div classList={{ hidden: activeTab() !== 'fragments' }}>
                    <div class="w-full min-h-[150px]">
                      <Show when={paradoxStore.isDecrypted} fallback={<p class="text-center text-text-main/50 pt-10">Nessun frammento disponibile.</p>}>
                        <div class="min-h-[100px] flex flex-wrap gap-3 items-center justify-center">
                          <For each={availableFragments()}>
                            {(fragment, i) => (
                              <Motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i() * 0.05 }} onClick={() => handleFragmentTap(fragment)} class="px-5 py-2 border border-primary/40 text-primary hover:bg-primary hover:text-white transition-colors duration-200 text-xs md:text-md">
                                {fragment}
                              </Motion.button>
                            )}
                          </For>
                        </div>
                        <Show when={isSolutionComplete()}>
                          <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} class="mt-8 flex justify-center">
                            <button onClick={handleSubmit} disabled={paradoxStore.isSubmitting} class="px-10 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
                              {paradoxStore.isSubmitting ? 'VERIFYING...' : 'SUBMIT SEQUENCE'}
                            </button>
                          </Motion.div>
                        </Show>
                      </Show>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>

        <Presence>
          <Show when={paradoxStore.successfulOutcomeText}>
            <OutcomeModal text={paradoxStore.successfulOutcomeText!} />
          </Show>
        </Presence>
      </div>
    </>
  );
}