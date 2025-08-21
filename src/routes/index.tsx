import { A } from "@solidjs/router";
import { type Component, Show, For, createSignal, onMount } from "solid-js";
import { Motion } from "solid-motionone";
import { themeStore, themeStoreActions } from "~/lib/themeStore";
import { IoMoonOutline, IoSunnyOutline, IoHardwareChip, IoCloud, IoColorPalette, IoInfinite } from "solid-icons/io";

// Contenuti testuali, divisi per sezione
const content = {
  hero: {
    title: "PARADOX 0",
    subtitle: "Interfaccia di Stabilizzazione Temporale",
    cta: "Accedi al Terminale",
  },
  intro: {
    title: "Tu Sei l'Operatore",
    paragraph1: "Questo non è un gioco in cui interpreti un eroe. Tu sei un Operatore. Attraverso questa interfaccia, il Paradox OS, il tuo compito è analizzare e risolvere le anomalie temporali che minacciano il tessuto della realtà. Il tuo intelletto è lo strumento. L'intuizione, la tua guida.",
    paragraph2: "Ogni Paradosso è un dossier: un evento storico corrotto, un'eco da stabilizzare. Affronterai enigmi narrativi, decifrerai sequenze e interagirai con i frammenti di storie perdute per ripristinare la coerenza della timeline."
  },
  nerdZone: {
    title: "[ INFO KERNEL ]",
    subtitle: "Questo progetto è un esperimento di co-creazione tra Sviluppatore e Intelligenza Artificiale. Il kernel è stato costruito usando un stack reattivo e serverless, con Gemini come partner di programmazione per la generazione di logica, contenuti e soluzioni.",
    tech: [
      { name: "SolidStart", icon: IoHardwareChip, desc: "Framework reattivo e performante. L'interfaccia non usa un Virtual DOM, ma compila in codice nativo ottimizzato, garantendo una reattività granulare e istantanea, ideale per un'esperienza da OS.", color: "text-sky-400" },
      { name: "Supabase", icon: IoCloud, desc: "Backend-as-a-Service basato su PostgreSQL. Gestisce l'autenticazione, il database, lo storage e i cron job per la rigenerazione del Focus. L'uso di RLS garantisce una sicurezza a livello di riga.", color: "text-green-400" },
      { name: "UnoCSS", icon: IoColorPalette, desc: "Motore CSS atomico on-demand. Invece di un grande file CSS, le classi vengono generate al volo solo quando usate, mantenendo il bundle leggero e le performance al massimo.", color: "text-purple-400" },
      { name: "Gemini", icon: IoInfinite, desc: "LLM avanzato di Google, usato come assistente alla programmazione per generare codice, refactoring, creazione di contenuti narrativi e debugging. Un vero partner nello sviluppo procedurale.", color: "text-red-400" }
    ]
  },
  footer: {
    text: "Protocollo Attivo. In attesa di input..."
  }
};

const AnimatedBackground: Component = () => {
  return (
    <div class="fixed inset-0 -z-10 overflow-hidden bg-page transition-colors duration-500">
      <div class="animated-grid" />
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

const InViewSection: Component<{ children: any, class?: string, delay?: number }> = (props) => {
  let el: HTMLDivElement | undefined;
  const [isVisible, setIsVisible] = createSignal(false);

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el!);
        }
      },
      { threshold: 0.2 }
    );

    if (el) {
      observer.observe(el);
    }
  });

  return (
    <div ref={el} class={props.class}>
      <Show when={isVisible()}>
        <Motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: props.delay || 0 }}
        >
          {props.children}
        </Motion.div>
      </Show>
    </div>
  );
};

export default function HomePage() {
  return (
    <>
      <style>{`
        .animated-grid {
          width: 100%; /* Corretto da 100vw */
          height: 100%; /* Corretto da 100vh */
          position: fixed;
          top: 0;
          left: 0;
          background-image:
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: pan 60s linear infinite;
          z-index: -1;
        }
        @keyframes pan {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
      `}</style>
      
      {/* --- CORREZIONE PRINCIPALE QUI --- */}
      {/* Sostituito 'w-screen' con 'w-full' per rispettare la larghezza del genitore (body) */}
      <div class="w-full min-h-screen font-mono text-text-main bg-page overflow-x-hidden">
        <AnimatedBackground />

        <div class="fixed top-4 right-4 z-50">
          <button 
            onClick={() => themeStoreActions.toggleTheme()} 
            class="p-2 rounded-full text-text-main/80 bg-surface/50 backdrop-blur-sm hover:bg-surface/80 transition-colors" 
            title="Cambia Tema"
          >
            <Show when={themeStore.theme === 'dark'} fallback={<IoSunnyOutline size={4} />}>
              <IoMoonOutline size={4} />
            </Show>
          </button>
        </div>

        <section class="h-screen w-full flex flex-col items-center justify-center text-center p-6 relative">
          <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <h1 class="text-6xl md:text-8xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-br from-text-title to-text-muted">{content.hero.title}</h1>
            <p class="mt-2 text-lg text-primary flex items-center justify-center">{content.hero.subtitle}<span class="inline-block w-2.5 h-5 bg-primary animate-pulse ml-2" /></p>
          </Motion.div>
          <Motion.div class="mt-16" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.5, easing: [0.16, 1, 0.3, 1] }}>
            <A href="/login" class="py-3 px-10 font-bold text-lg bg-primary text-white rounded-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:bg-primary-hover">{content.hero.cta}</A>
          </Motion.div>
          <div class="absolute bottom-8 text-xs text-text-muted/50 animate-pulse">Scorri per analizzare il protocollo</div>
        </section>

        <InViewSection class="w-full max-w-4xl mx-auto py-24 px-6 text-center">
          <h2 class="text-4xl font-bold text-text-title">{content.intro.title}</h2>
          <p class="mt-8 text-lg text-text-main/90 leading-relaxed">{content.intro.paragraph1}</p>
          <p class="mt-4 text-md text-text-muted leading-relaxed">{content.intro.paragraph2}</p>
        </InViewSection>

        <section class="w-full bg-surface/50 backdrop-blur-sm py-24">
          <div class="max-w-5xl mx-auto px-6">
            <InViewSection class="text-center">
              <h2 class="text-3xl font-bold text-primary">{content.nerdZone.title}</h2>
              <p class="mt-4 max-w-2xl mx-auto text-sm text-text-muted">{content.nerdZone.subtitle}</p>
            </InViewSection>
            <div class="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <For each={content.nerdZone.tech}>
                {(techItem, i) => (
                  <InViewSection delay={i() * 0.1}>
                    <div class="flex items-center gap-3">
                      <techItem.icon size={24} class={techItem.color} />
                      <h3 class="font-bold text-lg text-text-main">{techItem.name}</h3>
                    </div>
                    <p class="mt-3 text-sm text-text-main/80 leading-relaxed">{techItem.desc}</p>
                  </InViewSection>
                )}
              </For>
            </div>
          </div>
        </section>

        <footer class="text-center py-12 px-6">
          <p class="text-xs text-text-muted/50">{content.footer.text}</p>
        </footer>
      </div>
    </>
  );
}