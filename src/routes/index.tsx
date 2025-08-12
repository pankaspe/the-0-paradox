// src/routes/index.tsx
import { A } from "@solidjs/router";
import { For, type Component } from "solid-js";
import { Motion } from "solid-motionone";

// Importiamo le icone che ci serviranno
import {
  FaSolidLightbulb,
  FaSolidCode,
  FaSolidShieldVirus,
  FaSolidDiagramProject,
  FaSolidRocket,
  FaSolidSeedling,
  FaSolidBookOpen,
} from "solid-icons/fa";
import { CgGames } from "solid-icons/cg";

// Dati della timeline, ora più dettagliati e con una visione futura
const developmentSteps = [
  {
    name: "Fase 0: Il Concetto",
    icon: FaSolidLightbulb,
    description: "La scintilla iniziale: un gioco narrativo basato sull'evoluzione e la rinascita, senza combattimenti.",
  },
  {
    name: "Fase 1: Prototipo",
    icon: FaSolidCode,
    description: "Creazione di un proof-of-concept per validare le meccaniche di base della narrazione a bivi e del gameplay basato su scelte.",
  },
  {
    name: "Fase 2: Test e Analisi",
    icon: FaSolidShieldVirus,
    description: "Raccolta di feedback critici e analisi approfondita dei punti deboli del prototipo, evidenziando la necessità di una base più solida.",
  },
  {
    name: "Fase 3: Riprogettazione",
    icon: FaSolidDiagramProject,
    description: "Una completa riprogettazione dell'architettura software per garantire scalabilità, sicurezza e performance di alto livello.",
  },
  {
    name: "Fase 4: Architettura e UI",
    icon: FaSolidRocket,
    description: "Implementazione delle fondamenta con SolidStart e Supabase. Costruzione del sistema di autenticazione, dei layout responsive e dello store dati globale.",
  },
  {
    name: "Fase 5: Core Gameplay Loop (In Corso)",
    icon: CgGames,
    description: "Sviluppo del motore delle Cronache, dell'inventario, della personalizzazione del Bioma e delle prime meccaniche di gioco.",
  },
  {
    name: "Fase 6: Beta e Contenuti",
    icon: FaSolidBookOpen,
    description: "Creazione delle prime Cronache complete, bilanciamento delle ricompense e rilascio di una versione Beta a inviti.",
  },
  {
    name: "Fase 7: Nascita",
    icon: FaSolidSeedling,
    description: "Rilascio della prima versione Alpha pubblica di Bioma Zero, aperta a tutti gli Eredi.",
  },
];
const currentPhaseIndex = 4; // Siamo alla fase 4 "Architettura e UI"

// --- ELIMINATA LA PRIMA DICHIARAZIONE DI TimelineItem DA QUI ---

export default function HomePage() {
  const bgStyle = {
    "background-color": "#0D1B2A", // abyss
    "background-image": `
      radial-gradient(circle at 15% 20%, hsl(158 72% 66% / 0.1), transparent 25%),
      radial-gradient(circle at 85% 70%, hsl(231 48% 68% / 0.1), transparent 25%),
      radial-gradient(circle at 50% 50%, hsl(158 72% 66% / 0.05), transparent 15%)
    `
  };

  return (
    <div class="min-h-screen text-ghost flex flex-col items-center justify-center text-center p-6 overflow-x-hidden" style={bgStyle}>
      <main class="w-full max-w-4xl">
        <Motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, easing: "ease-out" }}
        >
          <h1 class="text-5xl md:text-7xl font-bold bg-gradient-to-r from-glow-start to-glow-end bg-clip-text text-transparent animate-gradient-text" style={{"background-size": "200% 200%"}}>
            Bioma Zero
          </h1>
          <Motion.p
            class="mt-4 text-lg md:text-xl text-ghost/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Un'avventura interattiva dove orchestrare la rinascita di un mondo.
          </Motion.p>
        </Motion.div>

        <Motion.p
          class="mt-10 max-w-3xl mx-auto text-base text-ghost/90 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          In un universo spento, tu sei l'Erede, l'unica speranza per riaccendere la scintilla della vita. "Bioma Zero" è un viaggio narrativo, non un gioco di combattimento. Attraverso la risoluzione delle **Cronache** – enigmi profondi e storie a bivi – darai forma al tuo bioma personale, sbloccando nuove creature, piante e paesaggi. Ogni scelta conta, ogni enigma risolto è un passo verso la rinascita.
        </Motion.p>

        <section class="mt-16 w-full max-w-2xl mx-auto text-left">
          <h2 class="text-2xl font-bold text-biolume/90 mb-8 text-center">Stato dell'Evoluzione</h2>
          <For each={developmentSteps}>
            {(step, index) => (
              <TimelineItem
                step={step}
                index={index()}
                active={index() < currentPhaseIndex}
                isCurrent={index() === currentPhaseIndex}
              />
            )}
          </For>
        </section>

        <Motion.div
          class="mt-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1, easing: [0.22, 1, 0.36, 1] }}
        >
          <A 
            href="/login" 
            class="py-3 px-8 font-bold text-abyss bg-biolume rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-biolume/30 text-lg shadow-lg shadow-biolume/20"
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

// Questa è l'UNICA dichiarazione di TimelineItem, quella corretta e completa.
const TimelineItem: Component<{ step: any; index: number; active: boolean; isCurrent: boolean }> = (props) => {
  const isActiveOrCurrent = props.active || props.isCurrent;
  return (
    <div class="flex">
      <div class="flex flex-col items-center mr-6">
        <Motion.div
          class={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors duration-500 ${
            isActiveOrCurrent ? "border-biolume bg-biolume/20" : "border-starlight/20"
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: props.index * 0.1, easing: "ease-in-out" }}
        >
          {props.isCurrent && <span class="absolute h-full w-full rounded-full bg-biolume animate-ping opacity-50"></span>}
          <props.step.icon class={`w-6 h-6 transition-colors duration-500 ${ isActiveOrCurrent ? "text-biolume" : "text-starlight/60" }`} />
        </Motion.div>
        <div class="relative w-px flex-1 bg-starlight/20">
          <Motion.div 
            class="absolute top-0 left-0 w-full bg-biolume"
            initial={{ height: "0%" }}
            animate={{ height: props.active ? "100%" : "0%" }}
            transition={{ duration: 0.5, delay: 0.2 + props.index * 0.1, easing: "ease-in-out" }}
          />
        </div>
      </div>
      <Motion.div
        class="pb-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: props.index * 0.15, easing: "ease-out" }}
      >
        <p class={`mb-1 text-lg font-semibold transition-colors duration-500 ${ isActiveOrCurrent ? "text-ghost" : "text-ghost/50" }`}>
          {props.step.name}
        </p>
        <p class="text-sm text-ghost/70 leading-relaxed">{props.step.description}</p>
      </Motion.div>
    </div>
  );
};