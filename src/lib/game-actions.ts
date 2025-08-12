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

export const getGameData = async () => {
  const event = getRequestEvent();
  if (!event?.locals.user) {
    // Se non c'è utente (il middleware dovrebbe aver già reindirizzato),
    // restituiamo null per sicurezza.
    return null;
  }

  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`*, planets(*)`)
    .eq("id", event.locals.user.id)
    .single();
    
  if (error) {
    console.error("Errore in getGameData:", error.message);
    return null; // In caso di errore, restituiamo null.
  }

  return profile;
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