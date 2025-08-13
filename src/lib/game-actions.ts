// src/lib/game-actions.ts

"use server";

import { getRequestEvent } from "solid-js/web";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "~/types/supabase";
import { redirect } from "@solidjs/router";
import type { InventoryItemWithDetails } from "~/types/game";

/**
 * -----------------------------------------------------------------------------
 * Supabase Client Helper
 * -----------------------------------------------------------------------------
 * A private helper function to create a Supabase server client instance.
 * Avoids code repetition and ensures consistent client configuration.
 */
function createClient() {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("Server context not found. Ensure this runs within a server environment.");
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
 * -----------------------------------------------------------------------------
 * Core Game Data Actions
 * -----------------------------------------------------------------------------
 */

/**
 * Fetches all essential game data for the currently authenticated user.
 * This includes their profile, all their biomes, and their complete inventory with item details.
 * This is the primary data loading function when the game starts.
 * @returns {Promise<object | null>} A promise that resolves to the user's complete profile object or null if not found or on error.
 */
export const getInitialGameData = async () => {
  const event = getRequestEvent();
  if (!event?.locals.user) return null;

  const supabase = createClient();
  const userId = event.locals.user.id;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      biomes(*),
      inventory(*, game_items(*))
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error in getInitialGameData:", error.message);
    return null;
  }

  return profile;
};

/**
 * Updates the username for the authenticated user.
 * Includes server-side validation for the new username.
 * @param {string} newUsername - The new username to set.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating the outcome of the operation.
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
    // Specific error code for unique constraint violation
    if (error.code === '23505') {
      return { success: false, error: "This username is already taken." };
    }
    return { success: false, error: "Database error: " + error.message };
  }

  return { success: true };
};

/**
 * Equips a specific item to the user's active biome.
 * Updates the 'equipped_layers' JSONB column on the biome.
 * @param {string} itemId - The ID of the `game_items` to equip.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating the outcome of the operation.
 */
export const equipItem = async (itemId: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) return { success: false, error: "Not authenticated." };

  const supabase = createClient();
  const userId = event.locals.user.id;

  // Fetch item details and the user's active biome in parallel
  const [itemRes, biomeRes] = await Promise.all([
    supabase.from('game_items').select('*').eq('id', itemId).single(),
    supabase.from('biomes').select('*').eq('owner_id', userId).eq('is_active', true).single()
  ]);

  if (itemRes.error || !itemRes.data || biomeRes.error || !biomeRes.data) {
    return { success: false, error: "Item or biome not found." };
  }

  const item = itemRes.data;
  const biome = biomeRes.data;
  
  // Prepare the new state for `equipped_layers`
  const currentLayers = (biome.equipped_layers as any) || {};
  let newLayers = { ...currentLayers };

  // This can be extended with a switch statement for more item types
  if (item.item_type === 'bioma_background' || item.item_type === 'bioma_bioma') {
    newLayers[item.item_type.replace('bioma_', '')] = { id: item.id, asset_url: item.asset_url };
  } else {
    return { success: false, error: "This item type cannot be equipped." };
  }

  // Update the database
  const { error: updateError } = await supabase
    .from('biomes')
    .update({ equipped_layers: newLayers })
    .eq('id', biome.id);
  
  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
};

/**
 * Sets the active avatar for the authenticated user.
 * @param {string} itemId - The ID of the `game_items` to set as the active avatar.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating the outcome.
 */
export const equipAvatar = async (itemId: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "User not authenticated." };
  }

  const supabase = createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ active_avatar_id: itemId })
    .eq('id', event.locals.user.id);

  if (error) {
    return { success: false, error: "Database error: " + error.message };
  }

  return { success: true };
};

/**
 * Signs the user out and redirects them to the homepage.
 */
export const signOutUser = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error during logout:", error.message);
    return { success: false, error: error.message };
  }
  
  // Restituisce semplicemente un oggetto di successo.
  return { success: true };
};

/**
 * -----------------------------------------------------------------------------
 * Emporio (Store) Actions
 * -----------------------------------------------------------------------------
 */

/**
 * Fetches all available items for sale from the game store.
 * @returns {Promise<Tables<'game_items'>[] | null>} A promise that resolves to an array of game items or null on error.
 */
export const getStoreItems = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("game_items")
    .select('*')
    .order('rarity', { ascending: false }); // Example: order by rarity

  if (error) {
    console.error("Error fetching store items:", error.message);
    return null;
  }
  return data;
};

/**
 * Handles the purchase of an item from the store for the authenticated user.
 * It calls a PostgreSQL function `buy_game_item` to perform the transaction securely.
 * @param {string} itemId - The ID of the item to purchase.
 * @returns {Promise<{success: boolean, error?: string, data?: {newSoulFragments: number, newInventoryItem: InventoryItemWithDetails}} >} An object indicating outcome and returning updated data on success.
 */
export const buyItem = async (itemId: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "User not authenticated." };
  }

  const supabase = createClient();
  const userId = event.locals.user.id;

  // Call the database function to perform the transaction
  const { data, error } = await supabase.rpc('buy_game_item', {
    user_id_input: userId,
    item_id_input: itemId,
  }).single(); // .single() is used because our function returns a single row

  if (error) {
    // The error message from the PostgreSQL function (e.g., 'Insufficient funds') will be in `error.message`.
    return { success: false, error: error.message };
  }

  // The function returns a structure like: { new_soul_fragments: number, new_inventory_item: jsonb }
  // We just need to parse the JSONB for the item.
  const resultData = {
    newSoulFragments: data.new_soul_fragments,
    newInventoryItem: data.new_inventory_item as InventoryItemWithDetails,
  };

  return { success: true, data: resultData };
};