import { type Component, Show, createSignal, onMount, onCleanup, createMemo  } from "solid-js";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { updateUsername, updateBiomeName } from "~/lib/game-actions";
import { InlineEdit } from "~/components/ui/InLineEdit";
import { Image } from "@unpic/solid";
import { IoFlashOutline, IoLogOutOutline } from "solid-icons/io";
import { TbHeart, TbPlant2, TbShield, TbBrain } from 'solid-icons/tb';
// --- NUOVI IMPORT ---
import { Presence } from "solid-motionone";
import { AvatarSelectionDropdown } from "./AvatarSelectionDropdown";
import { isServer } from "solid-js/web";

const Topbar: Component = () => {
  // Deriviamo i segnali in modo sicuro
  const profile = () => gameStore.profile;
  const activeBiome = () => gameStore.profile?.biomes[0];

  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = createSignal(false);
  let avatarMenuRef: HTMLDivElement | undefined;

  if (!isServer) {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef && !avatarMenuRef.contains(event.target as Node)) {
        setIsAvatarDropdownOpen(false);
      }
    };
    onMount(() => document.addEventListener("mousedown", handleClickOutside));
    onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));
  }

  const activeAvatarUrl = createMemo(() => {
    const FALLBACK_AVATAR = '/game/base_avatar.svg';
    const currentProfile = profile(); // Accediamo al segnale una sola volta
    if (!currentProfile) return FALLBACK_AVATAR;

    const avatarId = currentProfile.active_avatar_id;
    if (!avatarId) return FALLBACK_AVATAR;

    const inventoryItem = currentProfile.inventory.find(i => i.item_id === avatarId);
    const assetUrl = inventoryItem?.game_items?.asset_url;
    
    return assetUrl 
      ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${assetUrl}` 
      : FALLBACK_AVATAR;
  });

  // Handler per salvare l'username
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

  // Handler per salvare il nome del bioma
  const handleSaveBiomeName = async (newName: string) => {
    const originalName = activeBiome()?.bioma_name || "";
    if (newName === originalName) return true;

    gameStoreActions.updateBiomeName(newName);
    const result = await updateBiomeName(newName);

    if (!result.success) {
      gameStoreActions.showToast(result.error || "Errore", 'error');
      gameStoreActions.revertBiomeName(originalName);
      return false;
    }
    gameStoreActions.showToast("Nome Bioma aggiornato!", 'success');
    return true;
  };

  return (
    <header class="w-full h-16 flex-shrink-0 bg-abyss/95 backdrop-blur-sm border-b border-starlight/10 flex items-center justify-between px-4 sm:px-6 z-10">
      
      <Show when={profile()} keyed>
        {p => (
          <>
            <div class="flex items-center gap-4 w-1/3">
              <div class="relative flex-shrink-0" ref={avatarMenuRef}>
                <button
                  onClick={() => setIsAvatarDropdownOpen(o => !o)}
                  class="w-8 h-8 rounded-full overflow-hidden border border-starlight/50 hover:border-biolume transition-colors focus:outline-none focus:ring-2 ring-offset-2 ring-offset-abyss focus:ring-biolume"
                >
                  <Image src={p.active_avatar_id ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${p.inventory.find(i => i.item_id === p.active_avatar_id)?.game_items?.asset_url}` : '/game/base_avatar.svg'} height={40} width={40} alt="Avatar" />
                </button>
                <Presence>
                  <Show when={isAvatarDropdownOpen()}>
                    <AvatarSelectionDropdown
                      inventory={p.inventory}
                      activeAvatarId={p.active_avatar_id}
                      onSelect={(avatarId) => {
                        gameStoreActions.equipAvatar(avatarId);
                        setIsAvatarDropdownOpen(false);
                      }}
                    />
                  </Show>
                </Presence>
              </div>
              <div class="hidden lg:flex items-center gap-4">
                <InlineEdit value={p.username || ""} onSave={handleSaveUsername} label="Entità:" />
                <div class="w-px h-6 bg-starlight/20"></div>
                <InlineEdit value={activeBiome()?.bioma_name || ""} onSave={handleSaveBiomeName} label="Bioma:" />
              </div>
            </div>

            {/* --- SEZIONE CENTRALE: STATISTICHE BIOMA --- */}
            <div class="hidden md:flex items-center justify-center gap-4 text-ghost w-1/3">
              <div class="flex items-center gap-1.5" title="Vitalità"><TbHeart class="text-red-400" /><span class="font-mono text-sm">{activeBiome()?.vitality.toFixed(1)}</span></div>
              <div class="flex items-center gap-1.5" title="Fertilità"><TbPlant2 class="text-green-400" /><span class="font-mono text-sm">{activeBiome()?.fertility.toFixed(1)}</span></div>
              <div class="flex items-center gap-1.5" title="Resistenza"><TbShield class="text-blue-400" /><span class="font-mono text-sm">{activeBiome()?.resistance.toFixed(1)}</span></div>
              <div class="flex items-center gap-1.5" title="Adattabilità"><TbBrain class="text-purple-400" /><span class="font-mono text-sm">{activeBiome()?.adaptability.toFixed(1)}</span></div>
              |
              <div class="flex items-center gap-1.5 text-ghost" title="Energia">
                <IoFlashOutline class="text-yellow-400" />
                <span class="font-mono text-sm">{p.energy}</span>
              </div>
            </div>

            {/* --- SEZIONE DESTRA: AZIONI E ENERGIA --- */}
            <div class="flex items-center justify-end gap-4 w-1/3">
              <button 
                onClick={() => gameStoreActions.signOut()}
                class="text-ghost/70 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <IoLogOutOutline size={4} />
              </button>
            </div>
          </>
        )}
      </Show>
    </header>
  );
};

export default Topbar;