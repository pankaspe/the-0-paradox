import { For, type Component } from "solid-js";
import { Motion } from "solid-motionone"; // Usiamo solo il componente Motion

/**
 * Componente per una sezione di contenuto.
 * Accetta un 'delay' per creare un'animazione a cascata.
 */
const InfoSection: Component<{ title: string; children: any; delay: number }> = (props) => {
  return (
    // Questo è lo stesso pattern del tuo SideNav: <Motion.div> con le props di animazione
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, easing: "ease-in-out", delay: props.delay }}
      class="space-y-6"
    >
      <h2 class="text-2xl font-semibold text-starlight border-b border-starlight/20 pb-2">
        {props.title}
      </h2>
      <div class="space-y-8">{props.children}</div>
    </Motion.div>
  );
};

/**
 * Componente per una sotto-sezione, senza animazioni.
 */
const SubSection: Component<{ title: string; children: any }> = (props) => {
  return (
    <div class="pl-4 border-l-2 border-biolume/30 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 bg-biolume rounded-full" />
        <h3 class="text-lg font-medium text-ghost">{props.title}</h3>
      </div>
      <div class="text-ghost/80 leading-relaxed space-y-4">{props.children}</div>
    </div>
  );
};

/**
 * Pagina "About" che descrive l'architettura del progetto Bioma Zero.
 */
export default function AboutPage() {
  const sections = {
    architecture: [
      {
        title: "1.1. Framework & Rendering Model",
        content: [
          "<strong>Core:</strong> SolidStart, basato su SolidJS.",
          "<strong>Motivazione:</strong> Performance. Il modello di reattività granulare di SolidJS bypassa la necessità di un Virtual DOM. Le mutazioni di stato si traducono in operazioni di patch dirette e chirurgiche sul DOM, eliminando il sovraccarico computazionale del 'diffing'. La latenza percepita dall'utente è minimizzata.",
          "<strong>Comunicazione Client-Server:</strong> Il sistema si basa pesantemente sulle Server Functions (`'use server'`). Le chiamate asincrone e le mutazioni sono gestite nativamente dal framework, astraendo la necessità di implementare un'API REST/GraphQL esplicita."
        ]
      },
      {
        title: "1.2. Backend & Persistenza Dati",
        content: [
          "<strong>Provider:</strong> Supabase.",
          "<strong>Componenti Utilizzati:</strong> Database (PostgreSQL), Autenticazione (JWT), Sicurezza (RLS), Storage e Automazione (Trigger plpgsql). L'architettura 'zero-trust' previene accessi non autorizzati ai dati a livello di riga.",
        ]
      },
      {
        title: "1.3. Gestione dello Stato (Client-Side)",
        content: [
          "<strong>Pattern:</strong> Store Globale Reattivo (`createStore`) come unica fonte di verità (SSoT).",
          "<strong>Flusso Dati:</strong> Idratazione iniziale unica, consumo reattivo da parte dei componenti e mutazioni tramite pattern di aggiornamento ottimistico per un feedback UI immediato, con rollback in caso di fallimento della persistenza."
        ]
      },
       {
        title: "1.4. Interfaccia e Stile",
        content: [
            "<strong>CSS Engine:</strong> UnoCSS, scelto per la sua natura 'on-demand' che genera solo le classi di utilità effettivamente utilizzate, risultando in un payload CSS minimo.",
            "<strong>Animazioni:</strong> `solid-motionone`. Un wrapper specifico per SolidJS che fornisce primitive dichiarative per l'animazione, sfruttando API performanti come la Web Animations API."
        ]
      }
    ],
    implementation: [
        {
            title: "2.1. Moduli Funzionali",
            content: [
                "<strong>Autenticazione:</strong> Ciclo completo di registrazione/login/logout via email/password. Sessioni gestite tramite cookie `httpOnly`.",
                "<strong>Routing & Sicurezza:</strong> Routing basato su file con middleware server-side per la validazione delle sessioni su rotte protette.",
                "<strong>Layout:</strong> UI responsive con SideNav (desktop) e BottomNav (mobile), e una Topbar 'fluttuante' con dati reattivi.",
                "<strong>Interattività:</strong> Modifica 'in-place' dei dati utente nella pagina profilo, collegata al sistema di aggiornamento ottimistico."
            ]
        },
        {
            title: "2.2. Struttura del Codice",
            content: [
                "`src/routes/`: Mappatura 1:1 delle rotte dell'applicazione.",
                "`src/lib/game-actions.ts`: Unico punto di accesso per tutte le server functions.",
                "`src/lib/gameStore.ts`: Definizione, stato e azioni dello store globale.",
                "`src/components/`: Componenti UI riutilizzabili, atomici e composti.",
                "`src/types/`: Definizioni TypeScript, incluse quelle auto-generate da Supabase CLI."
            ]
        }
    ]
  };

  return (
    <div class="max-w-4xl">    
      {/* --- HEADER --- */}
      <Motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, easing: "ease-in-out", delay: 0 }}
        class="space-y-4"
      >
        <h1 class="text-4xl font-bold text-biolume">Bioma Zero - Rapporto di Sistema</h1>
        <p class="text-ghost/60">LOG: Stato Attuale del Sistema. Piattaforma MVP stabile.</p>
      </Motion.div>

      {/* --- SEZIONI --- */}
      <InfoSection title="1. Architettura del Sistema" delay={0.2}>
        <For each={sections.architecture}>
          {(item) => (
            <SubSection title={item.title}>
              <For each={item.content}>
                {(line) => <p innerHTML={line}></p>}
              </For>
            </SubSection>
          )}
        </For>
      </InfoSection>

      <InfoSection title="2. Stato di Implementazione" delay={0.3}>
        <For each={sections.implementation}>
          {(item) => (
            <SubSection title={item.title}>
               <For each={item.content}>
                {(line) => <p innerHTML={line}></p>}
              </For>
            </SubSection>
          )}
        </For>
      </InfoSection>
    </div>
  );
}