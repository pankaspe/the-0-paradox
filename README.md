# Bioma Zero - Log di Sviluppo

"Bioma Zero" è un'avventura narrativa interattiva dove i giocatori hanno il compito di far rifiorire un mondo dimenticato attraverso la risoluzione di enigmi e scelte significative.

## Stato Attuale: Prototipo Funzionante (MVP)

Abbiamo completato la fase iniziale di sviluppo, creando una base applicativa robusta, sicura e pronta per l'implementazione delle logiche di gioco.

### Stack Tecnologico
- **Framework:** [SolidStart](https://www.solidjs.com/guides/getting-started) (ultima versione)
- **Styling:** [UnoCSS](https://unocss.dev/) (motore CSS on-demand, alternativo a Tailwind)
- **Animazioni:** [Motion One](https://motion.dev/) (libreria di animazioni performante)
- **Icone:** [Solid Icons](https://solid-icons.vercel.app/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Deployment:** [Vercel](https://vercel.com/)

### Funzionalità Implementate
1.  **Struttura del Progetto Professionale:**
    -   Impostata una struttura di cartelle chiara e scalabile (`api`, `components`, `routes`, `lib`).
    -   Refactoring della logica di accesso ai dati (`game-actions`) e dei componenti UI per la massima manutenibilità.

2.  **Ciclo di Autenticazione Completo e Sicuro:**
    -   Implementato un sistema di **registrazione e login con email/password** utilizzando Supabase Auth.
    -   Creato un **middleware di protezione** per le rotte `/game` e una logica di reindirizzamento lato client per un'esperienza utente fluida.
    -   Implementata la funzionalità di **Logout**.

3.  **Architettura del Database e Dati di Gioco:**
    -   Progettato e implementato lo schema del database con le tabelle `profiles` e `planets`.
    -   Creati **trigger SQL automatici** su Supabase per popolare il profilo e il primo pianeta di ogni nuovo utente al momento della registrazione.

4.  **UI/UX e Data Fetching:**
    -   Sviluppato un **layout di gioco persistente** per l'area `/game` con una sidebar di navigazione.
    *   Implementato il data fetching server-side con `"use server"` per recuperare e visualizzare in modo sicuro i dati del giocatore (Soul Fragments, Energia, Età del Pianeta) sulla dashboard.
    *   Integrato un **loader di caricamento (`<Suspense>`)** a tema per migliorare l'esperienza durante il caricamento dei dati iniziali.
    -   Aggiunte **animazioni fluide (`Motion One`)** all'interfaccia per un look & feel dinamico e professionale.

### Obiettivo Raggiunto
L'applicazione è un "guscio" completamente funzionante, con un ciclo di autenticazione robusto e una connessione live al database di gioco. La base è pronta per essere estesa con le funzionalità principali di "Bioma Zero".