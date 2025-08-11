// src/routes/index.tsx
import { A } from "@solidjs/router";

export default function HomePage() {
  return (
    <div class="min-h-screen bg-abyss text-ghost flex flex-col items-center justify-center text-center p-4">
      <main class="max-w-2xl">
        <h1 class="text-6xl font-bold text-biolume animate-pulse">
          Bioma Zero
        </h1>
        <p class="mt-4 text-xl text-ghost/80">
          Un'avventura interattiva per far rifiorire un mondo dimenticato.
          Rianima la vita, scegli il destino.
        </p>
        <div class="mt-8">
          <A 
            href="/login" 
            class="py-3 px-8 font-bold text-abyss bg-biolume rounded-md transition hover:bg-biolume/80 text-lg shadow-lg shadow-biolume/20"
          >
            Inizia il tuo Viaggio
          </A>
        </div>
      </main>
      <footer class="absolute bottom-4 text-xs text-starlight/50">
        <p>Un progetto di [Il Tuo Nome/Nickname Qui]</p>
      </footer>
    </div>
  );
}