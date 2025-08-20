# The 0 Paradox

**Un Sistema Operativo per la Realtà.**

The 0 Paradox non è un semplice gioco. È un'interfaccia, un OS quantistico progettato per un unico scopo: rilevare e stabilizzare le anomalie che minacciano il tessuto del continuum temporale.

Tu non sei un eroe. Sei un **Operatore**. Il tuo terminale è la tua unica connessione a questi "paradossi": eventi storici corrotti che rischiano di collassare. La tua missione è sincronizzarti con i loro echi, analizzare i dati frammentati e ripristinare la coerenza della timeline.

---

## Core Gameplay Loop: Il Protocollo di Sincronizzazione

Ogni paradosso è una missione, presentata come un **Dossier** nel sistema. Il protocollo operativo è rigoroso e sequenziale:

1.  **Selezione del Dossier (`/game/paradoxes`):** L'Operatore visualizza le anomalie attive rilevate dal Paradox OS. Ogni dossier fornisce una localizzazione temporale, un briefing della minaccia e un nome in codice.

2.  **Inizio Sincronizzazione:** Avviando la missione, l'OS imposta il profilo dell'Operatore sul punto di ingresso del paradosso, il primo "step" della sequenza.

3.  **Investigazione Narrativa (`/game/play`):** L'Operatore viene proiettato nell'eco dell'evento. L'interfaccia mostra una narrazione testuale con **keyword interattive**. L'interazione non avviene tramite input testuale, ma analizzando e selezionando gli elementi chiave direttamente nel flusso di dati.

4.  **Analisi su Console:** Ogni interazione produce un output nella **Console Investigativa**. Questi log non solo forniscono la "chiave" per decifrare l'enigma, ma offrono anche un contesto critico e indizi per la sua soluzione logica.

5.  **Decifrazione e Risoluzione:** Una volta ottenuta l'intuizione chiave, il nucleo criptato del paradosso (`core_text`) si rivela. L'Operatore deve usare i **Frammenti di Dati** sbloccati per ricostruire la sequenza corretta e stabilizzare lo step.

6.  **Ricompensa e Progressione:** Ogni paradosso completato ricompensa l'Operatore con **Titoli** e fa progredire la meta-narrativa.

---

## Architettura Tecnica

Il sistema è progettato per essere robusto, scalabile e reattivo.

-   **Frontend:** **SolidStart** (un meta-framework basato su SolidJS). Scelto per la sua reattività granulare e performance superiori, eliminando il bisogno di un Virtual DOM e garantendo un'interazione fluida con l'interfaccia.

-   **Backend & Database (BaaS):** **Supabase**. Sfrutta un database **PostgreSQL** per la persistenza dei dati, con autenticazione, API auto-generate e Row Level Security per una sicurezza a livello di riga.

-   **Struttura Dati Principale:**
    -   `profiles`: Memorizza lo stato di ogni Operatore (progresso, statistiche, ricompense).
    -   `paradox_seasons`: Il catalogo dei paradossi. Ogni riga è un'intera stagione/storia, con il suo briefing e la sua localizzazione temporale.
    -   `paradox_steps`: Contiene i singoli enigmi di ogni stagione. L'uso estensivo di campi `jsonb` permette di definire meccaniche di investigazione e decifrazione complesse e uniche per ogni step, senza alterare lo schema del database.
    -   `game_items` & `inventory`: Struttura pronta per la gestione di asset e ricompense future.

-   **Linguaggio:** **TypeScript** end-to-end per garantire la coerenza e la robustezza dei tipi tra frontend, backend e database.

---

## Visione a Lungo Termine: Da Operatore a Architetto

Il modello a **Stagioni** permette un'espansione narrativa virtualmente infinita. La "Season One: Genesi 0" è solo il primo test del sistema.

La visione futura è un ecosistema interconnesso:
-   **Timeline Globale:** Una tabella `timeline` centrale potrebbe registrare le scelte finali di tutti gli Operatori in ogni paradosso. Le decisioni della community potrebbero sbloccare nuovi paradossi o alterare permanentemente lo stato del mondo di gioco.
-   **Economia di Asset:** I titoli e le ricompense guadagnate sono solo l'inizio. In futuro, potrebbero evolvere in asset unici, con la possibilità di migrare la proprietà on-chain (es. NFT su Layer-2) per garantire una vera e immutabile appartenenza.

The 0 Paradox non è un prodotto finito. È un sistema operativo progettato per evolvere.
**La sincronizzazione è solo l'inizio.**