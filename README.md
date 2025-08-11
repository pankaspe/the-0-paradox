# Bioma Zero - Log di Sviluppo

## Giorno 1: Setup delle Fondamenta dell'Applicazione

Oggi abbiamo costruito la spina dorsale dell'applicazione "Bioma Zero", concentrandoci sulla struttura, la sicurezza e l'esperienza utente di base.

### Stack Tecnologico Impostato
- **Framework:** SolidStart (ultima versione)
- **Styling:** UnoCSS (motore CSS on-demand, alternativo a Tailwind)
- **Backend & Database:** Supabase

### Funzionalità Implementate
1.  **Struttura del Progetto Professionale:**
    -   Impostata una struttura di cartelle chiara che separa la logica di backend (`src/api`), i componenti riutilizzabili (`src/components`), le pagine (`src/routes`) e la logica di base (`src/lib`).

2.  **Ciclo di Autenticazione Completo e Sicuro:**
    -   Implementato un sistema di **registrazione e login con email/password** utilizzando Supabase Auth.
    -   Creato un **middleware di protezione** che:
        -   Impedisce agli utenti non autenticati di accedere a qualsiasi rotta sotto `/game`.
        -   Reindirizza automaticamente gli utenti già loggati dalla pagina di login alla loro dashboard, migliorando la fluidità della navigazione.
    -   Implementata la funzionalità di **Logout**.

3.  **Identità Visiva e Layout:**
    -   Definita una **palette di colori personalizzata** (`abyss`, `starlight`, `biolume`, `ghost`) per dare al gioco un tema unico e bioluminescente.
    -   Creata una **landing page** d'impatto.
    -   Sviluppato un **layout di gioco persistente** per l'area `/game`, con una sidebar di navigazione fissa, che garantisce un'esperienza utente coerente.

4.  **Data Fetching Sicuro (Server-Side):**
    -   Implementato il pattern corretto di SolidStart per il recupero dei dati lato server (`"use server"`), garantendo che i dati sensibili dell'utente vengano recuperati e visualizzati in modo sicuro e performante.

### Obiettivo Raggiunto
Abbiamo un'applicazione "guscio" completamente funzionante, sicura e pronta per essere riempita con le logiche e i contenuti specifici del gioco.