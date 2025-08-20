import { For, Show, createMemo } from "solid-js";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { Motion } from "solid-motionone";
import { Image } from "@unpic/solid";
import { InlineEdit } from "~/components/ui/InLineEdit";
import { updateUsername } from "~/lib/game-actions";
// Icone per le statistiche
import { 
  IoFlashOutline, 
  IoShieldOutline,
  IoDiscOutline,
  IoSearchOutline,
  IoEyeOutline,
  IoRibbonOutline
} from "solid-icons/io";
import type { IconTypes } from "solid-icons";

// --- TIPO UNIFICATO E CORRETTO ---
// 'value' ora è correttamente un 'number'.
type Stat = {
  name: "Focus" | "Resilience" | "Acumen" | "Curiosity" | "Concentration";
  value: number; // <<-- CORREZIONE FONDAMENTALE
  icon: IconTypes;
  color: string;
  maxValue?: number;
};

export default function ProfilePage() {
  const profile = () => gameStore.profile;

  const activeAvatarUrl = createMemo(() => {
    const FALLBACK_AVATAR = '/game/base_avatar.svg';
    const p = profile();
    if (!p) return FALLBACK_AVATAR;
    const item = p.inventory.find(i => i.item_id === p.active_avatar_id);
    const assetUrl = item?.game_items?.asset_url;
    return assetUrl ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${assetUrl}` : FALLBACK_AVATAR;
  });

  // --- CORREZIONE APPLICATA QUI ---
  const statsList = createMemo((): Stat[] => {
    const p = profile();
    if (!p) return [];
    
    // Ora non c'è più bisogno di nessuna conversione. I dati corrispondono direttamente al tipo.
    return [
      { name: "Focus", value: p.focus, icon: IoFlashOutline, color: "text-yellow-400", maxValue: 100 },
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

  // Funzione per calcolare la larghezza della barra di progresso, ora accetta 'number'
  const getBarWidth = (value: number, maxValue: number = 10) => {
    const max = maxValue;
    const percentage = Math.min((value / max) * 100, 100);
    return `${percentage}%`;
  };

  return (
    <div class="w-full max-w-5xl mx-auto p-4 md:p-8">
      <Show when={profile()} keyed>
        {p => (
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* PANNELLO PRINCIPALE: IDENTITÀ OPERATORE */}
            <Motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              class="lg:col-span-2 bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6"
            >
              <div class="relative">
                <div class="w-32 h-32 rounded-full overflow-hidden border-2 border-primary bg-surface-hover">
                  <Image src={activeAvatarUrl()} width={128} height={128} alt="Active Avatar" priority={true} />
                </div>
                <span class="absolute bottom-1 right-1 block w-4 h-4 bg-green-500 border-2 border-surface rounded-full" title="Status: Online" />
              </div>
              <div class="text-center sm:text-left">
                <p class="text-sm text-primary tracking-widest">[ OPERATOR ID ]</p>
                <div class="text-4xl font-bold text-text-main mt-2">
                   <InlineEdit value={p.username || ""} onSave={handleSaveUsername} />
                </div>
                <p class="text-text-main/60 mt-2">Entità registrata: {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            </Motion.div>

            {/* PANNELLO STATISTICHE */}
            <Motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              class="bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6"
            >
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

            {/* PANNELLO INVENTARIO AVATAR */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              class="lg:col-span-3 bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6"
            >
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
            
            {/* PANNELLO ACHIEVEMENT (Placeholder) */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              class="lg:col-span-3 bg-surface/50 backdrop-blur-sm border border-border/30 rounded-lg p-6 flex items-center gap-4 text-text-main/60"
            >
              <IoRibbonOutline size={32} />
              <div>
                <h2 class="text-sm text-primary tracking-widest">[ TITOLI & ONORIFICENZE ]</h2>
                <p class="mt-1 text-sm">Modulo non in linea. In attesa di aggiornamento dal Kernel centrale.</p>
              </div>
            </Motion.div>

          </div>
        )}
      </Show>
    </div>
  );
}