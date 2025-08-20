import { type Component, Show, createSignal, onMount, onCleanup, createMemo } from "solid-js";
import { isServer } from "solid-js/web";
import { A, useLocation } from "@solidjs/router";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { themeStore, themeStoreActions } from "~/lib/themeStore";
import { Image } from "@unpic/solid";
// --- Icone ---
import { 
  IoFlashOutline, 
  IoLogOutOutline, 
  IoMoonOutline, 
  IoSunnyOutline,
  IoShieldOutline,
  IoDiscOutline,
  IoSearchOutline,
  IoEyeOutline,
  IoGridOutline,
  IoTerminalOutline,
  IoGitNetworkOutline
} from "solid-icons/io";
import { Presence } from "solid-motionone";
import { AvatarSelectionDropdown } from "./AvatarSelectionDropdown";
import { updateUsername } from "~/lib/game-actions";
import { InlineEdit } from "~/components/ui/InLineEdit";

const Topbar: Component = () => {
  const profile = () => gameStore.profile;
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = createSignal(false);
  let avatarMenuRef: HTMLDivElement | undefined;
  
  const location = useLocation();

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
    // === MODIFICA CHIAVE 1: Aggiunto 'relative' per il posizionamento assoluto del centro ===
    <header class="relative fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6 z-50">
      <Show when={profile()} keyed>
        {p => (
          <>
            {/* === SEZIONE SINISTRA: Identità Utente (invariata) === */}
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

            {/* === NUOVO: SEZIONE CENTRALE (Statistiche) === */}
            {/* Posizionata in modo assoluto per essere sempre perfettamente al centro */}
            <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 text-text-main bg-surface-hover/50 rounded-lg px-3 py-1.5">
              <div class="flex items-center gap-1.5" title="Focus"><IoFlashOutline class="text-yellow-400" /> <span class="font-mono text-sm font-bold">{p.focus}</span></div>
              <div class="w-[1px] h-4 bg-border/50 mx-1"></div>
              <div class="flex items-center gap-1.5" title="Resilience"><IoShieldOutline class="text-sky-400" /> <span class="font-mono text-sm font-bold">{p.resilience}</span></div>
              <div class="flex items-center gap-1.5" title="Acumen"><IoDiscOutline class="text-purple-400" /> <span class="font-mono text-sm font-bold">{p.acumen}</span></div>
              <div class="flex items-center gap-1.5" title="Curiosity"><IoSearchOutline class="text-green-400" /> <span class="font-mono text-sm font-bold">{p.curiosity}</span></div>
              <div class="flex items-center gap-1.5" title="Concentration"><IoEyeOutline class="text-red-400" /> <span class="font-mono text-sm font-bold">{p.concentration}</span></div>
            </div>

            {/* === SEZIONE DESTRA: Navigazione e Azioni === */}
            {/* Le statistiche sono state rimosse da qui */}
            <div class="flex items-center gap-2 sm:gap-4">
              <div class="flex items-center gap-2 bg-surface-hover/50 rounded-lg p-1">
                <A href="/game/" class="btn-icon" title="Dashboard" classList={{ 'bg-primary/20 text-primary': location.pathname.includes('/dashboard') }}>
                  <IoGridOutline />
                </A>
                <A href="/game/profile" class="btn-icon" title="Profilo" classList={{ 'bg-primary/20 text-primary': location.pathname.includes('/profile') }}>
                  <IoTerminalOutline />
                </A>
                <A href="/game/paradoxes" class="btn-icon" title="Paradossi" classList={{ 'bg-primary/20 text-primary': location.pathname.includes('/paradoxes') }}>
                  <IoGitNetworkOutline />
                </A>
              </div>
              
              <div class="flex items-center gap-2">
                <button onClick={() => themeStoreActions.toggleTheme()} class="btn-icon" title="Cambia Tema">
                  <Show when={themeStore.theme === 'dark'} fallback={<IoSunnyOutline />}><IoMoonOutline /></Show>
                </button>
                <button onClick={() => gameStoreActions.signOut()} class="btn-icon !text-error/80 hover:!text-error" title="Logout">
                  <IoLogOutOutline />
                </button>
              </div>
            </div>
          </>
        )}
      </Show>
    </header>
  );
};

export default Topbar;