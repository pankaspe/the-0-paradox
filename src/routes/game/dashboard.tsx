// src/routes/game/dashboard.tsx
import { createAsync } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { redirect } from "@solidjs/router";
import { Show } from "solid-js";

// La funzione `getUser` non cambia, è già perfetta.
const getUser = async () => {
  "use server";
  const event = getRequestEvent();
  if (!event?.locals.user) {
    throw redirect("/login");
  }
  return event.locals.user;
};

export default function DashboardPage() {
  const user = createAsync(() => getUser());

  // Nota come abbiamo rimosso tutti i div di layout (bg-abyss, min-h-screen, etc.)
  // Ora sono gestiti dal file (game).tsx
  return (
    <div class="max-w-4xl">
      <h1 class="text-4xl font-bold text-biolume mb-4">Dashboard dell'Entità</h1>
      
      <Show when={user()} fallback={<p>Caricamento dati Entità...</p>}>
        {(u) => (
          <div>
            <p class="text-xl">Benvenuto, Entità.</p>
            <div class="mt-4 space-y-2">
              <p class="bg-starlight/10 p-4 rounded-md">
                ID Unico: <span class="font-mono text-biolume">{u().id}</span>
              </p>
              <p class="bg-starlight/10 p-4 rounded-md">
                Email: <span class="font-mono text-biolume">{u().email}</span>
              </p>
              <p class="bg-starlight/10 p-4 rounded-md">
                Ultimo accesso: <span class="font-mono text-biolume">{new Date(u().last_sign_in_at!).toLocaleString()}</span>
              </p>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}