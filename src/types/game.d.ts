// src/types/game.d.ts
import type { Accessor } from "solid-js";
import type { Tables } from "./supabase";

// Definiamo la forma di un singolo layer equipaggiato
export type EquippedLayer = {
  id: string;
  asset_url: string | null;
};

// Definiamo la forma dell'oggetto equipped_layers
export type EquippedLayers = {
  background?: EquippedLayer;
  planet?: EquippedLayer;
  aura?: EquippedLayer; // Aggiungiamo anche aura per il futuro
};

// Definiamo il tipo per un oggetto dell'inventario con i dettagli dell'oggetto
export type InventoryItemWithDetails = Tables<'inventory'> & {
  game_items: Tables<'game_items'> | null;
};

// Aggiorniamo ProfileWithPlanets per includere l'inventario
export type ProfileWithPlanets = Tables<'profiles'> & { 
  planets: Tables<'planets'>[];
  inventory: InventoryItemWithDetails[]; // <-- AGGIUNTA CHIAVE
};

// Il tipo del contesto rimane lo stesso
export type GameDataContextType = Accessor<ProfileWithPlanets | undefined>;