// src/types/game.d.ts
import type { Accessor } from "solid-js";
import type { Tables } from "./supabase";

// Definiamo la forma di un singolo layer equipaggiato
export type EquippedLayer = {
  id: string;
  asset_url: string | null;
  style_data?: Record<string, any> | null; 
  // --- AGGIUNGIAMO LE DIMENSIONI QUI ---
  width?: number;
  height?: number;
};

// Il resto dei tipi può rimanere invariato, dato che il "problema"
// non è nel dato sorgente (che arriva da Supabase) ma nel dato
// che viene memorizzato nello stato "equipaggiato".

// Definiamo la forma dell'oggetto equipped_layers
export type EquippedLayers = {
  background?: EquippedLayer;
  bioma?: EquippedLayer;
  aura?: EquippedLayer;
};

// Definiamo il tipo per un oggetto dell'inventario con i dettagli dell'oggetto
export type InventoryItemWithDetails = Tables<'inventory'> & {
  // Assicurati che il tipo generato da Supabase per 'game_items'
  // includa le colonne asset_width e asset_height.
  game_items: Tables<'game_items'> | null;
};

// Aggiorniamo ProfileWithbiomes per includere l'inventario
export type ProfileWithBiomes = Tables<'profiles'> & { 
  biomes: Tables<'biomes'>[];
  inventory: InventoryItemWithDetails[];
};


// Il tipo del contesto rimane lo stesso
export type GameDataContextType = Accessor<ProfileWithBiomes | undefined>;