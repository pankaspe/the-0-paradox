// src/routes/api/auth-callback.ts
import type { APIEvent } from "@solidjs/start/server";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export async function GET(event: APIEvent) {
  const code = new URL(event.request.url).searchParams.get("code");
  const next = "/game"; // Dove reindirizzare l'utente dopo il login

  if (code) {
    const supabase = createSupabaseServerClient(event);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Reindirizza l'utente alla pagina del suo Bioma
  return new Response(null, {
    status: 302,
    headers: {
      Location: next,
    },
  });
}