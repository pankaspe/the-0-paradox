// src/routes/index.tsx
import { A } from "@solidjs/router";
import { For, type Component, createSignal, onMount } from "solid-js";
import { Motion, Presence } from "solid-motionone"; // Importiamo anche Presence per le animazioni di entrata/uscita

// Importiamo le icone che ci serviranno
import {
  FaSolidLightbulb,
  FaSolidCode,
  FaSolidShieldVirus,
  FaSolidDiagramProject,
  FaSolidRocket,
  FaSolidSeedling,
} from "solid-icons/fa";
import { CgGames } from "solid-icons/cg";

// Definiamo i dati per la nostra timeline, ora più dettagliati
const developmentSteps = [
  {
    name: "Fase 0: Il Concetto",
    icon: FaSolidLightbulb,
    description: "L'idea iniziale: un gioco narrativo basato sull'evoluzione e la rinascita, senza combattimenti.",
  },
  {
    name: "Fase 1: Prototipo",
    icon: FaSolidCode,
    description: "Creazione di un primo prototipo per testare le meccaniche di base della narrazione a bivi.",
  },
  {
    name: "Fase 2: Test e Analisi",
    icon: FaSolidShieldVirus,
    description: "Raccolta di feedback e analisi dei punti deboli del prototipo iniziale.",
  },
  {
    name: "Fase 3: Riprogettazione",
    icon: FaSolidDiagramProject,
    description: "Una completa riprogettazione dell'architettura per renderla più robusta, scalabile e sicura.",
  },
  {
    name: "Fase 4: Fondamenta Solide",
    icon: FaSolidRocket,
    description: "Implementazione della nuova architettura con SolidStart e Supabase. Costruzione del sistema di autenticazione e dei layout.",
  },
  {
    name: "Fase 5: Core Gameplay Loop",
    icon: CgGames,
    description: "Sviluppo del motore delle Cronache, dell'inventario e delle prime meccaniche di gioco.",
  },
  {
    name: "Fase 6: Nascita",
    icon: FaSolidSeedling,
    description: "Rilascio della prima versione Alpha pubblica di Bioma Zero.",
  },
];
const currentPhaseIndex = 4; // Siamo alla fase 4 "Fondamenta Solide"

// Un componente per la singola voce della timeline, ora più complesso e animato
const TimelineItem: Component<{ step: any; index: number; active: boolean }> = (props) => {
  return (
    <div class="flex">
      {/* Icona e linea verticale */}
      <div class="flex flex-col items-center mr-4">
        <Motion.div
          class={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-500 ${
            props.active ? "border-biolume bg-biolume/20" : "border-starlight/20"
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: props.index * 0.1, easing: "ease-in-out" }}
        >
          <props.step.icon
            class={`w-5 h-5 transition-colors duration-500 ${
              props.active ? "text-biolume" : "text-starlight/60"
            }`}
          />
        </Motion.div>
        <div class="w-px h-full bg-starlight/20" />
      </div>

      {/* Contenuto testuale */}
      <Motion.div
        class="pb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: props.index * 0.15, easing: "ease-out" }}
      >
        <p
          class={`mb-1 text-lg font-semibold transition-colors duration-500 ${
            props.active ? "text-ghost" : "text-ghost/50"
          }`}
        >
          {props.step.name}
        </p>
        <p class="text-sm text-ghost/60">{props.step.description}</p>
      </Motion.div>
    </div>
  );
};

{/* MAIN COMPONENT PAGE */}
export default function HomePage() {
  return (
    // Aggiunto un gradiente di sfondo per più profondità
    <div class="min-h-screen bg-gradient-to-b from-abyss to-[#0a141e] text-ghost flex flex-col items-center justify-center text-center p-6 overflow-x-hidden">
      <main class="w-full max-w-4xl">
        
        {/* --- Sezione Eroe con animazione --- */}
        <Motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, easing: "ease-out" }}
        >
          <h1 class="text-5xl md:text-7xl font-bold text-biolume animate-pulse">
            Bioma Zero
          </h1>
          <Motion.p
            class="mt-4 text-lg md:text-xl text-ghost/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Un'avventura interattiva per far rifiorire un mondo dimenticato.
          </Motion.p>
        </Motion.div>

        {/* --- Sezione Descrizione --- */}
        <Motion.p
          class="mt-10 max-w-3xl mx-auto text-base text-ghost/90 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          In un universo dove la vita si è estinta, tu sei l'ultimo Erede, l'unica speranza per riaccendere la scintilla della natura. "Bioma Zero" non è un gioco di combattimento, ma un viaggio narrativo. Attraverso la risoluzione delle **Cronache** – enigmi profondi e storie a bivi – darai forma al tuo bioma personale, sbloccando nuove creature, piante e paesaggi. Ogni scelta conta, ogni enigma risolto è un passo verso la rinascita.
        </Motion.p>

        {/* --- Sezione Timeline Sviluppo Verticale --- */}
        <section class="mt-16 w-full max-w-2xl mx-auto text-left">
          <h2 class="text-2xl font-bold text-biolume/90 mb-6 text-center">Stato dell'Evoluzione</h2>
          <div class="relative">
            {/* La linea di sfondo */}
            <div class="absolute top-0 left-5 w-px h-full bg-starlight/10 -z-10" />
            
            <For each={developmentSteps}>
              {(step, index) => (
                <TimelineItem
                  step={step}
                  index={index()}
                  active={index() <= currentPhaseIndex}
                />
              )}
            </For>
          </div>
        </section>

        {/* --- Call to Action Animato --- */}
        <Motion.div
          class="mt-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1, easing: [0.22, 1, 0.36, 1] }} // Easing "Overshoot"
        >
          <A 
            href="/login" 
            class="py-3 px-8 font-bold text-abyss bg-biolume rounded-md transition-transform hover:scale-105 text-lg shadow-lg shadow-biolume/20"
          >
            Inizia la Rinascita
          </A>
        </Motion.div>
      </main>

      <footer class="absolute bottom-4 text-xs text-starlight/50">
        <p>Un progetto in continua evoluzione.</p>
      </footer>
    </div>
  );
}