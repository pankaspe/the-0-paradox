import { For, Show, createResource, createSignal, createMemo } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { getParadoxSeasons, startParadoxMission, getCurrentMissionInfo } from "~/lib/game-actions";
import { gameStoreActions } from "~/lib/gameStore";
import { Motion } from "solid-motionone";
import { IoPlay, IoPlayForward } from "solid-icons/io";

// Tipi più precisi per i nostri dati
type ParadoxSeason = {
  id: number;
  title: string;
  codename: string | null;
  timeline_location: string;
  briefing_text: string;
  background_image: string | null;
};

type SeasonsData = {
  seasons: ParadoxSeason[];
  current_step_id: number;
};

type MissionInfo = {
  seasonTitle: string;
  seasonId: number;
  currentStepTitle: string;
  currentStepNumber: number;
  totalStepsInSeason: number | null;
};

export default function ParadoxesListPage() {
  const [seasonsData] = createResource<SeasonsData>(async () => {
    const result = await getParadoxSeasons();
    return result.data || { seasons: [], current_step_id: 1 };
  });

  const [missionInfo] = createResource<MissionInfo | null>(getCurrentMissionInfo);

  const navigate = useNavigate();
  const [isStarting, setIsStarting] = createSignal<number | null>(null);

  const handleStartMission = async (seasonId: number) => {
    setIsStarting(seasonId);
    const result = await startParadoxMission(seasonId);
    if (result.success) {
      navigate('/game/play');
    } else {
      gameStoreActions.showToast(result.error || "An unknown error occurred.", "error");
      setIsStarting(null);
    }
  };
  
  const getImageUrl = (path: string | null) => path ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${path}` : '';
  
  // Memo per sapere qual è l'ID della stagione in corso
  const currentSeasonId = createMemo(() => missionInfo()?.seasonId);

  return (
    <div class="w-full max-w-5xl mx-auto p-4 md:p-8">
      <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 class="text-3xl font-bold text-primary tracking-wider mb-2 font-mono">{'>'} DOSSIER PARADOSSI</h1>
        <p class="text-text-main/70 mb-8 font-mono">Seleziona un'anomalia temporale da stabilizzare.</p>
      </Motion.div>

      <Show when={!seasonsData.loading && !missionInfo.loading} fallback={<p class="font-mono">Caricamento dossier...</p>}>
        <div class="flex flex-col gap-8">
          <For each={seasonsData()?.seasons}>
            {(season, i) => {
              // La logica ora confronta gli ID, che è più robusto dei titoli
              const isCurrentMission = createMemo(() => currentSeasonId() === season.id);
              
              return (
                <Motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i() * 0.1 }}
                  class="relative w-full h-72 md:h-64 rounded-lg overflow-hidden border border-border/30 group"
                >
                  <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105" style={{ "background-image": `url(${getImageUrl(season.background_image)})` }} />
                  <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/40" />
                  
                  <div class="relative h-full p-6 md:p-8 flex flex-col justify-between text-white">
                    <div class="flex-shrink-0">
                      <p class="font-mono text-sm text-primary tracking-widest">{season.codename || `PARADOX #${season.id}`}</p>
                      <h2 class="text-3xl md:text-4xl font-bold text-text-title mt-2 font-sans">{season.title}</h2>
                      <p class="text-sm mt-1 font-mono text-secondary">{season.timeline_location}</p>
                    </div>

                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <p class="text-xs md:text-sm text-text-main/70 max-w-lg line-clamp-2 font-sans">{season.briefing_text}</p>
                      
                      <Show 
                        when={isCurrentMission()}
                        fallback={
                          <button onClick={() => handleStartMission(season.id)} disabled={isStarting() !== null} class="flex-shrink-0 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait">
                            <IoPlay />
                            {isStarting() === season.id ? 'Inizializzando...' : 'Inizia'}
                          </button>
                        }
                      >
                        <A href="/game/play" class="flex-shrink-0 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary-hover text-white font-bold rounded-lg transition-colors">
                          <IoPlayForward />
                          Continua Missione
                        </A>
                      </Show>
                    </div>
                  </div>
                </Motion.div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}