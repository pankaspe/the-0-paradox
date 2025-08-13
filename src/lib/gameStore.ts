// src/lib/gameStore.ts

import { createStore, produce } from "solid-js/store";
import type { ProfileWithBiomes, EquippedLayers, InventoryItemWithDetails } from "~/types/game";
import type { Tables } from "~/types/supabase";
import { getInitialGameData, getStoreItems } from "./game-actions";

/**
 * -----------------------------------------------------------------------------
 * Game Store Interface
 * -----------------------------------------------------------------------------
 * Defines the shape of our global game state.
 */
interface GameStore {
  // User and game session state
  profile: ProfileWithBiomes | null;
  isLoading: boolean; // For initial data load
  error: string | null;

  // Emporio (in-game store) state
  storeItems: Tables<'game_items'>[];
  isStoreLoading: boolean; // For loading store items specifically
  storeError: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info'; id: number } | null;
}

/**
 * -----------------------------------------------------------------------------
 * Store Initialization
 * -----------------------------------------------------------------------------
 * Creates the reactive store with its initial state.
 */
const [store, setStore] = createStore<GameStore>({
  // Initial user state
  profile: null,
  isLoading: true,
  error: null,
  toast: null,

  // Initial emporio state
  storeItems: [],
  isStoreLoading: true,
  storeError: null,
});

let toastTimeout: ReturnType<typeof setTimeout>;

/**
 * -----------------------------------------------------------------------------
 * Store Actions
 * -----------------------------------------------------------------------------
 * A collection of functions to interact with and mutate the global store.
 */
const actions = {
    // --- Toast Actions ---
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    // Pulisce il timeout precedente se una notifica viene mostrata rapidamente dopo un'altra
    clearTimeout(toastTimeout);

    setStore('toast', { message, type, id: Date.now() });

    // Nasconde automaticamente la notifica dopo 5 secondi
    toastTimeout = setTimeout(() => {
      actions.hideToast();
    }, 5000);
  },

  hideToast() {
    clearTimeout(toastTimeout);
    setStore('toast', null);
  },
  
  // --- Core Data Loading ---

  /**
   * Loads the initial essential game data for the user.
   * Fetches profile, biomes, and inventory.
   * Avoids re-fetching if data is already present.
   */
  async loadInitialData() {
    if (store.profile) {
      setStore("isLoading", false);
      return;
    }
    setStore("isLoading", true);
    try {
      const data = await getInitialGameData();
      if (data) {
        setStore(produce(s => {
          s.profile = data as ProfileWithBiomes;
          s.isLoading = false;
          s.error = null;
        }));
      } else {
        throw new Error("User profile not found or could not be loaded.");
      }
    } catch (e: any) {
      setStore(produce(s => {
        s.error = e.message || "An unknown error occurred.";
        s.isLoading = false;
      }));
    }
  },

  // --- Profile Actions ---

  /**
   * Optimistically updates the username in the local store.
   * @param newUsername The new username to display.
   */
  updateUsername(newUsername: string) {
    if (store.profile) {
      setStore("profile", "username", newUsername);
    }
  },

  /**
   * Reverts the username in the local store if the server update fails.
   * @param originalUsername The original username to restore.
   */
  revertUsername(originalUsername: string) {
    if (store.profile) {
      setStore("profile", "username", originalUsername);
    }
  },

  /**
   * Optimistically updates the active avatar in the local store.
   * @param newAvatarId The ID of the new avatar to display.
   */
  equipAvatar(newAvatarId: string) {
    if (store.profile) {
      setStore("profile", "active_avatar_id", newAvatarId);
    }
  },
  
  // --- Biome Actions ---

  /**
   * Optimistically equips a new layer to the active biome in the local store.
   * @param layerData The ID and asset URL of the item to equip.
   * @param layerType The type of layer to update (e.g., 'background', 'bioma').
   */
  equipBiomaLayer(layerData: { id: string; asset_url: string | null; style_data?: Record<string, any> | null }, layerType: 'background' | 'bioma' | 'aura') {
    if (!store.profile || !store.profile.biomes[0]) return;
    
    // 1. Safely get the current layers, falling back to an empty object if null.
    // The type assertion `as EquippedLayers` is key to informing TypeScript of the object's shape.
    const currentLayers = store.profile.biomes[0].equipped_layers as EquippedLayers || {};

    // 2. Create the new state for the layers object.
    const newLayers: EquippedLayers = {
      ...currentLayers,
      [layerType]: layerData,
    };

    // 3. Set the new state in the store.
    setStore("profile", "biomes", 0, "equipped_layers", newLayers);
  },

  // --- Emporio (Store) Actions ---

  /**
   * Loads all items available for sale in the Emporio.
   * Avoids re-fetching if items are already loaded.
   */
  async loadStoreItems() {
    if (store.storeItems.length > 0) {
      setStore("isStoreLoading", false);
      return;
    }
    setStore("isStoreLoading", true);
    try {
      const items = await getStoreItems();
      if (items) {
        setStore(produce(s => {
          s.storeItems = items;
          s.storeError = null;
        }));
      } else {
        throw new Error("Could not load store items.");
      }
    } catch (e: any) {
        setStore("storeError", e.message || "An unknown error occurred while fetching store items.");
    } finally {
        setStore("isStoreLoading", false);
    }
  },
  
  /**
   * Optimistically handles the local state changes for an item purchase.
   * It deducts soul fragments and adds a temporary item to the inventory.
   * This provides instant UI feedback to the user.
   * @param itemToBuy The full `game_items` object being purchased.
   */
  buyItemOptimistic(itemToBuy: Tables<'game_items'>) {
    setStore(produce(s => {
      if (s.profile) {
        // 1. Deduct cost
        s.profile.soul_fragments -= itemToBuy.cost;
        
        // 2. Create a temporary inventory item and add it to the list
        const tempInventoryItem: InventoryItemWithDetails = {
          id: -1, // Use a temporary, non-existent ID
          created_at: new Date().toISOString(),
          owner_id: s.profile.id,
          item_id: itemToBuy.id,
          game_items: itemToBuy // Embed the full item details for immediate display
        };
        s.profile.inventory.push(tempInventoryItem);
      }
    }));
  },
  
  /**
   * Finalizes a successful item purchase.
   * It syncs the local state with the authoritative data returned from the server.
   * @param data The success data from the `buyItem` server action.
   */
  confirmItemPurchase(data: { newSoulFragments: number, newInventoryItem: InventoryItemWithDetails }) {
    setStore(produce(s => {
      if (s.profile) {
        // 1. Sync soul fragments with the exact server value
        s.profile.soul_fragments = data.newSoulFragments;
        
        // 2. Find the temporary item and replace it with the real one from the database
        const tempItemIndex = s.profile.inventory.findIndex(
          i => i.id === -1 && i.item_id === data.newInventoryItem.item_id
        );
        
        if (tempItemIndex > -1) {
          s.profile.inventory[tempItemIndex] = data.newInventoryItem;
        } else {
          // Fallback: if for some reason the temp item wasn't found, just add the new one
          s.profile.inventory.push(data.newInventoryItem);
        }
      }
    }));
  },

  /**
   * Reverts the local state changes if an item purchase fails on the server.
   * It refunds the soul fragments and removes the temporary item from the inventory.
   * @param itemToRevert The full `game_items` object whose purchase failed.
   */
  revertItemPurchase(itemToRevert: Tables<'game_items'>) {
     setStore(produce(s => {
      if (s.profile) {
        // 1. Refund the cost
        s.profile.soul_fragments += itemToRevert.cost;
        
        // 2. Remove the temporary item from inventory
        s.profile.inventory = s.profile.inventory.filter(
          i => !(i.id === -1 && i.item_id === itemToRevert.id)
        );
      }
    }));
  },
};

/**
 * -----------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------
 * Export the store and actions for use throughout the application.
 */
export { store as gameStore, actions as gameStoreActions };