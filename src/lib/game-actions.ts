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
 * If incorrect, applies penalties and may trigger an Anomaly event.
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
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "User profile not found." };
  }
  if (profile.current_step_id !== stepId) {
    return { success: false, error: "Sequence mismatch. Anomaly detected." };
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
        consecutive_failures: 0, // IMPORTANT: Reset the failure counter on success.
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
    const newFailureCount = profile.consecutive_failures + 1;
    let anomalyData = null;

    if (newFailureCount >= 2) {
      // Defines the stats object with explicit types.
      const stats = {
        resilience: profile.resilience,
        acumen: profile.acumen,
        curiosity: profile.curiosity,
        concentration: profile.concentration,
      };

      // Creates a specific type for the keys of the stats object to ensure type safety.
      type StatName = keyof typeof stats;

      // Casts the result of Object.keys() to our specific type.
      const statNames = Object.keys(stats) as StatName[];

      // Reduces the array of keys to find the one with the highest value.
      const dominantStat = statNames.reduce((a, b) => (stats[a] > stats[b] ? a : b), 'resilience');
      
      const { data: foundAnomaly } = await supabase
        .from('paradox_anomalies')
        .select('*')
        .eq('trigger_stat', dominantStat)
        .limit(1)
        .single();
      
      if (foundAnomaly) {
        anomalyData = foundAnomaly;
      }
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        focus: Math.max(0, profile.focus - 10),
        consecutive_failures: anomalyData ? 0 : newFailureCount,
        last_focus_update: new Date().toISOString() 
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
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
      anomaly: anomalyData
    };
  }
};