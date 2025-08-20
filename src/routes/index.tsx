import { A } from "@solidjs/router";
import { type Component, Show, For } from "solid-js";
import { Motion } from "solid-motionone";
import { themeStore, themeStoreActions } from "~/lib/themeStore";
import { IoMoonOutline, IoSunnyOutline } from "solid-icons/io";

// 1. Contenuti in Italiano, aggiornati per la nuova lore e la citazione.
const content = {
  title: "PARADOX OS",
  subtitle: "Interfaccia di Stabilizzazione Temporale",
  paragraph1: "Non sei un eroe. Sei un Operatore. Hai il compito di analizzare e risolvere le anomalie che minacciano il tessuto della realtà.",
  paragraph2: "Ogni Paradosso è un dossier: un evento storico corrotto, un'eco da stabilizzare. Il tuo intelletto è lo strumento. L'intuizione, la tua guida.",
  cta: "Accedi al Terminale",
  footer: "Protocollo Attivo. Connessione Stabile.",
};

// NUOVO: Oggetto per la citazione e la spiegazione di Gemini
const quote = {
  text: "Questo non è un semplice progetto, ma un esperimento. The 0 Paradox è il risultato di una simbiosi creativa tra l'intelletto humano, come architetto e supervisore e Gemini, una IA multimodale e LLM (Large Language Model) avanzato di Google, come programmatore. Un kernel interamente scritto dall'intelligenza artificiale per un'esperienza di sviluppo procedurale, infinita e coerente.",
  author: "Andrea",
};

// 2. NUOVO: Componente per lo Sfondo Animato
// Combina un pattern a griglia con i bagliori preesistenti per un look hi-tech.
const AnimatedBackground: Component = () => {
  return (
    <div class="absolute inset-0 -z-10 overflow-hidden bg-page transition-colors duration-500">
      {/* Griglia animata in CSS puro */}
      <div class="animated-grid" />
      
      {/* Bagliori colorati (mantenuti dalla versione precedente) */}
      <Motion.div
        class="absolute top-0 left-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [-100, 200, -100], y: [50, 250, 50] }}
        transition={{ duration: 40, repeat: Infinity, direction: 'alternate', easing: 'ease-in-out' }}
      />
      <Motion.div
        class="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ x: [100, -200, 100], y: [-50, -250, -50] }}
        transition={{ duration: 50, repeat: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: 5 }}
      />
    </div>
  );
};

// 3. NUOVO: Componente per animare il testo lettera per lettera
// Rende l'apparizione del testo molto più dinamica.
const AnimatedText: Component<{ text: string, class?: string }> = (props) => {
  const letters = props.text.split("");
  return (
    <h1 class={props.class}>
      <For each={letters}>
        {(letter, i) => (
          <Motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: i() * 0.05, easing: "ease-in-out" }}
          >
            {letter === " " ? "\u00A0" : letter}
          </Motion.span>
        )}
      </For>
    </h1>
  );
};

// NUOVO: Componente per la citazione animata
const Quote: Component<{ text: string, author: string }> = (props) => {
  return (
    <Motion.div
      class="max-w-2xl mt-12 text-md text-text-muted/80 leading-relaxed font-italic"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay: 1.5 }}
    >
      <p>"{props.text}"</p>
      <p class="mt-2 text-sm text-text-muted/60">— {props.author}</p>
    </Motion.div>
  );
};


/**
 * Homepage di The 0 Paradox.
 * Versione 2.0: Dinamica, immersiva e tematica.
 */
export default function HomePage() {
  return (
    <>
      {/* 4. Stili CSS personalizzati per griglia, cursore e glitch */}
      <style>
        {`
          .animated-grid {
            width: 100vw;
            height: 100vh;
            position: absolute;
            background-image:
              linear-gradient(to right, var(--color-border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
            background-size: 40px 40px;
            animation: pan 60s linear infinite;
          }
          @keyframes pan {
            0% { background-position: 0 0; }
            100% { background-position: 40px 40px; }
          }
          .blinking-cursor {
            display: inline-block;
            width: 10px;
            height: 1.25rem; /* altezza basata sulla classe text-lg */
            background-color: var(--color-primary);
            animation: blink 1s step-end infinite;
            margin-left: 8px;
            transform: translateY(4px);
          }
          @keyframes blink {
            50% { opacity: 0; }
          }
          .glitch-hover:hover {
            animation: glitch 0.3s linear;
          }
          @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-3px, 3px); }
            40% { transform: translate(-3px, -3px); }
            60% { transform: translate(3px, 3px); }
            80% { transform: translate(3px, -3px); }
            100% { transform: translate(0); }
          }
        `}
      </style>

      <div class="h-screen w-screen overflow-hidden relative font-mono text-text-main">
        <AnimatedBackground />

        {/* Switcher del Tema */}
        <div class="absolute top-4 right-4 z-10">
          <button
            onClick={() => themeStoreActions.toggleTheme()}
            class="p-2 rounded-full text-text-main/80 hover:bg-surface/50 transition-colors"
            title="Cambia Tema"
          >
            <Show when={themeStore.theme === 'dark'} fallback={<IoSunnyOutline size={4} />}>
              <IoMoonOutline size={4} />
            </Show>
          </button>
        </div>

        <main class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          
          <div class="flex flex-col items-center">
            <AnimatedText 
              text={content.title}
              class="text-5xl md:text-7xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-br from-text-main to-text-muted glitch-hover"
            />
            <Motion.div 
              class="flex items-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: content.title.length * 0.05 + 0.5 }}
            >
              <p class="text-lg text-primary">
                {content.subtitle}
              </p>
              <span class="blinking-cursor" />
            </Motion.div>
          </div>

          {/* NUOVO: Inserimento della citazione */}
          <Quote text={quote.text} author={quote.author} />

          <Motion.div
            class="max-w-2xl mt-12 text-lg text-text-main/90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 2.5 }}
          >
            <p>{content.paragraph1}</p>
            <p class="mt-4 text-md text-text-muted">{content.paragraph2}</p>
          </Motion.div>

          <Motion.div
            class="mt-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 3, easing: [0.16, 1, 0.3, 1] }}
          >
            <A 
              href="/login" 
              class="py-3 px-10 font-bold text-lg bg-primary text-white rounded-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:bg-primary-hover focus:outline-none focus:ring-4 ring-primary/50"
            >
              {content.cta}
            </A>
          </Motion.div>
        </main>

        <footer class="absolute bottom-6 text-center w-full">
          <Motion.p
            class="text-xs text-text-muted/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 3.5 }}
          >
            {content.footer}
          </Motion.p>
        </footer>
      </div>
    </>
  );
}