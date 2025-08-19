// src/lib/game-actions.ts

"use server";

import { getRequestEvent } from "solid-js/web";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "~/types/supabase";
import type { ProfileUser } from "~/types/game";

// =================================================================
// Internal Utility Functions
// =================================================================

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

// =================================================================
// Public Server Actions
// =================================================================

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
 * Recupera i dati di un singolo step del paradosso dal database.
 * @param stepId L'ID dello step da caricare.
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
    console.error("Database error fetching paradox step:", error);
    return { success: false, error: "Could not load the paradox step." };
  }

  return { success: true, data };
};

/**
 * Processa il tentativo di soluzione di un utente per uno step del paradosso.
 * @param stepId L'ID dello step che si sta tentando di risolvere.
 * @param submittedSolution La soluzione inviata dall'utente.
 */
export const submitParadoxSolution = async (stepId: number, submittedSolutions: string[]) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = createClient();
  const userId = event.locals.user.id;

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
    .select('current_step_id, focus, acumen, concentration, curiosity, resilience, max_step_reached')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "User profile not found." };
  }
  if (profile.current_step_id !== stepId) {
    return { success: false, error: "Sequence mismatch. Anomaly detected." };
  }

  // >>> NUOVA LOGICA DI VALIDAZIONE <<<
  const correctSolutions = stepData.solutions;
  const isCorrect = correctSolutions.length === submittedSolutions.length && 
                    correctSolutions.every((sol, i) => sol === submittedSolutions[i]);

  if (isCorrect) {
    // ... (la logica di successo è identica a prima, la ometto per brevità)
    const newStepId = stepId + 1;
    const newMaxStep = Math.max(profile.max_step_reached, newStepId);

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        current_step_id: newStepId, max_step_reached: newMaxStep,
        max_step_reached_timestamp: new Date().toISOString(),
        acumen: profile.acumen + stepData.reward_acumen,
        concentration: profile.concentration + stepData.reward_concentration,
        curiosity: profile.curiosity + stepData.reward_curiosity,
        resilience: profile.resilience + stepData.reward_resilience,
      })
      .eq('id', userId).select().single();

    if (updateError) return { success: false, error: "Error updating profile." };
    return { success: true, outcome: 'correct', updatedProfile };
  } else {
    // SOLUZIONE SBAGLIATA
    const newFocus = Math.max(0, profile.focus - 10); // Penalità maggiore

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ focus: newFocus, last_focus_update: new Date().toISOString() })
      .eq('id', userId).select().single();
      
    if (updateError) return { success: false, error: "Error updating profile." };
    
    // Forniamo un feedback dettagliato al frontend!
    const validationDetails = correctSolutions.map((sol, i) => sol === submittedSolutions[i]);
    
    return { 
      success: false, 
      outcome: 'incorrect', 
      error: "Incorrect sequence.", 
      details: validationDetails, // Array di booleani [true, false, ...]
      updatedProfile 
    };
  }
};