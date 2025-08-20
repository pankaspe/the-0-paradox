// src/types/game.d.ts
import type { Tables, Json } from "./supabase";

export type InventoryItemWithDetails = Tables<'inventory'> & {
  game_items: Tables<'game_items'> | null;
};

export type ProfileUser = Tables<'profiles'> & { 
  inventory: InventoryItemWithDetails[];
};
