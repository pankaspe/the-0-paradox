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
