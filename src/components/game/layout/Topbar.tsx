import { type Component, Show, createSignal, onMount, onCleanup, createMemo } from "solid-js";
import { isServer } from "solid-js/web";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { themeStore, themeStoreActions } from "~/lib/themeStore";
import { Image } from "@unpic/solid";
// --- Importiamo le nuove icone ---
import { 
  IoFlashOutline, 
  IoLogOutOutline, 
  IoMoonOutline, 
  IoSunnyOutline,
  IoShieldOutline,     // Per Resilience
  IoDiscOutline,      // Per Acumen
  IoSearchOutline,     // Per Curiosity
  IoEyeOutline         // Per Concentration
} from "solid-icons/io";
import { Presence } from "solid-motionone";
import { AvatarSelectionDropdown } from "./AvatarSelectionDropdown";
import { updateUsername } from "~/lib/game-actions";
import { InlineEdit } from "~/components/ui/InLineEdit";

const Topbar: Component = () => {
  const profile = () => gameStore.profile;
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
    const p = profile();
    if (!p) return FALLBACK_AVATAR;

    const inventoryItem = p.inventory.find(i => i.item_id === p.active_avatar_id);
    const assetUrl = inventoryItem?.game_items?.asset_url;
    
    return assetUrl 
      ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images${assetUrl}` 
      : FALLBACK_AVATAR;
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

  return (
    <header class="fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6 z-50">
      <Show when={profile()} keyed>
        {p => (
          <>
            {/* === SEZIONE SINISTRA: Identità Utente === */}
            <div class="flex items-center gap-3">
              <div class="relative" ref={avatarMenuRef}>
                <button
                  onClick={() => setIsAvatarDropdownOpen(o => !o)}
                  class="w-10 h-10 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors focus-visible:(outline-none ring-2 ring-offset-2 ring-offset-surface ring-primary)"
                >
                  <Image src={activeAvatarUrl()} height={40} width={40} alt="Avatar" />
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
              <div class="hidden md:block text-text-main font-sans font-semibold">
                <InlineEdit value={p.username || ""} onSave={handleSaveUsername} label="ID:" />
              </div>
            </div>

            {/* === SEZIONE DESTRA: Azioni e Stato === */}
            <div class="flex items-center gap-2 sm:gap-4">
              
              {/* --- NUOVO BLOCCO STATISTICHE --- */}
              <div class="flex items-center gap-2 text-text-main bg-surface-hover/50 rounded-lg px-3 py-1.5">
                {/* Focus */}
                <div class="flex items-center gap-1.5" title="Focus">
                  <IoFlashOutline class="text-yellow-400" />
                  <span class="font-mono text-sm font-bold">{p.focus}</span>
                </div>
                {/* Separatore */}
                <div class="w-[1px] h-4 bg-border/50 mx-1"></div>
                {/* Resilience */}
                <div class="flex items-center gap-1.5" title="Resilience">
                  <IoShieldOutline class="text-sky-400" />
                  <span class="font-mono text-sm font-bold">{p.resilience}</span>
                </div>
                {/* Acumen */}
                <div class="flex items-center gap-1.5" title="Acumen">
                  <IoDiscOutline class="text-purple-400" />
                  <span class="font-mono text-sm font-bold">{p.acumen}</span>
                </div>
                {/* Curiosity */}
                <div class="flex items-center gap-1.5" title="Curiosity">
                  <IoSearchOutline class="text-green-400" />
                  <span class="font-mono text-sm font-bold">{p.curiosity}</span>
                </div>
                {/* Concentration */}
                <div class="flex items-center gap-1.5" title="Concentration">
                  <IoEyeOutline class="text-red-400" />
                  <span class="font-mono text-sm font-bold">{p.concentration}</span>
                </div>
              </div>

              {/* Theme Switcher */}
              <button
                onClick={() => themeStoreActions.toggleTheme()}
                class="btn-icon"
                title="Toggle Theme"
              >
                <Show when={themeStore.theme === 'dark'} fallback={<IoSunnyOutline />}>
                  <IoMoonOutline />
                </Show>
              </button>

              {/* Logout Button */}
              <button onClick={() => gameStoreActions.signOut()} class="btn-icon !text-error/80 hover:!text-error" title="Logout">
                <IoLogOutOutline />
              </button>
            </div>
          </>
        )}
      </Show>
    </header>
  );
};

export default Topbar;