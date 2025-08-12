// src/types/game.d.ts
import type { Accessor } from "solid-js";
import type { Tables } from "./supabase";

// Questo è il tipo di dato che la nostra funzione `getGameData` restituisce.
// È un oggetto Profile che include anche un array di Pianeti.
export type ProfileWithPlanets = Tables<'profiles'> & { planets: Tables<'planets'>[] };

// Questo è il tipo del nostro contesto.
// Sarà un "Accessor" che può contenere i nostri dati del profilo o essere undefined.
export type GameDataContextType = Accessor<ProfileWithPlanets | undefined>;