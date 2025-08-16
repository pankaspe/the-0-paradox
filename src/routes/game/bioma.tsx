import { For, Show, createSignal } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import Loader from "~/components/ui/Loader";
import NarrativeLoader from "~/components/game/bioma/NarrativeLoader";
import loadingPhrases from "~/data/loading_phrases.json";

// Interfaccia e componente ChoiceButton (invariati)
interface ChoiceButtonProps { text: string; onClick: () => void; disabled: boolean; delay: number; }
function ChoiceButton(props: ChoiceButtonProps) {
  return (
    <Motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: props.delay }}
      onClick={props.onClick}
      disabled={props.disabled}
      class="w-full max-w-lg p-4 text-left text-lg text-ghost/90 hover:text-starlight
             bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg 
             transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
    >
      {props.text}
    </Motion.button>
  );
}

// Pagina principale (snellita)
export default function BiomaPage() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [feedback, setFeedback] = createSignal<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = createSignal("");

  const handleChoice = async (choiceId: string) => {
    if (isProcessing()) return;
    setIsProcessing(true);

    const randomIndex = Math.floor(Math.random() * loadingPhrases.length);
    setLoadingPhrase(loadingPhrases[randomIndex]);
    
    setIsProcessing(true);


    const result = await gameStoreActions.processChoice(choiceId);


    if (result.success) {
      setFeedback(result.feedback);
    } else {
      // Se c'è un errore, dobbiamo uscire dallo stato di caricamento
      setIsProcessing(false);
    }
  };
  
  const handleContinue = () => {
    setFeedback(null);
    setIsProcessing(false); 
  };

  return (
    <div class="relative w-full h-full flex items-center justify-center p-4 md:p-8">
      <div class="absolute inset-0 bg-gradient-to-br from-abyss to-black/80 z-0" />
      
      <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
        <Show when={gameStore.profile && gameStore.currentEvent} fallback={
          <p class="text-red-400 z-10">{gameStore.error || "Impossibile caricare lo stato del gioco."}</p>
        }>
          <div class="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-12">
            <Presence exitBeforeEnter>
              <Show when={feedback() === null}>
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7, easing: "ease-in-out" }}
                  class="w-full flex flex-col items-center space-y-8"
                >
                  <p class="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-ghost max-w-3xl">
                    {gameStore.currentEvent!.narrative}
                  </p>
                  <div class="w-full flex flex-col items-center space-y-4 pt-8 min-h-[200px]">
                    <Show when={!isProcessing()} 
                      fallback={<NarrativeLoader phrase={loadingPhrase()} />}
                    >
                      <For each={gameStore.currentEvent!.choices}>
                        {(choice, i) => (
                          <ChoiceButton
                            text={choice.text}
                            onClick={() => handleChoice(choice.id)}
                            disabled={isProcessing()} // Sarà sempre false qui, ma lo teniamo per sicurezza
                            delay={0.2 * (i() + 1)}
                          />
                        )}
                      </For>
                    </Show>
                  </div>
                </Motion.div>
              </Show>
              <Show when={feedback() !== null}>
                 <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7, easing: "ease-in-out" }}
                  class="w-full flex flex-col items-center space-y-8"
                >
                   <p class="text-xl md:text-2xl font-light italic text-ghost/80 max-w-3xl">
                    {feedback()}
                   </p>
                   <Motion.button
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ duration: 0.5, delay: 0.5 }}
                     onClick={handleContinue}
                     class="mt-8 px-8 py-3 bg-biolume/80 hover:bg-biolume text-abyss font-bold rounded-full text-lg transition-colors"
                   >
                     Continua...
                   </Motion.button>
                 </Motion.div>
              </Show>
            </Presence>
          </div>
        </Show>
      </Show>
    </div>
  );
}