import { For, Show, createResource, createSignal } from "solid-js";
import { A, useNavigate } from "@solidjs/router"; // Importa useNavigate
import { getParadoxSeasons, startParadoxMission } from "~/lib/game-actions"; // Importa la nuova action
import { gameStoreActions } from "~/lib/gameStore"; // Per mostrare eventuali errori
import { Motion } from "solid-motionone";

type ParadoxSeason = {
  id: number;
  title: string;
  codename: string | null;
  timeline_location: string;
  briefing_text: string;
};

export default function ParadoxesListPage() {
  const [seasons] = createResource<ParadoxSeason[]>(async () => {
    const result = await getParadoxSeasons();
    return result.data || [];
  });

  // useNavigate è l'hook di Solid Router per navigare programmaticamente
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = createSignal<number | null>(null); // Memorizza l'ID della season in caricamento

  // La funzione che gestisce il click
  const handleStartMission = async (seasonId: number) => {
    setIsStarting(seasonId);

    const result = await startParadoxMission(seasonId);

    if (result.success) {
      // Se il server ha aggiornato il profilo, navighiamo alla pagina di gioco
      navigate('/game/play');
    } else {
      // Altrimenti, mostriamo un errore all'utente
      gameStoreActions.showToast(result.error || "An unknown error occurred.", "error");
      setIsStarting(null);
    }
  };

  return (
    <div class="w-full max-w-5xl mx-auto p-4 md:p-8 font-mono">
      <h1 class="text-3xl text-primary font-bold tracking-wider mb-2">$ DOSSIER PARADOSSI</h1>
      <p class="text-text-main/70 mb-8">Seleziona un'anomalia temporale da stabilizzare.</p>

      <Show when={!seasons.loading} fallback={<p>Caricamento dossier...</p>}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={seasons()}>
            {(season, i) => (
              <Motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i() * 0.1 }}
                class="border border-border/50 rounded-md p-6 bg-surface/30 flex flex-col justify-between hover:border-primary transition-colors"
              >
                <div>
                  <p class="text-sm text-primary">{season.codename || `PARADOX #${season.id}`}</p>
                  <h2 class="text-2xl font-bold text-text-main mt-2">{season.title}</h2>
                  <p class="text-text-main/60 text-sm mt-4">{season.timeline_location}</p>
                  <p class="text-text-main/80 mt-4 text-sm leading-relaxed line-clamp-3">
                    {season.briefing_text}
                  </p>
                </div>
                
                {/* Il nostro <A> diventa un <button> */}
                <button
                  onClick={() => handleStartMission(season.id)}
                  disabled={isStarting() !== null} // Disabilitato se una qualsiasi missione sta partendo
                  class="mt-6 w-full text-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {isStarting() === season.id ? 'Inizializzando...' : 'Inizia Sincronizzazione'}
                </button>
              </Motion.div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}