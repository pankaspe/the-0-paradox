// src/routes/index.tsx
import { A } from "@solidjs/router";
import { type Component } from "solid-js";
import { Motion } from "solid-motionone";
import { Logo } from "~/components/ui/Logo"; // Importiamo il nostro nuovo componente Logo

/**
 * BackgroundGlows Component
 * -------------------------
 * Crea l'atmosfera con nebulose di colore che fluttuano lentamente.
 */
const BackgroundGlows: Component = () => {
  return (
    <div class="absolute inset-0 -z-10 overflow-hidden bg-abyss">
      {/* Nebulosa Biolume (Verde) */}
      <Motion.div
        class="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-radial-gradient from-biolume/20 to-transparent blur-3xl"
        animate={{
          x: ["0%", "20%", "0%", "-10%", "0%"],
          y: ["0%", "-10%", "15%", "5%", "0%"],
          scale: [1, 1.05, 1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
        }}
      />
      {/* Nebulosa Starlight (Blu) */}
      <Motion.div
        class="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-radial-gradient from-starlight/15 to-transparent blur-3xl"
        animate={{
          x: ["0%", "-15%", "5%", "10%", "0%"],
          y: ["0%", "10%", "-15%", "-5%", "0%"],
          scale: [1, 0.95, 1, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          delay: 5,
        }}
      />
    </div>
  );
};

/**
 * HomePage Component
 * ------------------
 * Una landing page a schermo intero, narrativa e immersiva.
 */
export default function HomePage() {
  return (
    <div class="h-screen w-screen overflow-hidden relative text-ghost">
      <BackgroundGlows />

      <main class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        
        {/* Usiamo il nostro nuovo componente Logo come elemento centrale */}
        <Logo href="/login" class="mb-8" />

        {/* Descrizione Lunga e Criptica */}
        <Motion.div
          class="max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <p class="text-lg md:text-xl text-ghost/80 leading-relaxed">
            Nell'immobilità che precede la creazione, dove il tempo stesso è un ricordo sbiadito, un singolo frammento di potenziale attende. Tu sei l'Erede, un custode di echi dimenticati, chiamato a interpretare il silenzio. Non brandirai armi, né conquisterai regni; la tua unica tela è un mondo dormiente, il tuo unico strumento è l'intelletto.
          </p>
          <p class="mt-6 text-lg md:text-xl text-ghost/80 leading-relaxed">
            Attraverso le **Cronache**, narrazioni perdute e dilemmi ancestrali, dovrai tessere la trama della realtà. Ogni enigma risolto non è una vittoria, ma una nota in una sinfonia cosmica. Ogni scelta non è un bivio, ma un seme piantato nel tessuto del tuo bioma personale. Dalle tue decisioni scaturiranno forme di vita mai viste, paesaggi che respirano e cieli che narrano storie. Questo non è un gioco sulla fine, ma sull'infinito potenziale di un singolo, consapevole inizio. La genesi è nelle tue mani. Sarai in grado di orchestrarla?
          </p>
        </Motion.div>

        {/* Call to Action */}
        <Motion.div
          class="mt-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1, easing: [0.16, 1, 0.3, 1] }}
        >
          <A 
            href="/login" 
            class="py-4 px-10 font-bold text-abyss bg-biolume rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-biolume/40 text-xl shadow-xl shadow-biolume/20"
          >
            Accetta il Lascito
          </A>
        </Motion.div>
      </main>

      <footer class="absolute bottom-6 text-center w-full">
        <p class="text-xs text-starlight/40 animate-pulse">
          L'eco attende...
        </p>
      </footer>
    </div>
  );
}