"use server";

import { getRequestEvent } from "solid-js/web";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "~/types/supabase";
import type { ProfileUser, SubmitSolutionResult  } from "~/types/game";

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
 * If correct, advances the user and may drop an item.
 */
export const submitParadoxSolution = async (
  stepId: number, 
  submittedSolutions: string[]
): Promise<SubmitSolutionResult> => { // Tipo di ritorno specificato
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
  const userId = event.locals.user.id;

  const { data: stepData, error: stepError } = await supabase
    .from('paradox_steps')
    .select('solutions, reward_acumen, reward_concentration, reward_curiosity, reward_resilience, season_id')
    .eq('id', stepId)
    .single();

  if (stepError || !stepData || !stepData.season_id) {
    return { success: false, error: "Paradox step not found or not configured." };
  }

  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (profileError || !profile) { return { success: false, error: "User profile not found." }; }
  if (profile.current_step_id !== stepId) { return { success: false, error: "Sequence mismatch. Please refresh." }; }

  const isCorrect = stepData.solutions.length === submittedSolutions.length && 
                    stepData.solutions.every((sol, i) => sol === submittedSolutions[i]);

  if (isCorrect) {
    let droppedItem = null;
    const dropChance = 0.25; // '0.25 MODIFICO IL DROPRATE @ 1
    if (Math.random() < dropChance) {
      const rarityRoll = Math.random();
      let determinedRarity = 'COMMON';
      if (rarityRoll < 0.05) determinedRarity = 'EPIC';
      else if (rarityRoll < 0.25) determinedRarity = 'RARE';

      const { data: potentialDrops } = await supabase
        .from('game_items')
        .select('id, name, rarity, asset_url')
        .eq('season_id', stepData.season_id)
        .eq('rarity', determinedRarity)
        .eq('item_type', 'AVATAR');

      if (potentialDrops && potentialDrops.length > 0) {
        const { data: userInventory } = await supabase.from('inventory').select('item_id').eq('owner_id', userId);
        const ownedItemIds = userInventory ? userInventory.map(i => i.item_id) : [];
        const newPossibleDrops = potentialDrops.filter(drop => !ownedItemIds.includes(drop.id));

        if (newPossibleDrops.length > 0) {
          const chosenDrop = newPossibleDrops[Math.floor(Math.random() * newPossibleDrops.length)];
          const { error: insertError } = await supabase.from('inventory').insert({ owner_id: userId, item_id: chosenDrop.id });
          if (!insertError) droppedItem = chosenDrop;
        }
      }
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        current_step_id: stepId + 1,
        max_step_reached: Math.max(profile.max_step_reached, stepId + 1),
        acumen: profile.acumen + (stepData.reward_acumen || 0),
        concentration: profile.concentration + (stepData.reward_concentration || 0),
        curiosity: profile.curiosity + (stepData.reward_curiosity || 0),
        resilience: profile.resilience + (stepData.reward_resilience || 0),
        last_focus_update: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*, inventory(*, game_items(*))') // Chiediamo il profilo completo
      .single();

    if (updateError || !updatedProfile) {
      return { success: false, error: "Error updating profile." };
    }
    
    return { success: true, outcome: 'correct', updatedProfile: updatedProfile as ProfileUser, droppedItem };
  } else {
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ focus: Math.max(0, profile.focus - 10), last_focus_update: new Date().toISOString() })
      .eq('id', userId)
      .select('*, inventory(*, game_items(*))') // Chiediamo il profilo completo
      .single();

    if (updateError || !updatedProfile) {
      return { success: false, error: "Error updating profile." };
    }
    
    const validationDetails = stepData.solutions.map((sol, i) => sol === submittedSolutions[i]);
    
    return { 
      success: false, 
      outcome: 'incorrect', 
      error: "Incorrect sequence.", 
      details: validationDetails,
      updatedProfile: updatedProfile as ProfileUser,
    };
  }
};

/**
 * Gestisce un'interazione narrativa del giocatore con un elemento dello scenario.
 */
export const performInteraction = async (stepId: number, target: string, command: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
  const { data: step, error } = await supabase
    .from('paradox_steps')
    .select('interactive_elements')
    .eq('id', stepId)
    .single();

  if (error || !step || !step.interactive_elements) {
    return { success: false, error: "Could not retrieve interaction data." };
  }
  
  const interactions = step.interactive_elements as any[];
  const interaction = interactions.find((el) => el.target === target && el.command === command);

  if (!interaction) {
    return { success: true, outcome_text: "Nessuna risposta...", reveals_key: false };
  }

  return {
    success: true,
    outcome_text: interaction.outcome_text,
    reveals_key: interaction.reveals_decryption_key || false,
  };
};

/**
 * Recupera l'elenco di tutti i paradossi (stagioni) disponibili.
 */
export const getParadoxSeasons = async () => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
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
 */
export const startParadoxMission = async (seasonId: number) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
  const userId = event.locals.user.id;

  const { data: firstStep, error: stepError } = await supabase
    .from('paradox_steps')
    .select('id')
    .eq('season_id', seasonId)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (stepError) {
    console.error("Error finding first step for season:", stepError);
    return { success: false, error: "Could not find starting point for the paradox." };
  }

  if (!firstStep) {
    return { success: false, error: "This paradox has no defined starting point." };
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      current_step_id: firstStep.id,
      max_step_reached: firstStep.id
    })
    .eq('id', userId);

  if (updateError) {
    console.error("Error updating profile to start mission:", updateError);
    return { success: false, error: "Failed to initialize the synchronization." };
  }

  return { success: true };
};