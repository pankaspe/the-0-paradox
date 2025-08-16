// src/lib/game-actions.ts

"use server";

import { getRequestEvent } from "solid-js/web";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "~/types/supabase";
import type { InventoryItemWithDetails, ProfileWithBiomes } from "~/types/game";

/**
 * Helper to create a Supabase server client.
 */
function createClient() {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("Server context not found.");
  }
  return createServerClient<Database>(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => event.request.headers.get("cookie")?.split('; ').find(c => c.startsWith(key + '='))?.split('=')[1],
        set: (key, value, options) => event.response.headers.append("Set-Cookie", `${key}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`),
        remove: (key, options) => event.response.headers.append("Set-Cookie", `${key}=; Path=${options.path}; Max-Age=0; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`),
      },
    }
  );
}

/**
 * Carica lo stato iniziale del gioco per l'utente.
 * Include il profilo, il bioma attivo e il PRIMO evento disponibile.
 */
export const getInitialGameState = async () => {
  console.log("[GAME_ACTION] 1. Avvio di getInitialGameState...");
  const event = getRequestEvent();
  if (!event?.locals.user) {
    console.error("[GAME_ACTION] ERRORE: Utente non autenticato.");
    return null;
  }
  
  const supabase = createClient();
  const userId = event.locals.user.id;
  console.log(`[GAME_ACTION] 2. Utente ${userId} autenticato. Caricamento profilo...`);

  // 1. Carica il profilo e il bioma attivo
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      *,
      biomes(*),
      inventory(*, game_items(*))
    `)
    .eq('id', userId)
    .single();
    
  if (profileError || !profile) {
    console.error("[GAME_ACTION] ERRORE durante il caricamento del profilo:", profileError?.message);
    return null;
  }
  console.log("[GAME_ACTION] 3. Profilo caricato. Caricamento evento iniziale...");

  // 2. Trova il primo evento del gioco
  const { data: initialEvent, error: eventError } = await supabase
    .from("events")
    .select(`*, choices(*, choice_outcomes(*))`)
    .eq('id', 'era1_scintilla_primordiale')
    .single();

  if (eventError || !initialEvent) {
    console.error("[GAME_ACTION] ERRORE durante il caricamento dell'evento iniziale:", eventError?.message);
    return null;
  }
  console.log("[GAME_ACTION] 4. Evento iniziale caricato. Dati pronti per essere inviati.");

  return { profile: profile as ProfileWithBiomes, currentEvent: initialEvent };
};

/**
 * La funzione CUORE del gioco. Processa la scelta di un utente.
 * È una versione semplificata. La renderemo transazionale con una Edge Function in futuro.
 * @param choiceId L'ID della scelta fatta dall'utente.
 */
export const makeChoice = async (choiceId: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) return { success: false, error: "Not authenticated." };
  
  const supabase = createClient();
  const userId = event.locals.user.id;

  try {
   const { data: outcomes, error: outcomesError } = await supabase.from('choice_outcomes').select('*').eq('choice_id', choiceId);
    if (outcomesError) throw new Error(`DB Error fetching outcomes: ${outcomesError.message}`);
    if (!outcomes || outcomes.length === 0) throw new Error(`No outcomes found for choice ${choiceId}`);

    // 2. Calcoliamo il costo energetico. I costi sono valori negativi (es. -5),
    //    quindi usiamo Math.abs() per ottenere il costo positivo (5).
    const energyOutcome = outcomes.find(o => o.parameter === 'energy');
    const energyCost = energyOutcome ? Math.abs(energyOutcome.value || 0) : 0;

    // 3. Recuperiamo il profilo dell'utente per controllare la sua energia attuale.
    const { data: currentProfile, error: profileCheckError } = await supabase.from('profiles').select('energy').eq('id', userId).single();
    if (profileCheckError || !currentProfile) throw new Error("Could not verify user's energy.");

    // 4. ESEGUIAMO IL CONTROLLO DI SICUREZZA
    if (currentProfile.energy < energyCost) {
      // Se l'energia non è sufficiente, fermiamo tutto e restituiamo un errore tematico.
      return { 
        success: false, 
        error: "Non possiedi l'energia vitale necessaria. Il tuo bioma deve recuperare la sua essenza prima di poter compiere questa scelta." 
      };
    }

    // 1. Carichiamo SEPARATAMENTE il profilo e il bioma
    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileError || !profile) throw new Error("Active profile not found.");

    const { data: biome, error: biomeError } = await supabase.from('biomes').select('*').eq('owner_id', userId).single();
    if (biomeError || !biome) throw new Error("Active biome not found.");
    
    // 2. Applichiamo gli outcomes distinguendo la tabella di destinazione
    for (const outcome of outcomes) {
      if (outcome.outcome_type === 'MODIFY_PARAM' && outcome.parameter && outcome.value != null) {
        // SE il parametro è 'energy', modifichiamo l'oggetto 'profile'
        if (outcome.parameter === 'energy') {
          profile.energy += outcome.value;
        } 
        // ALTRIMENTI, modifichiamo l'oggetto 'biome'
        else {
          (biome as any)[outcome.parameter] += outcome.value;
        }
      } 
      else if (outcome.outcome_type === 'GAIN_TRAIT' && outcome.trait_id && outcome.value != null) {
        const { error: rpcError } = await supabase.rpc('increment_user_trait', {
          p_trait_id: outcome.trait_id,
          p_increment_value: outcome.value
        });

        if (rpcError) console.error("Error calling increment_user_trait RPC:", rpcError);
      }
    }
    
    // 3. Eseguiamo due chiamate di UPDATE separate, una per ogni tabella
    const { error: updateProfileError } = await supabase.from('profiles').update({ energy: profile.energy }).eq('id', userId);
    if (updateProfileError) throw new Error(`DB Error on profile update: ${updateProfileError.message}`);

    const { error: updateBiomeError } = await supabase.from('biomes').update(biome).eq('id', biome.id);
    if (updateBiomeError) throw new Error(`DB Error on biome update: ${updateBiomeError.message}`);

    // Logica per il prossimo evento (invariata)
    const { data: nextEvent, error: nextEventError } = await supabase.from("events").select(`*, choices(*, choice_outcomes(*))`).eq('id', 'era1_scintilla_primordiale').single();
    if(nextEventError) throw new Error(`DB Error on next event fetch: ${nextEventError.message}`);

    const choiceMade = await supabase.from('choices').select('feedback_narrative').eq('id', choiceId).single();

    return { 
      success: true, 
      feedbackNarrative: choiceMade.data?.feedback_narrative ?? null,
      updatedBiome: biome,
      updatedProfile: profile,
      nextEvent: nextEvent 
    };

  } catch (err: any) {
    console.error("Error in makeChoice:", err.message);
    return { success: false, error: err.message };
  }
};


/** sign out user **/
export const signOutUser = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error during logout:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
};


/** update bioma name */
export const updateBiomeName = async (newName: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) { return { success: false, error: "User not authenticated." }; }
  if (!newName || newName.length < 3) { return { success: false, error: "Biome name must be at least 3 characters long." }; }

  const supabase = createClient();
  const userId = event.locals.user.id;

  const { data: biome, error: biomeError } = await supabase
    .from('biomes')
    .select('id')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .single();

  if (biomeError || !biome) { return { success: false, error: "Active biome not found." }; }

  const { error } = await supabase
    .from('biomes')
    .update({ bioma_name: newName })
    .eq('id', biome.id);
  
  if (error) { return { success: false, error: "Database error: " + error.message }; }

  return { success: true };
};


/** update username */
export const updateUsername = async (newUsername: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) { return { success: false, error: "User not authenticated." }; }
  if (!newUsername || newUsername.length < 3) { return { success: false, error: "Username must be at least 3 characters long." }; }
  if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) { return { success: false, error: "Username can only contain letters, numbers, and underscores." }; }
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ username: newUsername }).eq('id', event.locals.user.id);
  if (error) {
    if (error.code === '23505') { return { success: false, error: "This username is already taken." }; }
    return { success: false, error: "Database error: " + error.message };
  }
  return { success: true };
};

/** equip avatar */
export const equipAvatar = async (avatarId: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }
  
  const supabase = createClient();
  const userId = event.locals.user.id;

  // Esegui l'update nella tabella dei profili
  const { error } = await supabase
    .from('profiles')
    .update({ active_avatar_id: avatarId })
    .eq('id', userId);
  
  if (error) {
    console.error("Error equipping avatar:", error.message);
    return { success: false, error: "Database error: " + error.message };
  }

  return { success: true };
};

