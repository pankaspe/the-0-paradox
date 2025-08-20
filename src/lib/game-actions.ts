// src/lib/game-actions.ts

"use server";

import { getRequestEvent } from "solid-js/web";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "~/types/supabase";
import type { ProfileUser } from "~/types/game";

// =================================================================
// Internal Utility Functions
// =================================================================

/**
 * Creates a Supabase server client for the current request context.
 */
function createClient() {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("Server context not found. Ensure this is running in a server action.");
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

// =================================================================
// Public Server Actions
// =================================================================

/**
 * Fetches the initial game state for the logged-in user, including their profile.
 */
export const getInitialGameState = async () => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return null;
  }

  const supabase = createClient();
  const userId = event.locals.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`*, inventory(*, game_items(*))`)
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching initial game state:", profileError);
    return null;
  }

  return { profile: profile as ProfileUser };
};

/**
 * Updates the user's username after validation.
 */
export const updateUsername = async (newUsername: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "User not authenticated." };
  }

  if (!newUsername || newUsername.length < 3) {
    return { success: false, error: "Username must be at least 3 characters long." };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
    return { success: false, error: "Username can only contain letters, numbers, and underscores." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ username: newUsername })
    .eq('id', event.locals.user.id);

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: "This username is already taken." };
    }
    console.error("Database error updating username:", error);
    return { success: false, error: "Database error: " + error.message };
  }

  return { success: true };
};

/**
 * Updates the user's currently equipped avatar.
 */
export const equipAvatar = async (avatarId: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ active_avatar_id: avatarId })
    .eq('id', event.locals.user.id);

  if (error) {
    console.error("Database error equipping avatar:", error);
    return { success: false, error: "Database error: " + error.message };
  }
  return { success: true };
};

/**
 * Updates the user's preferred theme (light/dark).
 */
export const updateThemePreference = async (newTheme: 'light' | 'dark') => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "User not authenticated." };
  }

  if (newTheme !== 'light' && newTheme !== 'dark') {
    return { success: false, error: "Invalid theme value." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ preferred_theme: newTheme })
    .eq('id', event.locals.user.id);

  if (error) {
    console.error("Database error updating theme preference:", error);
    return { success: false, error: "Database error: " + error.message };
  }

  return { success: true };
};

/**
 * Signs out the current user.
 */
export const signOutUser = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out user:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

/**
 * Fetches the data for a single paradox step.
 * @param stepId - The ID of the step to retrieve.
 */
export const getParadoxStep = async (stepId: number) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('paradox_steps')
    .select('*')
    .eq('id', stepId)
    .single();

  if (error) {
    console.error(`Database error fetching paradox step #${stepId}:`, error);
    return { success: false, error: "Could not load the paradox step." };
  }

  return { success: true, data };
};

/**
 * Processes a user's solution attempt for a paradox step.
 * If correct, advances the user.
 * If incorrect, applies penalties.
 * @param stepId - The ID of the step being solved.
 * @param submittedSolutions - The user's proposed solution array.
 */
export const submitParadoxSolution = async (stepId: number, submittedSolutions: string[]) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
  const userId = event.locals.user.id;

  // --- Data Fetching ---
  const { data: stepData, error: stepError } = await supabase
    .from('paradox_steps')
    .select('solutions, reward_acumen, reward_concentration, reward_curiosity, reward_resilience')
    .eq('id', stepId)
    .single();

  if (stepError || !stepData) {
    return { success: false, error: "Paradox step not found." };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*') // 'select' ora non troverà più `consecutive_failures`, il che va bene.
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "User profile not found." };
  }
  if (profile.current_step_id !== stepId) {
    return { success: false, error: "Sequence mismatch. Please refresh." }; // Messaggio d'errore leggermente migliorato
  }

  // --- Solution Validation ---
  const isCorrect = stepData.solutions.length === submittedSolutions.length && 
                    stepData.solutions.every((sol, i) => sol === submittedSolutions[i]);

  if (isCorrect) {
    // --- CORRECT SOLUTION LOGIC ---
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        current_step_id: stepId + 1,
        max_step_reached: Math.max(profile.max_step_reached, stepId + 1),
        acumen: profile.acumen + (stepData.reward_acumen || 0),
        concentration: profile.concentration + (stepData.reward_concentration || 0),
        curiosity: profile.curiosity + (stepData.reward_curiosity || 0),
        resilience: profile.resilience + (stepData.reward_resilience || 0),
        // RIMOSSO: `consecutive_failures: 0` non è più necessario.
        last_focus_update: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile on success:", updateError);
      return { success: false, error: "Error updating profile." };
    }
    return { success: true, outcome: 'correct', updatedProfile };

  } else {
    // --- INCORRECT SOLUTION LOGIC ---
    // RIMOSSO: Tutta la logica legata a `newFailureCount` è stata eliminata.

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        focus: Math.max(0, profile.focus - 10),
        // RIMOSSO: `consecutive_failures: newFailureCount` non esiste più.
        last_focus_update: new Date().toISOString() 
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      // Questo era il punto in cui si verificava l'errore. Ora dovrebbe funzionare.
      console.error("Error updating profile on failure:", updateError);
      return { success: false, error: "Error updating profile." };
    }

    const validationDetails = stepData.solutions.map((sol, i) => sol === submittedSolutions[i]);

    return { 
      success: false, 
      outcome: 'incorrect', 
      error: "Incorrect sequence.", 
      details: validationDetails,
      updatedProfile,
    };
  }
};


/**
 * Gestisce un'interazione narrativa del giocatore con un elemento dello scenario.
 * @param stepId L'ID dello step corrente.
 * @param target L'oggetto dell'interazione (es. "custode").
 * @returns Il risultato testuale dell'interazione e se questa sblocca la decifrazione.
 */
export const performInteraction = async (stepId: number, target: string, command: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();

  // Selezioniamo solo i dati che ci servono per non sprecare risorse.
  const { data: step, error } = await supabase
    .from('paradox_steps')
    .select('interactive_elements')
    .eq('id', stepId)
    .single();

  if (error || !step || !step.interactive_elements) {
    return { success: false, error: "Could not retrieve interaction data." };
  }
  
  // TypeScript non sa cosa c'è nel JSON, quindi lo "castiamo" al tipo che ci aspettiamo.
  const interactions = step.interactive_elements as any[]; 

  // Cerchiamo l'interazione specifica che il giocatore ha richiesto.
  const interaction = interactions.find(
    (el) => el.target === target && el.command === command
  );

  if (!interaction) {
    // Se per qualche motivo l'interazione non esiste, ritorniamo un messaggio generico.
    return { success: true, outcome_text: "Nessuna risposta...", reveals_key: false };
  }

  // Ritorniamo il risultato dell'interazione al client.
  return {
    success: true,
    outcome_text: interaction.outcome_text,
    reveals_key: interaction.reveals_decryption_key || false,
  };
};


/**
 * Recupera l'elenco di tutti i paradossi (stagioni) disponibili per il giocatore.
 */
export const getParadoxSeasons = async () => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
  
  // Selezioniamo tutte le stagioni attive, ordinate per ID.
  const { data, error } = await supabase
    .from('paradox_seasons')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true });

  if (error) {
    console.error("Database error fetching paradox seasons:", error);
    return { success: false, error: "Could not load paradox dossiers." };
  }

  return { success: true, data };
};


/**
 * Prepara il profilo di un utente per iniziare una nuova missione (stagione).
 * Trova il primo step della stagione e imposta il progresso dell'utente su di esso.
 * @param seasonId L'ID della stagione da iniziare.
 */
export const startParadoxMission = async (seasonId: number) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
  const userId = event.locals.user.id;

  // --- 1. Trova il primo step della stagione selezionata ---
  // Ordiniamo gli step per ID in ordine crescente e prendiamo il primo.
  const { data: firstStep, error: stepError } = await supabase
    .from('paradox_steps')
    .select('id')
    .eq('season_id', seasonId)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle(); // Usiamo maybeSingle() per non avere un errore se la stagione è vuota.

  if (stepError) {
    console.error("Error finding first step for season:", stepError);
    return { success: false, error: "Could not find starting point for the paradox." };
  }

  if (!firstStep) {
    return { success: false, error: "This paradox has no defined starting point (no steps found)." };
  }

  const firstStepId = firstStep.id;

  // --- 2. Aggiorna il profilo dell'utente ---
  // Impostiamo il current_step e resettiamo il max_step_reached a questo punto di partenza.
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      current_step_id: firstStepId,
      max_step_reached: firstStepId // Impostiamo anche il massimo progresso a questo step
    })
    .eq('id', userId);

  if (updateError) {
    console.error("Error updating profile to start mission:", updateError);
    return { success: false, error: "Failed to initialize the synchronization." };
  }

  // --- 3. Successo ---
  // Non reindirizziamo dal server. Il client si occuperà di questo.
  return { success: true };
};