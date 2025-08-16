import type { Tables, Json } from "./supabase";

// Non abbiamo più modificatori legati alle carte, quindi questo tipo non serve più.
// export type BiomeModifier = { ... };

export type InventoryItemWithDetails = Tables<'inventory'> & {
  game_items: Tables<'game_items'> | null;
};

// --- CORREZIONE CHIAVE ---
// Rimuoviamo la dipendenza da `equipped_bioma_card`.
// Un Bioma ora è semplicemente la sua rappresentazione diretta dal database.
export type BiomeWithDetails = Tables<'biomes'>;

export type ProfileWithBiomes = Tables<'profiles'> & { 
  biomes: BiomeWithDetails[]; // Ora usa il tipo corretto e pulito.
  inventory: InventoryItemWithDetails[];
};