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
            Bioma Zero. Un ecosistema procedurale dove ogni guardiano custodisce il proprio bioma, vivo e in costante mutazione. Non è un’arena, non è conquista: è ingegneria narrativa, enigmi logico-linguistici intrecciati a un kernel riscritto da zero per sostenere un’evoluzione modulare. Le Cronologie — frammenti generati dal modello Gemini LLM — sono artefatti interattivi, memorie digitali che reagiscono alle tue scelte, mutano, e raccontano una storia che solo tu puoi completare.
          </p>
          <h2 class="text-2xl text-left font-semibold mt-8 mb-4 text-ghost/90">
            Perchè Bioma Zero?
          </h2>
            <blockquote class="mt-6 border-l-4 border-ghost/40 pl-4 text-sm text-left text-ghost/80 italic leading-relaxed">
          Una challenge personale, scrivere un sistema interamente in TypeScript. 
          SolidJS come framework reattivo privo di Virtual DOM, Supabase per orchestrare persistenza 
          e sincronizzazione. Gemini non è solo un assistente, ma un copilota di progettazione, debug 
          e creazione contenuti, un secondo layer cognitivo. L’intento non è produrre un semplice gioco, 
          ma un ambiente che mantenga la mente in stato di allenamento costante, fondendo stimolo 
          intellettuale e immersione. Un giorno forse, oltre lo schermo, in VR. Non per moda. Perché sarà 
          il passo successivo naturale.
        </blockquote>
        </Motion.div>


        {/* Call to Action */}
        <Motion.div
          class="mt-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1, easing: [0.16, 1, 0.3, 1] }}
        >
          <A 
            href="https://github.com/pankaspe/bioma-zero" 
            target="_blank" 
            class="py-4 px-10 font-bold text-abyss bg-biolume rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-biolume/40 text-xl shadow-xl shadow-biolume/20"
          >
            visita il progetto
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