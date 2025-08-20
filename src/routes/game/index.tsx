import { For, Show, createResource } from "solid-js";
import { A } from "@solidjs/router";
import { Motion } from "solid-motionone";
import { gameStore } from "~/lib/gameStore";
import { getCurrentMissionInfo } from "~/lib/game-actions";
import { Image } from "@unpic/solid";
import { IoFlashOutline, IoShieldOutline, IoDiscOutline, IoSearchOutline, IoEyeOutline, IoPlayForward } from "solid-icons/io";

export default function DashboardPage() {
  const profile = () => gameStore.profile;

  // Usiamo createResource per caricare i dati della missione in modo asincrono
  const [missionInfo] = createResource(getCurrentMissionInfo);

  const progressPercentage = () => {
    const info = missionInfo();
    if (!info || !info.totalStepsInSeason) return 0;
    // Calcoliamo la percentuale di completamento della stagione
    return (info.currentStepNumber / info.totalStepsInSeason) * 100;
  };

  return (
    <div class="w-full max-w-5xl mx-auto p-4 md:p-8">
      <Show when={profile()} keyed>
        {p => (
          <div class="flex flex-col gap-8">
            {/* INTESTAZIONE */}
            <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 class="text-3xl font-bold text-text-main">
                <span class="text-primary">$</span> Benvenuto, Operatore <span class="text-primary">{p.username}</span>
              </h1>
              <p class="text-text-main/70 mt-1">Stato del Sistema: Nominale. In attesa di direttive.</p>
            </Motion.div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* PANNELLO MISSIONE CORRENTE */}
              <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} class="lg:col-span-2 bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <p class="text-sm text-primary tracking-widest">[ MISSIONE ATTIVA ]</p>
                  <Show when={!missionInfo.loading} fallback={<div class="mt-4">Caricamento dati missione...</div>}>
                    <h2 class="text-3xl font-bold mt-2">{missionInfo()?.seasonTitle || "Nessuna Missione"}</h2>
                    <p class="text-text-main/70 mt-1">Sincronizzazione attuale: Livello {missionInfo()?.currentStepNumber} - "{missionInfo()?.currentStepTitle}"</p>
                  
                    <div class="mt-6">
                      <p class="text-sm text-text-main/80 mb-1">Progresso Stabilizzazione:</p>
                      <div class="w-full bg-surface-hover rounded-full h-2.5">
                        <div class="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage()}%` }} />
                      </div>
                      <p class="text-right text-xs text-text-main/60 mt-1">{Math.round(progressPercentage())}% Completato</p>
                    </div>
                  </Show>
                </div>
                <A href="/game/play" class="mt-6 w-full text-center px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                  <IoPlayForward />
                  Riprendi Sincronizzazione
                </A>
              </Motion.div>

              {/* PANNELLO STATS RAPIDE */}
              <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} class="bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6">
                <p class="text-sm text-primary tracking-widest mb-4">[ STATO OPERATORE ]</p>
                <div class="space-y-4">
                  <div class="flex items-center gap-3"><IoFlashOutline size={24} class="text-yellow-400" /><div><p class="font-bold text-lg">{p.focus} / 100</p><p class="text-xs text-text-main/60">Focus Attuale</p></div></div>
                  <div class="flex items-center gap-3"><IoShieldOutline size={24} class="text-sky-400" /><div><p class="font-bold text-lg">{p.resilience}</p><p class="text-xs text-text-main/60">Resilienza</p></div></div>
                  <div class="flex items-center gap-3"><IoDiscOutline size={24} class="text-purple-400" /><div><p class="font-bold text-lg">{p.acumen}</p><p class="text-xs text-text-main/60">Acume</p></div></div>
                  <div class="flex items-center gap-3"><IoSearchOutline size={24} class="text-green-400" /><div><p class="font-bold text-lg">{p.curiosity}</p><p class="text-xs text-text-main/60">Curiosità</p></div></div>
                  <div class="flex items-center gap-3"><IoEyeOutline size={24} class="text-red-400" /><div><p class="font-bold text-lg">{p.concentration}</p><p class="text-xs text-text-main/60">Concentrazione</p></div></div>
                </div>
                <A href="/game/profile" class="mt-6 block text-center text-sm text-primary hover:underline">Visualizza profilo dettagliato →</A>
              </Motion.div>

              {/* PANNELLO AVATAR RECENTI */}
              <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} class="lg:col-span-3 bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6">
                 <p class="text-sm text-primary tracking-widest mb-4">[ ULTIME ACQUISIZIONI ]</p>
                 <Show 
                    when={p.inventory.filter(i => i.game_items?.item_type === 'AVATAR').length > 0}
                    fallback={<p class="text-center text-text-main/60 py-4">Nessun avatar nel repository.</p>}
                  >
                    <div class="flex items-center gap-4">
                      <For each={p.inventory.filter(i => i.game_items?.item_type === 'AVATAR').slice(-3).reverse()}>
                        {(invItem) => (
                          <div class="flex flex-col items-center gap-2 text-center" title={invItem.game_items?.name}>
                             <Image src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${invItem.game_items!.asset_url}`} width={64} height={64} alt={invItem.game_items!.name!} class="rounded-full border-2 border-border/50"/>
                             <p class="text-xs text-text-main/80 truncate w-20">{invItem.game_items!.name}</p>
                          </div>
                        )}
                      </For>
                    </div>
                 </Show>
              </Motion.div>

            </div>
          </div>
        )}
      </Show>
    </div>
  );
}