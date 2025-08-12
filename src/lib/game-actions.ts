// src/lib/game-actions.ts
"use server";

import { getRequestEvent } from "solid-js/web";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "~/types/supabase";
import { redirect } from "@solidjs/router";

// Funzione helper per creare il client, per non ripeterci
function createClient() {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("getRequestEvent() non ha trovato un evento. Assicurati di essere in un contesto server.");
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

export const getInitialGameData = async () => {
  const event = getRequestEvent();
  if (!event?.locals.user) return null;

  const supabase = createClient();
  const userId = event.locals.user.id;

  // Eseguiamo tutte le query necessarie in parallelo
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      planets(*),
      inventory(*, game_items(*))
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Errore in getInitialGameData:", error.message);
    return null;
  }

  // La nostra query ora restituisce un profilo che include sia i pianeti che l'inventario.
  return profile;
};

export const getBiomaData = async () => {
  "use server";
  const event = getRequestEvent();
  if (!event?.locals.user) return null;

  const supabase = createClient();
  const userId = event.locals.user.id;

  // Eseguiamo due query in parallelo per efficienza
  const [planetRes, inventoryRes] = await Promise.all([
    // Query per il pianeta attivo
    supabase.from('planets').select('*').eq('owner_id', userId).eq('is_active', true).single(),
    // Query per l'inventario, facendo una join per prendere i dettagli degli oggetti
    supabase.from('inventory').select('*, game_items(*)').eq('owner_id', userId)
  ]);

  if (planetRes.error || inventoryRes.error) {
    console.error("Errore in getBiomaData:", planetRes.error?.message || inventoryRes.error?.message);
    return null;
  }

  return {
    planet: planetRes.data,
    inventory: inventoryRes.data,
  };
};

export const updateUsername = async (newUsername: string) => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    return { success: false, error: "Utente non autenticato." };
  }
  
  if (!newUsername || newUsername.length < 3) {
      return { success: false, error: "L'username deve avere almeno 3 caratteri." };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      return { success: false, error: "L'username può contenere solo lettere, numeri e underscore." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ username: newUsername })
    .eq('id', event.locals.user.id);

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: "Questo username è già stato preso." };
    }
    return { success: false, error: "Errore del database: " + error.message };
  }

  return { success: true };
};

export const equipItem = async (itemId: string) => {
  "use server";
  const event = getRequestEvent();
  if (!event?.locals.user) return { success: false, error: "Non autenticato." };

  const supabase = createClient();
  const userId = event.locals.user.id;

  // 1. Prendiamo i dettagli dell'oggetto e il pianeta attuale
  const [itemRes, planetRes] = await Promise.all([
    supabase.from('game_items').select('*').eq('id', itemId).single(),
    supabase.from('planets').select('*').eq('owner_id', userId).eq('is_active', true).single()
  ]);

  if (itemRes.error || !itemRes.data || planetRes.error || !planetRes.data) {
    return { success: false, error: "Oggetto o pianeta non trovato." };
  }

  const item = itemRes.data;
  const planet = planetRes.data;
  
  // 2. Prepariamo il nuovo stato per `equipped_layers`
  const currentLayers = (planet.equipped_layers as any) || {};
  let newLayers = {};

  if (item.item_type === 'bioma_background') {
    newLayers = { ...currentLayers, background: { id: item.id, asset_url: item.asset_url } };
  } else if (item.item_type === 'bioma_planet') {
    newLayers = { ...currentLayers, planet: { id: item.id, asset_url: item.asset_url } };
  } else {
    return { success: false, error: "Tipo di oggetto non equipaggiabile." };
  }

  // 3. Aggiorniamo il database
  const { error: updateError } = await supabase
    .from('planets')
    .update({ equipped_layers: newLayers })
    .eq('id', planet.id);
  
  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
};

export const signOutUser = async () => {
  const supabase = createClient(); // Usiamo la nostra funzione helper
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Errore durante il logout:", error.message);
    // Potremmo voler gestire l'errore in modo più elegante in futuro
    return;
  }
  
  // Usiamo il redirect di Solid Router, che è gestito dal server.
  // Questo è il modo più pulito e sicuro per reindirizzare dopo un'azione server.
  throw redirect("/");
};