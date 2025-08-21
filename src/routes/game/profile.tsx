import { For, Show, createMemo, createResource } from "solid-js";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { Motion } from "solid-motionone";
import { Image } from "@unpic/solid";
import { InlineEdit } from "~/components/ui/InLineEdit";
import { getProfilePageData, updateUsername } from "~/lib/game-actions";
import { 
  IoFlashOutline, 
  IoShieldOutline,
  IoDiscOutline,
  IoSearchOutline,
  IoEyeOutline,
  IoCheckbox
} from "solid-icons/io";
import type { IconTypes } from "solid-icons";

// Tipo per le statistiche (invariato)
type Stat = {
  name: "Focus" | "Resilience" | "Acumen" | "Curiosity" | "Concentration";
  value: number;
  icon: IconTypes;
  color: string;
  maxValue?: number;
};

// Tipo per i dati delle stagioni recuperati (invariato)
type SeasonWithCompletion = {
  id: number;
  title: string;
  codename: string | null;
  timeline_location: string;
  background_image: string | null;
  achievement_title: string | null;
  unlocked_achievements: { user_id: string }[];
};

export default function ProfilePage() {
  const profile = () => gameStore.profile;
  
  // --- CORREZIONE APPLICATA QUI ---
  // Aggiungiamo un wrapper asincrono che gestisce il caso 'null'.
  // Se la server action restituisce null, noi restituiamo un array vuoto [],
  // soddisfacendo il contratto richiesto da createResource.
  const [seasonsData] = createResource<SeasonWithCompletion[]>(async () => {
    const data = await getProfilePageData();
    return data || []; // Se data è null, ritorna un array vuoto.
  });

  // Memo per trovare solo gli achievement sbloccati
  const unlockedTitles = createMemo(() => {
    return (seasonsData() || [])
      .filter(season => season.unlocked_achievements.length > 0 && season.achievement_title)
      .map(season => season.achievement_title!); // Usiamo '!' perché abbiamo già filtrato
  });


  const activeAvatarUrl = createMemo(() => {
    const FALLBACK_AVATAR = '/game/base_avatar.svg';
    const p = profile();
    if (!p) return FALLBACK_AVATAR;
    const item = p.inventory.find(i => i.item_id === p.active_avatar_id);
    const assetUrl = item?.game_items?.asset_url;
    return assetUrl ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${assetUrl}` : FALLBACK_AVATAR;
  });

  const statsList = createMemo((): Stat[] => {
    const p = profile();
    if (!p) return [];
    return [
      { name: "Focus", value: p.focus, icon: IoFlashOutline, color: "text-yellow-400", maxValue: 500 },
      { name: "Resilience", value: p.resilience, icon: IoShieldOutline, color: "text-sky-400", maxValue: 10 },
      { name: "Acumen", value: p.acumen, icon: IoDiscOutline, color: "text-purple-400", maxValue: 10 },
      { name: "Curiosity", value: p.curiosity, icon: IoSearchOutline, color: "text-green-400", maxValue: 10 },
      { name: "Concentration", value: p.concentration, icon: IoEyeOutline, color: "text-red-400", maxValue: 10 },
    ];
  });
  
  const handleSaveUsername = async (newName: string) => {
    const originalName = profile()?.username || "";
    if (newName === originalName) return true;
    gameStoreActions.updateUsername(newName);
    const result = await updateUsername(newName);
    if (!result.success) {
      gameStoreActions.showToast(result.error || "Errore", 'error');
      gameStoreActions.revertUsername(originalName);
      return false;
    }
    gameStoreActions.showToast("Username aggiornato!", 'success');
    return true;
  };

  const getBarWidth = (value: number, maxValue: number = 10) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    return `${percentage}%`;
  };
  
  const getImageUrl = (path: string | null) => path ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${path}` : '';

  return (
    <div class="w-full max-w-5xl mx-auto p-4 md:p-8">
      <Show when={profile()} keyed>
        {p => (
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} class="lg:col-span-1 bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6">
              <div class="flex flex-col items-center">
                <div class="relative">
                  <div class="w-32 h-32 rounded-full overflow-hidden border-2 border-primary bg-surface-hover">
                    <Image src={activeAvatarUrl()} width={128} height={128} alt="Active Avatar" priority={true} />
                  </div>
                  <span class="absolute bottom-1 right-1 block w-4 h-4 bg-green-500 border-2 border-surface rounded-full" title="Status: Online" />
                </div>
                <div class="text-2xl font-bold text-text-main mt-4 text-center">
                  <InlineEdit value={p.username || ""} onSave={handleSaveUsername} />
                </div>
                <p class="text-text-main/60 mt-1 text-xs">Registrazione: {new Date(p.created_at).toLocaleDateString()}</p>

                {/* === VISUALIZZAZIONE TITOLO ATTIVO === */}
                <Show when={p.active_title} fallback={<p class="text-text-main/60 mt-1 text-xs">Nessun titolo equipaggiato</p>}>
                  <p class="text-secondary font-bold mt-1 text-sm font-mono">{p.active_title}</p>
                </Show>
              </div>
              <hr class="border-border/30 my-6" />
              <h2 class="text-sm text-primary tracking-widest mb-4">[ PARAMETRI ENTITÀ ]</h2>
              <ul class="space-y-4">
                <For each={statsList()}>
                  {stat => (
                    <li>
                      <div class="flex justify-between items-center mb-1 text-sm">
                        <div class="flex items-center gap-2 font-bold">
                          <stat.icon class={stat.color} />
                          <span>{stat.name}</span>
                        </div>
                        <span class="font-mono">{stat.value}</span>
                      </div>
                      <div class="w-full bg-surface-hover rounded-full h-1.5">
                        <div class="bg-primary h-1.5 rounded-full" style={{ width: getBarWidth(stat.value, stat.maxValue) }} />
                      </div>
                    </li>
                  )}
                </For>
              </ul>
            </Motion.div>

            <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} class="lg:col-span-2 bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6">
              <div>
                <h2 class="text-sm text-primary tracking-widest mb-4">[ DOSSIER PARADOSSI ARCHIVIATI ]</h2>
              <Show when={!seasonsData.loading} fallback={<p class="font-mono">Analisi archivi in corso...</p>}>
                <div class="flex flex-col gap-4">
                  <For each={seasonsData()} fallback={<p class="font-mono text-sm text-text-muted">Nessun dossier trovato.</p>}>
                    {season => {
                      const isCompleted = season.unlocked_achievements.length > 0;
                      return (
                        <div class="flex items-center gap-4 bg-surface-hover/50 p-3 rounded-md border border-border/20 hover:border-primary/50 transition-colors">
                          <div class="w-20 h-12 rounded-md overflow-hidden flex-shrink-0 bg-cover bg-center" style={{ "background-image": `url(${getImageUrl(season.background_image)})` }} />
                          <div class="flex-grow">
                            <p class="font-bold text-text-main">{season.title}</p>
                            <p class="text-xs text-text-main/60 font-mono">{season.timeline_location}</p>
                          </div>
                          <div class="flex-shrink-0 text-right">
                            <Show when={isCompleted} fallback={<p class="text-xs font-mono text-yellow-400">IN CORSO</p>}>
                              <div class="flex items-center gap-2 text-green-400">
                                <IoCheckbox />
                                <span class="font-bold text-sm">COMPLETATO</span>
                              </div>
                              <p class="text-xs text-text-main/70 mt-1">Titolo: {season.achievement_title}</p>
                            </Show>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
              </div>

              {/* === NUOVO PANNELLO: TITOLI SBLOCCATI === */}
              <div class="mt-8">
                <h2 class="text-sm text-primary tracking-widest mb-4">[ TITOLI & ONORIFICENZE ]</h2>
                <Show 
                  when={unlockedTitles().length > 0}
                  fallback={<p class="text-sm text-text-main/60">Completa un Dossier Paradosso per sbloccare un titolo.</p>}
                >
                  <div class="flex flex-wrap gap-3">
                    <For each={unlockedTitles()}>
                      {title => (
                        <button
                          onClick={() => gameStoreActions.equipTitle(title)}
                          class="px-4 py-1.5 text-sm font-mono border rounded-md transition-colors"
                          classList={{
                            "bg-secondary/20 border-secondary text-secondary font-bold": title === p.active_title,
                            "bg-surface-hover border-border/50 text-text-main/80 hover:border-primary/50": title !== p.active_title
                          }}
                        >
                          {title}
                        </button>
                      )}
                    </For>
                    {/* Pulsante per rimuovere il titolo */}
                    <Show when={p.active_title}>
                       <button onClick={() => gameStoreActions.equipTitle(null)} class="text-xs text-text-main/60 hover:text-error transition-colors ml-auto">
                         Rimuovi Titolo
                       </button>
                    </Show>
                  </div>
                </Show>
              </div>
            </Motion.div>
            
            
            <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} class="lg:col-span-3 bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6">
              <h2 class="text-sm text-primary tracking-widest mb-4">[ REPOSITORY AVATAR ]</h2>
              <Show 
                when={p.inventory.filter(i => i.game_items?.item_type === 'AVATAR').length > 0}
                fallback={<p class="text-center text-text-main/60 py-8">Nessun avatar collezionato. Completa i paradossi per trovarli.</p>}
              >
                <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                  <For each={p.inventory.filter(i => i.game_items?.item_type === 'AVATAR')}>
                    {(invItem, i) => (
                      <Motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i() * 0.05 }}
                        onClick={() => gameStoreActions.equipAvatar(invItem.item_id)}
                        class="aspect-square rounded-full border-2 transition-all duration-200 hover:scale-105 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                        classList={{
                          "border-primary ring-2 ring-primary/50": invItem.item_id === p.active_avatar_id,
                          "border-border/50": invItem.item_id !== p.active_avatar_id
                        }}
                        title={`Equipaggia: ${invItem.game_items?.name}`}
                      >
                        <Image
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${invItem.game_items!.asset_url}`}
                          width={80}
                          height={80}
                          alt={invItem.game_items!.name!}
                          class="rounded-full"
                        />
                      </Motion.button>
                    )}
                  </For>
                </div>
              </Show>
            </Motion.div>

          </div>
        )}
      </Show>
    </div>
  );
}