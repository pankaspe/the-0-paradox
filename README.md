# Bioma Zero

![alt text](image.png)

Non è un gioco. È un **kernel** vivo.  
Ogni utente ha un **bioma**: un microcosmo autonomo, persistente, incapsulato in una **galassia generata proceduralmente**.  
Seed, rumore perlin, entropia controllata. Nessun bioma uguale a un altro. Tutto calcolabile, niente predefinito.

---

## Architettura

Il **kernel** è stato rifattorizzato per la mutazione dinamica dei moduli di gioco.  
Cronache in formato **JSON manifest**, orchestrate via Supabase Storage.  
Ogni nodo narrativo = stato del kernel.  
Condizioni (`if_state`, `if_flag`) → Mutazioni (`set_flag`, `apply_delta`).  
Niente hardcode. Aggiornamenti in tempo reale, push di nuovi asset, zero downtime.

---

## Persistenza e Sicurezza

- **PostgreSQL** con campi `jsonb` per snapshot dello stato.
- Tabelle primarie:
  - `active_narratives` — stato runtime
  - `narrative_records` — log permanente
- **Row Level Security** attiva.
- Autenticazione a più livelli. Nessun token in chiaro.

---

## Generazione Contenuti

**LLM Gemini**, modello multimodale di nuova generazione.  
Architettura *Mixture-of-Experts*, routing dinamico dei token, gestione context window estesa.  
Prompt strutturati → output narrativo coerente, semantica preservata.  
Risposte validate, normalizzate, indicizzate per retrieval veloce.

Ogni cronaca produce:
- **Valuta di progressione** (`Soul Fragments`)
- **Metriche temporali** (`Bioma Age`)
- **Asset rari** (avatar hash univoco)

---

## Frontend e API

- **SolidJS**: reattività fine-grained, riduzione latenza rispetto al virtual DOM tradizionale.
- Backend real-time su Supabase.
- Endpoints:
  - `/api/game/chronicles`
  - `/api/game/chronicles/:id`
  - `/api/game/chronicles/:id/progress`

---

## Visione

Ecosistema distribuito, interconnesso, in cui le scelte locali impattano la galassia globale.  
Avatar oggi centralizzati, domani **NFT Layer-2**, proprietà on-chain, tracciabilità immutabile.  

Non è un engine statico.  
È un kernel che evolve.  
E **Gemini** ne scrive la storia.
