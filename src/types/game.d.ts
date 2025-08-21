import type { Tables } from "./supabase";

// Questo tipo descrive un oggetto dell'inventario con i dettagli dell'item annessi.
// (Invariato)
export type InventoryItemWithDetails = Tables<'inventory'> & {
  game_items: Tables<'game_items'> | null;
};

// Questo tipo descrive il profilo completo dell'utente.
// (Invariato)
export type ProfileUser = Tables<'profiles'> & { 
  inventory: InventoryItemWithDetails[];
};


// ===============================================================
// >>> NUOVI TIPI AGGIUNTI QUI <<<
// ===============================================================

/**
 * Descrive la struttura di un oggetto che può essere droppato al completamento di un enigma.
 */
export type DroppedItem = {
  id: string;
  name: string;
  rarity: string;
  asset_url: string | null;
};

/**
 * Definisce tutte le possibili strutture di ritorno per la server action `submitParadoxSolution`.
 * Questo tipo unificato aiuta TypeScript a capire cosa aspettarsi.
 */
export type SubmitSolutionResult = {
  success: boolean;
  outcome?: 'correct' | 'incorrect';
  updatedProfile?: ProfileUser;
  error?: string;
  details?: boolean[];
  droppedItem?: DroppedItem | null; 
  achievementUnlocked?: { title: string } | null;
};