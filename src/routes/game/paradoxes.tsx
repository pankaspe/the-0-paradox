import { For, Show, createResource, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { getParadoxSeasons, startParadoxMission } from "~/lib/game-actions";
import { gameStoreActions } from "~/lib/gameStore";
import { Motion } from "solid-motionone";
import { IoPlay } from "solid-icons/io";

type ParadoxSeason = {
  id: number;
  title: string;
  codename: string | null;
  timeline_location: string;
  briefing_text: string;
  background_image: string | null;
  achievement_title: string | null;
};

export default function ParadoxesListPage() {
  const [seasons] = createResource<ParadoxSeason[]>(async () => {
    const result = await getParadoxSeasons();
    return result.data || [];
  });

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
  
  const getImageUrl = (path: string | null) => {
    if (!path) return '';
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${path}`;
  };

  return (
    <div class="w-full max-w-5xl mx-auto p-4 md:p-8">
      <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 class="text-3xl font-bold text-primary tracking-wider mb-2 font-mono">{'>'} DOSSIER PARADOSSI</h1>
        <p class="text-text-main/70 mb-8 font-mono">Seleziona un'anomalia temporale da stabilizzare.</p>
      </Motion.div>

      <Show when={!seasons.loading} fallback={<p class="font-mono">Caricamento dossier...</p>}>
        <div class="flex flex-col gap-8">
          <For each={seasons()}>
            {(season, i) => (
              <Motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i() * 0.1 }}
                class="relative w-full h-72 md:h-64 rounded-lg overflow-hidden border border-border/30 group" // Aumentata altezza su mobile
              >
                {/* 1. Immagine di Sfondo */}
                <div 
                  class="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105"
                  style={{ "background-image": `url(${getImageUrl(season.background_image)})` }}
                />
                
                {/* 2. Overlay più scuro per Leggibilità */}
                <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/40" />

                {/* 3. Contenuto Testuale Ristrutturato */}
                <div class="relative h-full p-6 md:p-8 flex flex-col justify-between text-white">
                  
                  {/* --- Sezione Superiore (Titolo e Timeline) --- */}
                  <div class="flex-shrink-0">
                    <p class="font-mono text-sm text-primary tracking-widest">{season.codename || `PARADOX #${season.id}`}</p>
                    <h2 class="text-3xl md:text-4xl font-bold text-text-title mt-2 font-sans">{season.title}</h2>
                    <p class="text-sm mt-1 font-mono text-secondary">{season.timeline_location}</p>
                  </div>

                  {/* --- Sezione Inferiore (Briefing e Pulsante) --- */}
                  <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    
                    {/* Testo del briefing ora visibile anche su mobile */}
                    <p class="text-xs md:text-sm text-text-main/70 max-w-lg line-clamp-2 font-sans">
                      {season.briefing_text}
                    </p>
                    
                    <button
                      onClick={() => handleStartMission(season.id)}
                      disabled={isStarting() !== null}
                      class="flex-shrink-0 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                      <IoPlay />
                      {isStarting() === season.id ? 'Inizializzando...' : 'Inizia'}
                    </button>
                  </div>
                </div>
              </Motion.div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}