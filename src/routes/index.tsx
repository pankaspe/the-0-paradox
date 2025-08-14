// src/routes/index.tsx

import { A } from "@solidjs/router";
import { type Component } from "solid-js";
import { Motion } from "solid-motionone";
import { Image } from "@unpic/solid"; // Importiamo il componente Image

import { Logo } from "~/components/ui/Logo";

/**
 * PulsatingBackground Component
 * -----------------------------
 * Crea uno sfondo a schermo intero con un'immagine che pulsa e si sfuoca lentamente.
 */
const PulsatingBackground: Component = () => {
  return (
    // Il contenitore principale dell'animazione. Si posiziona dietro a tutto (-z-20)
    // e si estende a tutto lo schermo.
    <Motion.div 
      class="absolute inset-0 w-full h-full -z-20 overflow-hidden"
      // Definiamo l'animazione
      animate={{
        // Anima la scala da 1 (dimensione normale) a 1.03 (leggermente ingrandita) e ritorno
        scale: [1, 1.09, 1],
        // Anima anche la sfuocatura per un effetto più sognante
        filter: ['blur(8px)', 'blur(18px)', 'blur(8px)']
      }}
      // Definiamo le proprietà della transizione
      transition={{
        duration: 20,         // L'animazione completa dura 20 secondi
        repeat: Infinity,     // Si ripete all'infinito
        easing: 'ease-in-out' // Animazione fluida
      }}
    >
      <Image
        src="/screenshot.jpeg" // L'immagine deve essere nella cartella /public
        alt="Sfondo del bioma"
        class="w-full h-full object-cover" // Copre l'intero contenitore
        layout="fullWidth"
        priority={true} // Diamo priorità al caricamento di questa immagine
      />
    </Motion.div>
  );
};


/**
 * BackgroundGlows Component (invariato ma con z-index modificato)
 * -------------------------------------------------------------
 */
const BackgroundGlows: Component = () => {
  return (
    // Lo mettiamo a -z-10, così sta SOPRA l'immagine di sfondo ma SOTTO il testo.
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <Motion.div
        class="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-radial-gradient from-biolume/20 to-transparent blur-3xl"
        animate={{
          x: ["0%", "20%", "0%", "-10%", "0%"],
          y: ["0%", "-10%", "15%", "5%", "0%"],
          scale: [1, 1.05, 1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <Motion.div
        class="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-radial-gradient from-starlight/15 to-transparent blur-3xl"
        animate={{
          x: ["0%", "-15%", "5%", "10%", "0%"],
          y: ["0%", "10%", "-15%", "-5%", "0%"],
          scale: [1, 0.95, 1, 1.05, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, delay: 5 }}
      />
    </div>
  );
};


/**
 * HomePage Component
 * ------------------
 * Landing page con sfondo animato e contenuti testuali.
 */
export default function HomePage() {
  return (
    // Aggiungiamo bg-abyss qui come colore di fallback mentre l'immagine carica
    <div class="h-screen w-screen overflow-hidden relative text-ghost">
      {/* Inseriamo i nostri due componenti di sfondo */}
      <PulsatingBackground />
      <BackgroundGlows />

        <Motion.div 
          class="absolute inset-0 grid-overlay pointer-events-none"
          animate={{ opacity: [0.2, 0.9] }} transition={{ duration: 3, repeat: Infinity, direction: 'alternate' }}
         />

        <main class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          
          <Logo href="/login" class="mb-8" />

          <Motion.div
            class="max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <p class="text-lg md:text-xl text-ghost/80 leading-relaxed">
              Bioma Zero. Un ecosistema procedurale dove ogni player custodisce il proprio bioma, vivo e in costante mutazione. Non è un’arena, non è conquista: è ingegneria narrativa, enigmi logico-linguistici intrecciati a un kernel riscritto da zero per sostenere un’evoluzione modulare.</p>
              <p class="text-md text-ghost/80 leading-relaxed">
              Le Cronologie del gioco sono frammenti generati dal modello di intelligenza artificiale, Gemini LLM — Storie interattive, memorie digitali che reagiscono alle tue scelte, mutano, e raccontano una storia che solo tu puoi completare.
            </p>
            <h2 class="text-2xl text-left font-semibold mt-8 mb-4 text-ghost/90">
              Perchè Bioma Zero?
            </h2>
            <blockquote class="mt-6 border-l-4 border-ghost/40 pl-4 text-sm text-left text-ghost/80 italic leading-relaxed">
              Una challenge personale: costruire un intero ecosistema in TypeScript. Alla base c’è SolidJS, framework reattivo senza Virtual DOM; Supabase orchestra persistenza e sincronizzazione in tempo reale. Gemini non è solo un assistente: è il mio copilota di progettazione, debug e creazione dei contenuti. Questo progetto è stato anche un esperimento di programmazione side-to-side con Gemini: lo stesso algoritmo di Bioma Zero è stato scritto da Gemini. <br />L’obiettivo non è un semplice gioco, ma un ambiente che mantenga la mente in costante allenamento, fondendo stimolo intellettuale e immersione. Un giorno, forse oltre lo schermo, anche in VR: non per moda, ma perché sarà il passo naturale successivo.
            </blockquote>
          </Motion.div>

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