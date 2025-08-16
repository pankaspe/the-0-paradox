// scripts/seed.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

// Carica le variabili d'ambiente (SUPABASE_URL, SUPABASE_SERVICE_KEY)
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Usa la Service Key!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Key not found in .env file.");
}

// Inizializza il client di Supabase con i privilegi di amministratore
// Questo ci permette di bypassare la RLS per inserire i dati.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Definiamo dei tipi per il nostro file JSON per avere l'autocompletamento e la sicurezza.
interface Outcome {
  type: 'MODIFY_PARAM' | 'GAIN_TRAIT';
  param?: 'vitality' | 'fertility' | 'resistance' | 'adaptability' | 'energy' | 'bioma_age';
  value?: number;
  traitId?: string;
}

interface Choice {
  choiceId: string;
  text: string;
  feedbackNarrative: string;
  outcomes: Outcome[];
}

interface EventFile {
  eventId: string;
  era: number;
  narrative: string;
  entryConditions: object | null;
  choices: Choice[];
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Definisci il percorso della cartella dei contenuti
    const contentDir = path.join(process.cwd(), 'content', 'era1');
    const files = await fs.readdir(contentDir);

    // Inseriamo prima i tratti di base che useremo nei nostri file JSON
    // `onConflict: 'id'` dice a Supabase: se un tratto con questo id esiste già, ignoralo.
    console.log('Seeding base traits...');
    const { error: traitsError } = await supabase.from('traits').insert([
      { id: 'harmonious', description: 'Tende all\'equilibrio e alla stabilità.' },
      { id: 'defiant', description: 'Si definisce per opposizione e resistenza.' }
    ], { onConflict: 'id' });
    if (traitsError) throw traitsError;

    // Processa ogni file nella cartella
    for (const file of files) {
      if (path.extname(file) === '.json') {
        console.log(`Processing ${file}...`);
        const filePath = path.join(contentDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const eventData: EventFile = JSON.parse(fileContent);

        // Inseriamo i dati in una transazione per ogni file.
        // Per semplicità qui usiamo chiamate separate, ma in uno script più complesso
        // si potrebbe usare una RPC (Remote Procedure Call) di Supabase.

        // 1. Inserisci l'evento
        const { error: eventError } = await supabase.from('events').insert({
          id: eventData.eventId,
          era: eventData.era,
          narrative: eventData.narrative,
          entry_conditions: eventData.entryConditions,
        }, { onConflict: 'id' });
        if (eventError) throw eventError;

        // 2. Itera e inserisci le scelte e i loro outcome
        for (const choice of eventData.choices) {
          // Inserisci la scelta
          const { error: choiceError } = await supabase.from('choices').insert({
            id: choice.choiceId,
            event_id: eventData.eventId,
            text: choice.text,
            feedback_narrative: choice.feedbackNarrative,
          }, { onConflict: 'id' });
          if (choiceError) throw choiceError;

          // Prepara gli outcome per l'inserimento in batch
          const outcomesToInsert = choice.outcomes.map(outcome => ({
            choice_id: choice.choiceId,
            outcome_type: outcome.type,
            parameter: outcome.param,
            value: outcome.value,
            trait_id: outcome.traitId,
          }));

          // Inserisci tutti gli outcome per questa scelta
          const { error: outcomeError } = await supabase.from('choice_outcomes').insert(outcomesToInsert);
          if (outcomeError) throw outcomeError;
        }
      }
    }

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
}

seedDatabase();