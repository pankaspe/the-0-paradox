# Bioma Zero

![alt text](image.png)

Un sistema. Non solo un gioco.

Ogni utente ottiene un **bioma** personale: un’istanza persistente all’interno di una **galassia generata proceduralmente**.  
La mappa non è predefinita: *seed-based noise*, coordinate deterministiche, ogni pianeta replicabile ma irripetibile.

---

## Architettura

Il **kernel** è stato rifattorizzato per un approccio modulare.  
Le cronache sono **manifest JSON** serviti da *Supabase Storage*, composti da atti e nodi narrativi.  
Ogni nodo è uno **stato di sistema** con condizioni (`has_variable`, `has_state`) e mutazioni (`set_variable`, `apply_state`).  
Nessun dato narrativo è hardcoded. Gli aggiornamenti avvengono senza redeploy: push di nuovi asset, propagazione immediata.

---

## Persistenza e Sicurezza

- **PostgreSQL** con campi `jsonb` per lo stato attivo.
- Tabelle chiave:
  - `active_narratives`: stato in corso.
  - `narrative_records`: cronologia permanente.
- **Row Level Security** abilitata.
- Nessun accesso non autorizzato.

---

## Generazione Contenuti

**Gemini AI**, modello multimodale con *Mixture-of-Experts*.  
Context window estesa, output coerente e tematico.  
I prompt vengono forniti in formato strutturato; la risposta è filtrata, validata e indicizzata semanticamente.

Ogni cronaca restituisce:
- **Valuta di progressione** (`Soul Fragments`)
- **Metriche temporali** (`Anni Bioma`)
- **Asset rari** (avatar con hash univoco)

---

## Frontend e API

- **SolidJS** per reattività fine-grained, evitando overhead del virtual DOM.
- **Supabase** come backend in tempo reale.
- Endpoints principali:
  - `/api/game/chronicles`
  - `/api/game/chronicles/:id`
  - `/api/game/chronicles/:id/progress`

---

## Visione

Un **ecosistema distribuito** dove ogni scelta locale modifica l’equilibrio globale.  
Gli avatar sono centralizzati, ma predisposti per futura migrazione **Layer-2 NFT**: proprietà on-chain, tracciabilità immutabile.

Non è un semplice ambiente interattivo.  
È un **sistema vivo**, in continua mutazione, dove le regole possono cambiare… silenziosamente.
