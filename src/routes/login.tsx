// src/routes/login.tsx
import { createSignal, onMount } from "solid-js";
import { supabase } from "~/lib/supabase.client";
import { useNavigate  } from "@solidjs/router"; // Per i link

export default function LoginPage() {

  const navigate = useNavigate(); // Hook per navigare programmaticamente

  // Controlla lo stato dell'utente quando il componente viene montato
  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Se c'è una sessione, l'utente è loggato. Reindirizzalo.
      navigate("/game/bioma", { replace: true });
    }
  });

  const [loading, setLoading] = createSignal(false);
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [isSignUp, setIsSignUp] = createSignal(false);

  // ... la funzione handleAuth rimane la stessa ...
  const handleAuth = async (event: Event) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (isSignUp()) {
        const { data, error } = await supabase.auth.signUp({ email: email(), password: password() });
        if (error) throw error;
        alert("Registrazione avvenuta! Ora puoi effettuare il login.");
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email(), password: password() });
        if (error) throw error;
        window.location.href = "/game/bioma";
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-abyss text-ghost flex items-center justify-center p-4">
      <main class="w-full max-w-md bg-starlight/10 p-8 rounded-xl shadow-2xl shadow-starlight/10 border border-starlight/20">
        <h1 class="text-4xl font-bold text-center text-biolume mb-2">
          {isSignUp() ? "Crea la tua Entità" : "Accedi a Bioma Zero"}
        </h1>
        <p class="text-center text-ghost/80 mb-8">
          {isSignUp()
            ? "Unisciti all'universo e inizia la tua opera di rinascita."
            : "Inserisci le tue credenziali per continuare il tuo viaggio."}
        </p>
        
        <form onSubmit={handleAuth} class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-biolume/80">Email</label>
            <input
              id="email"
              type="email"
              class="mt-1 block w-full bg-abyss/50 border-2 border-starlight/30 rounded-md p-2 focus:border-biolume focus:ring focus:ring-biolume/50 transition"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-biolume/80">Password (min. 6 caratteri)</label>
            <input
              id="password"
              type="password"
              class="mt-1 block w-full bg-abyss/50 border-2 border-starlight/30 rounded-md p-2 focus:border-biolume focus:ring focus:ring-biolume/50 transition"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading()}
            class="w-full py-3 px-4 font-bold text-abyss bg-biolume rounded-md transition hover:bg-biolume/80 disabled:bg-biolume/50 disabled:cursor-not-allowed"
          >
            {loading() ? "Caricamento..." : (isSignUp() ? "Registrati" : "Accedi")}
          </button>
        </form>

        <p class="mt-6 text-center text-sm">
          {isSignUp() ? "Hai già un'Entità? " : "Non hai ancora un'Entità? "}
          <button onClick={() => setIsSignUp(!isSignUp())} class="font-semibold text-biolume hover:underline">
            {isSignUp() ? "Accedi" : "Registrati"}
          </button>
        </p>
      </main>
    </div>
  );
}