// src/routes/index.tsx

import { A } from "@solidjs/router";
import { type Component, createSignal, createMemo, onMount, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { Motion } from "solid-motionone";
import { IoLanguage } from "solid-icons/io";
import { themeStore, themeStoreActions } from "~/lib/themeStore";
import { IoMoonOutline, IoSunnyOutline } from "solid-icons/io";

// 1. GESTIONE DEI CONTENUTI MULTI-LINGUA
// Centralizziamo tutto il testo qui. Facile da aggiornare e tradurre.
const content = {
  en: {
    title: "The Paradox Zero",
    subtitle: "A single, sequential enigma. Infinitely deep.",
    paragraph1: "This is not a game with levels. It is a single, recursive protocol. An anomaly that unfolds one step at a time. There is no victory, only depth. There is no end, only the next layer of the paradox.",
    paragraph2: "Each step is a self-contained logic gate. Some paths lead forward. Others are recursive loops, designed to test your persistence. The only tool required is your intuition.",
    cta: "Initiate Sequence",
    footer: "The protocol is live. Your terminal is waiting...",
  },
  it: {
    title: "Il Paradosso Zero",
    subtitle: "Un singolo enigma sequenziale. Infinitamente profondo.",
    paragraph1: "Questo non è un gioco a livelli. È un singolo protocollo ricorsivo. Un'anomalia che si svela un passo alla volta. Non c'è vittoria, solo profondità. Non c'è una fine, solo il prossimo strato del paradosso.",
    paragraph2: "Ogni step è una porta logica auto-conclusa. Alcuni percorsi conducono avanti. Altri sono loop ricorsivi, progettati per testare la tua persistenza. L'unico strumento richiesto è la tua intuizione.",
    cta: "Inizia la Sequenza",
    footer: "Il protocollo è attivo. Il tuo terminale è in attesa...",
  }
};

/**
 * Componente per lo sfondo animato.
 * Ora usa i colori del tema, quindi reagisce allo switch dark/light.
 */
const BackgroundGlows: Component = () => {
  return (
    <div class="absolute inset-0 -z-10 overflow-hidden bg-page transition-colors duration-500">
      <Motion.div
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          direction: 'alternate', // Sostituisce repeatType: 'reverse'
          easing: 'ease-in-out'    // Usiamo un easing più morbido
        }}
      />
      <Motion.div
        transition={{ 
          duration: 50, 
          repeat: Infinity, 
          direction: 'alternate', // Sostituisce repeatType: 'reverse'
          easing: 'ease-in-out',
          delay: 5
        }}
      />
    </div>
  );
};

/**
 * Homepage di The Paradox Zero.
 * Completamente ridisegnata, bilingue e themabile.
 */
export default function HomePage() {
  // 2. LOGICA PER LA GESTIONE DELLA LINGUA
  const [lang, setLang] = createSignal<'en' | 'it'>('en');
  
  // All'avvio, imposta la lingua in base a quella del browser
  onMount(() => {
    if (!isServer) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'it') {
        setLang('it');
      }
    }
  });
  
  // 't' è un segnale derivato che contiene sempre il testo nella lingua corretta
  const t = createMemo(() => content[lang()]);

  return (
    <div class="h-screen w-screen overflow-hidden relative font-sans text-text-main">
      <BackgroundGlows />

      {/* 3. SWITCHER PER LINGUA E TEMA */}
      <div class="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setLang(l => l === 'en' ? 'it' : 'en')}
          class="btn-icon"
          title="Change Language / Cambia Lingua"
        >
          <IoLanguage />
        </button>
        {/* Usiamo lo stesso switcher della Topbar per coerenza */}
        <button
          onClick={() => themeStoreActions.toggleTheme()}
          class="btn-icon"
          title="Toggle Theme"
        >
          <Show when={themeStore.theme === 'dark'} fallback={<IoSunnyOutline />}>
            <IoMoonOutline />
          </Show>
        </button>
      </div>

      <main class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        
        <Motion.div
          class="flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 class="font-mono text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-text-main to-text-muted">
            {t().title}
          </h1>
          <p class="mt-2 font-mono text-lg text-primary">
            {t().subtitle}
          </p>
        </Motion.div>

        <Motion.div
          class="max-w-2xl mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        >
          <p class="text-lg text-text-main/90 leading-relaxed">
            {t().paragraph1}
          </p>
          <p class="mt-4 text-md text-text-muted leading-relaxed">
            {t().paragraph2}
          </p>
        </Motion.div>

        <Motion.div
          class="mt-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1, easing: [0.16, 1, 0.3, 1] }}
        >
          <A 
            href="/login" 
            class="py-3 px-10 font-bold font-sans text-lg bg-primary text-white rounded-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:bg-primary-hover focus:outline-none focus:ring-4 ring-primary/50"
          >
            {t().cta}
          </A>
        </Motion.div>
      </main>

      <footer class="absolute bottom-6 text-center w-full">
        <p class="text-xs text-text-muted/50 font-mono animate-pulse">
          {t().footer}
        </p>
      </footer>
    </div>
  );
}