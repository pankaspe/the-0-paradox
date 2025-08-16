import { A } from "@solidjs/router";
import { type Component } from "solid-js";
import { Motion } from "solid-motionone";
import { Logo } from "~/components/ui/Logo";

/**
 * BackgroundGlows Component
 * -----------------------------
 * Un'animazione di luce soffusa e organica.
 */
const BackgroundGlows: Component = () => {
  return (
    <div class="absolute inset-0 -z-10 overflow-hidden bg-abyss">
      <Motion.div
        class="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-radial-gradient from-biolume/15 to-transparent blur-3xl"
        animate={{
          x: ["0%", "20%", "0%", "-10%", "0%"],
          y: ["0%", "-10%", "15%", "5%", "0%"],
        }}
        transition={{ duration: 40, repeat: Infinity, easing: 'linear' }}
      />
      <Motion.div
        class="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-radial-gradient from-starlight/10 to-transparent blur-3xl"
        animate={{
          x: ["0%", "-15%", "5%", "10%", "0%"],
          y: ["0%", "10%", "-15%", "-5%", "0%"],
        }}
        transition={{ duration: 50, repeat: Infinity, easing: 'linear', delay: 5 }}
      />
    </div>
  );
};


/**
 * HomePage Component
 * ------------------
 * La landing page, riscritta per riflettere la nuova visione del gioco.
 */
export default function HomePage() {
  return (
    <div class="h-screen w-screen overflow-hidden relative text-ghost">
      <BackgroundGlows />

      <main class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        
        <A href="/login" class="mb-8" title="Inizia la tua Genesi">
          Bioma Zero
        </A>

        <Motion.div
          class="max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          {/* --- TESTO NARRATIVO AGGIORNATO --- */}
          <p class="text-lg md:text-xl text-ghost/80 leading-relaxed">
            Inizia come una scintilla nel vuoto. Non c'è vittoria, non c'è sconfitta. C'è solo una scelta, poi un'altra. Ogni decisione plasma il patrimonio genetico del tuo bioma, scrivendo una storia unica nell'universo. Non sei solo un giocatore: sei un progenitore, un'architetto di vita.
          </p>
          <p class="mt-4 text-md text-ghost/70 leading-relaxed">
            Bioma Zero è un'esperienza narrativa in cui la tua eredità è il tuo punteggio. Coltiva un ecosistema, guidalo attraverso le ere cosmiche e, quando il suo tempo giunge al culmine, fallo collassare in una supernova. Il tuo sacrificio lascerà un'impronta indelebile nella galassia condivisa, influenzando i biomi vicini e ispirando le generazioni future.
          </p>
          
          {/* --- SEZIONE "WHY" AGGIORNATA --- */}
          <blockquote class="mt-12 border-l-4 border-ghost/40 pl-4 text-sm text-left text-ghost/80 italic leading-relaxed">
            Questo progetto nasce da una domanda: un gioco può essere uno strumento di riflessione? Ho usato SolidJS per la sua reattività pura e Supabase per costruire un universo persistente. L'intelligenza artificiale non è un orpello: è un partner creativo, un demiurgo che genera gli eventi cosmici che tutti i giocatori condividono. Ogni riga di codice, ogni scelta narrativa, è un passo verso un'esperienza che non vuole solo intrattenere, ma lasciare una domanda: quale eredità sceglierai di essere?
          </blockquote>
        </Motion.div>

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
            Inizia la Genesi
          </A>
        </Motion.div>
      </main>

      <footer class="absolute bottom-6 text-center w-full">
        <p class="text-xs text-starlight/40 animate-pulse">
          L'universo attende la tua impronta...
        </p>
      </footer>
    </div>
  );
}