// src/routes/game/profile.tsx

import { Show, createSignal, createEffect, For, createMemo } from "solid-js";
import { updateUsername, equipAvatar } from "~/lib/game-actions";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import Loader from "~/components/ui/Loader";
import { FiEdit, FiCheck, FiX } from "solid-icons/fi";

// Importiamo i nostri tipi!
import type { InventoryItemWithDetails } from "~/types/game";
import { ItemCard } from "~/components/game/bioma/ItemCard";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = createSignal(false);
  const [usernameInput, setUsernameInput] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;

  createEffect(() => { setUsernameInput(gameStore.profile?.username || ""); });
  
  const handleEditClick = () => { setIsEditing(true); setTimeout(() => inputRef?.focus(), 0); };
  const handleCancelClick = () => { setIsEditing(false); setUsernameInput(gameStore.profile?.username || ""); };
  const handleSaveClick = async () => {
    if (loading()) return;
    setLoading(true);
    setMessage("");
    const usernameToSave = usernameInput();
    const originalUsername = gameStore.profile?.username || "";
    gameStoreActions.updateUsername(usernameToSave);
    setIsEditing(false);
    const result = await updateUsername(usernameToSave);
    if (result.success) {
      setMessage("Username salvato!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(`Errore: ${result.error}`);
      gameStoreActions.revertUsername(originalUsername);
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };

  // --- NUOVA LOGICA PER GLI AVATAR ---

  // SOLUZIONE 1: Dichiariamo esplicitamente il tipo di ritorno del memo.
  const userAvatars = createMemo<InventoryItemWithDetails[]>(() => 
    gameStore.profile?.inventory.filter(i => i.game_items?.item_type === 'avatar') ?? []
  );

  const [savingAvatarId, setSavingAvatarId] = createSignal<string | null>(null);

  // SOLUZIONE 2: Dichiariamo esplicitamente il tipo del parametro 'item'.
  const handleEquipAvatar = async (item: InventoryItemWithDetails) => {
    if (!item.game_items || savingAvatarId()) return;
    
    setSavingAvatarId(item.item_id);
    gameStoreActions.equipAvatar(item.item_id);
    await equipAvatar(item.item_id);
    setSavingAvatarId(null);
  };

  return (
    <div class="max-w-2xl">
      <h1 class="text-4xl font-bold text-biolume mb-8">Profilo dell'Entità</h1>
      <Show when={!gameStore.isLoading} fallback={<Loader inCenter={true} />}>
        <Show when={gameStore.profile} fallback={<p class="text-red-400">{gameStore.error || "Errore nel caricamento del profilo."}</p>}>
          {(profile) => (
            <div class="space-y-8 animate-fade-in">
              <div class="bg-starlight/10 p-5 rounded-lg">
                <div class="flex justify-between items-center">
                  <label class="text-sm text-ghost/60">Username</label>
                  <Show when={!isEditing()} fallback={
                      <div class="flex items-center gap-2">
                        <button onClick={handleSaveClick} disabled={loading()} class="p-1 text-green-400 hover:bg-green-400/20 rounded-full transition-colors"><FiCheck class="w-5 h-5" /></button>
                        <button onClick={handleCancelClick} class="p-1 text-red-400 hover:bg-red-400/20 rounded-full transition-colors"><FiX class="w-5 h-5" /></button>
                      </div>
                    } >
                    <button onClick={handleEditClick} class="p-1 text-ghost/60 hover:text-ghost hover:bg-starlight/20 rounded-full transition-colors"><FiEdit class="w-5 h-5" /></button>
                  </Show>
                </div>
                <div class="mt-1">
                  <Show when={!isEditing()} fallback={
                      <input ref={inputRef} type="text" class="w-full bg-transparent font-mono text-xl text-biolume border-b-2 border-biolume/50 focus:outline-none py-1" value={usernameInput()} onInput={(e) => setUsernameInput(e.currentTarget.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveClick(); } if (e.key === 'Escape') handleCancelClick(); }} />
                    } >
                    <p class="font-mono text-xl text-biolume py-1">{profile().username || "Non impostato"}</p>
                  </Show>
                </div>
              </div>
              <Show when={message()}>
                <p class="text-sm text-center" classList={{ 'text-green-400': message().includes('salvato'), 'text-red-400': message().includes('Errore') }} >{message()}</p>
              </Show>
              <Show when={userAvatars().length > 0}>
                <div class="bg-starlight/10 p-5 rounded-lg">
                  <h3 class="text-sm text-ghost/60 mb-4">Avatar Posseduti</h3>
                  <div class="grid grid-cols-4 sm:grid-cols-6 gap-4">
                    {/* Ora TypeScript sa che 'item' è di tipo InventoryItemWithDetails */}
                    <For each={userAvatars()}>
                      {(item) => (
                        <ItemCard 
                          item={item}
                          isEquipped={() => profile().active_avatar_id === item.item_id}
                          onEquip={() => handleEquipAvatar(item)}
                          savingItemId={savingAvatarId()}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>
          )}
        </Show>
      </Show>
    </div>
  );
}