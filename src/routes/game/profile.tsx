// src/routes/game/profile.tsx
import { Show, createSignal, createEffect } from "solid-js";
import { updateUsername } from "~/lib/game-actions";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import Loader from "~/components/ui/Loader";
import { FiEdit, FiCheck, FiX } from "solid-icons/fi";

export default function ProfilePage() {
  // Stati locali del componente per gestire la UI di modifica
  const [isEditing, setIsEditing] = createSignal(false);
  const [usernameInput, setUsernameInput] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;

  // Questo effetto tiene sincronizzato l'input con lo store.
  createEffect(() => {
    setUsernameInput(gameStore.profile?.username || "");
  });
  
  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef?.focus(), 0);
  };
  
  const handleCancelClick = () => {
    setIsEditing(false);
    setUsernameInput(gameStore.profile?.username || "");
  };

  const handleSaveClick = async () => {
    if (loading()) return;
    setLoading(true);
    setMessage("");

    const usernameToSave = usernameInput();
    const originalUsername = gameStore.profile?.username || "";

    // Aggiornamento Ottimistico
    gameStoreActions.updateUsername(usernameToSave, originalUsername);
    setIsEditing(false);

    // Chiamata al Server
    const result = await updateUsername(usernameToSave);
    
    if (result.success) {
      setMessage("Username salvato!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(`Errore: ${result.error}`);
      // Ripristino in caso di errore
      gameStoreActions.revertUsername(originalUsername);
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };

  return (
    <div class="max-w-2xl">
      <h1 class="text-4xl font-bold text-biolume mb-8">Profilo dell'Entità</h1>
      <Show when={!gameStore.isLoading} fallback={<Loader inCenter={false} />}>
        <Show when={gameStore.profile} fallback={<p class="text-red-400">{gameStore.error || "Errore nel caricamento del profilo."}</p>}>
          {(profile) => (
            <div class="space-y-8 animate-fade-in">

              <div class="bg-starlight/10 p-5 rounded-lg">
                <div class="flex justify-between items-center">
                  <label class="text-sm text-ghost/60">Username</label>
                  
                  {/* --- Sezione Pulsanti di Modifica --- */}
                  <Show 
                    when={!isEditing()}
                    fallback={
                      <div class="flex items-center gap-2">
                        <button onClick={handleSaveClick} disabled={loading()} class="p-1 text-green-400 hover:bg-green-400/20 rounded-full transition-colors">
                          <FiCheck class="w-5 h-5" />
                        </button>
                        <button onClick={handleCancelClick} class="p-1 text-red-400 hover:bg-red-400/20 rounded-full transition-colors">
                          <FiX class="w-5 h-5" />
                        </button>
                      </div>
                    }
                  >
                    <button onClick={handleEditClick} class="p-1 text-ghost/60 hover:text-ghost hover:bg-starlight/20 rounded-full transition-colors">
                      <FiEdit class="w-5 h-5" />
                    </button>
                  </Show>
                </div>

                {/* --- Sezione Username / Input --- */}
                <div class="mt-1">
                  <Show 
                    when={!isEditing()}
                    fallback={
                      <input
                        ref={inputRef}
                        type="text"
                        class="w-full bg-transparent font-mono text-xl text-biolume border-b-2 border-biolume/50 focus:outline-none py-1"
                        value={usernameInput()}
                        onInput={(e) => setUsernameInput(e.currentTarget.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveClick();
                          }
                          if (e.key === 'Escape') handleCancelClick();
                        }}
                      />
                    }
                  >
                    <p class="font-mono text-xl text-biolume py-1">{profile().username || "Non impostato"}</p>
                  </Show>
                </div>
              </div>

              {/* Messaggio di Feedback */}
              <Show when={message()}>
                <p class="text-sm text-center"
                  classList={{ 
                    'text-green-400': message().includes('salvato'), 
                    'text-red-400': message().includes('Errore') 
                  }}
                >
                  {message()}
                </p>
              </Show>
            </div>
          )}
        </Show>
      </Show>
    </div>
  );
}