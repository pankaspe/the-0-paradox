import { createSignal, Show } from "solid-js";
import { Motion } from "solid-motionone";
import { initializeProfile } from "~/lib/game-actions";
import { gameStoreActions } from "~/lib/gameStore";
import { IoChevronForward } from "solid-icons/io";

// Il tuo tutorial.json andrà qui. Per ora, lo scrivo direttamente nel codice.
const tutorialContent = [
  {
    title: "Benvenuto in The 0 Paradox (Alpha)",
    text: "Sei stato selezionato per partecipare alla fase di test alpha del Paradox OS. Il tuo ruolo è quello di Operatore. Il tuo compito: viaggiare attraverso anomalie temporali per stabilizzare la realtà. Grazie per il tuo contributo nel plasmare questa esperienza."
  },
  {
    title: "Il Kernel & i Paradossi",
    text: "Il sistema che stai usando, il Kernel, monitora costantemente la timeline. Quando rileva un'incoerenza - un Paradosso - crea un dossier e ti invia a risolverlo. Ogni stagione è un Paradosso, una storia da ricomporre un enigma alla volta."
  },
  {
    title: "Il Ruolo dell'AI",
    text: "Alcuni paradossi sono così complessi che il Kernel stesso, assistito da un'intelligenza avanzata (Gemini), genera scenari e sfide per testare i suoi Operatori. Preparati ad affrontare l'inaspettato. Le tue azioni contribuiscono a un database collettivo che allena il sistema."
  },
  {
    title: "Parametri Entità (Statistiche)",
    text: "Durante le tue missioni, accumulerai esperienza in quattro aree chiave: Resilience, Acumen, Curiosity e Concentration. In questa fase alpha, questi parametri crescono, ma le loro funzionalità avanzate (sbloccare indizi unici, ridurre le penalità) verranno implementate nelle prossime versioni."
  },
  {
    title: "Registrazione Operatore",
    text: "Per completare la tua iniziazione, inserisci il tuo ID Operatore. Questo identificativo sarà unico nel sistema e ti rappresenterà in tutte le future operazioni."
  }
];

export function OnboardingTutorial() {
  const [step, setStep] = createSignal(0);
  const [username, setUsername] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  const currentContent = () => tutorialContent[step()];
  const isFinalStep = () => step() === tutorialContent.length - 1;

  const handleNext = () => {
    if (!isFinalStep()) {
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const result = await initializeProfile(username());
    if (result.success && result.profile) {
      // Successo! Aggiorniamo lo store globale con il profilo completo.
      gameStoreActions.updateProfile(result.profile);
    } else {
      setError(result.error || "Si è verificato un errore.");
    }
    setIsLoading(false);
  };

  return (
    <div class="fixed inset-0 bg-page z-[200] flex items-center justify-center p-4">
      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        class="w-full max-w-2xl bg-surface/80 backdrop-blur-lg border border-border/50 rounded-lg p-8 text-center font-mono flex flex-col"
      >
        <h1 class="text-2xl md:text-3xl font-bold text-primary tracking-wider">{currentContent().title}</h1>
        <p class="text-text-main/80 mt-6 leading-relaxed flex-grow">{currentContent().text}</p>
        
        <div class="mt-8">
          <Show when={isFinalStep()}>
            <form onSubmit={handleSubmit} class="flex flex-col items-center gap-4">
              <input 
                type="text"
                value={username()}
                onInput={e => setUsername(e.currentTarget.value)}
                class="w-full max-w-xs bg-surface-hover border-2 border-border rounded-md p-2 text-text-main text-center font-mono focus:border-primary focus:ring-primary/50"
                placeholder="Inserisci ID Operatore..."
              />
              <Show when={error()}><p class="text-error text-sm">{error()}</p></Show>
              <button 
                type="submit"
                disabled={isLoading() || username().length < 3}
                class="w-full max-w-xs py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading() ? "Registrazione..." : "Completa Iniziazione"}
              </button>
            </form>
          </Show>
          <Show when={!isFinalStep()}>
            <button 
              onClick={handleNext}
              class="px-8 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Avanti <IoChevronForward />
            </button>
          </Show>
        </div>
      </Motion.div>
    </div>
  );
}