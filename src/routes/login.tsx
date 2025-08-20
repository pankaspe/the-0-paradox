import { createSignal, onMount, Show, type Component } from "solid-js";
import { supabase } from "~/lib/supabase.client";
import { useNavigate } from "@solidjs/router";
import { isServer } from "solid-js/web";
import { themeStore, themeStoreActions } from "~/lib/themeStore";
import { IoMoonOutline, IoSunnyOutline } from "solid-icons/io";
import { Motion } from "solid-motionone";

// 1. Contenuti in Italiano, aggiornati con la nuova lore.
const content = {
  titleLogin: "Accesso Operatore",
  titleSignUp: "Registrazione Entità",
  descLogin: "Autenticati per accedere al Paradox OS.",
  descSignUp: "Registra la tua firma neurale per iniziare.",
  emailLabel: "Identificativo Email",
  passwordLabel: "Password di Cifratura (min. 6 caratteri)",
  buttonLogin: "Accedi",
  buttonSignUp: "Registrati",
  loading: "Verifica in corso...",
  promptSignUp: "Non hai un'autorizzazione?",
  promptLogin: "Hai già un'autorizzazione?",
  signUpSuccess: "Registrazione completata! Controlla il tuo identificativo email per il link di conferma.",
};

// 2. Stesso sfondo della homepage per coerenza visiva.
const AnimatedBackground: Component = () => {
  return (
    <div class="absolute inset-0 -z-10 overflow-hidden bg-page transition-colors duration-500">
      <div class="animated-grid" />
      <Motion.div
        class="absolute top-0 left-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [-100, 200, -100], y: [50, 250, 50] }}
        transition={{ duration: 40, repeat: Infinity, direction: 'alternate', easing: 'ease-in-out' }}
      />
      <Motion.div
        class="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ x: [100, -200, 100], y: [-50, -250, -50] }}
        transition={{ duration: 50, repeat: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: 5 }}
      />
    </div>
  );
};

/**
 * Pagina di Login/Registrazione, aggiornata allo stile di Paradox OS.
 */
export default function LoginPage() {
  const navigate = useNavigate();

  onMount(async () => {
    // Reindirizza se l'utente è già loggato
    if (!isServer) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Naviga alla selezione dei paradossi
        navigate("/game/paradoxes", { replace: true });
      }
    }
  });

  const [loading, setLoading] = createSignal(false);
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [isSignUp, setIsSignUp] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");

  const handleAuth = async (event: Event) => {
    event.preventDefault();
    setErrorMessage(""); // Resetta gli errori
    try {
      setLoading(true);
      if (isSignUp()) {
        const { error } = await supabase.auth.signUp({ email: email(), password: password() });
        if (error) throw error;
        alert(content.signUpSuccess);
        setIsSignUp(false); // Riporta al login dopo la registrazione
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email(), password: password() });
        if (error) throw error;
        window.location.href = "/game/paradoxes"; // Usa il reindirizzamento completo per forzare un refresh
      }
    } catch (error: any) {
      setErrorMessage(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 3. Stili CSS personalizzati (copiati dalla index per coerenza) */}
      <style>{`
        .animated-grid {
          width: 100vw; height: 100vh; position: absolute;
          background-image: linear-gradient(to right, var(--color-border) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: pan 60s linear infinite;
        }
        @keyframes pan { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
      `}</style>
      
      <div class="min-h-screen font-mono bg-page text-text-main flex items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden">
        <AnimatedBackground />

        {/* Switcher Tema */}
        <div class="absolute top-4 right-4 z-10">
          <button
            onClick={() => themeStoreActions.toggleTheme()}
            class="p-2 rounded-full text-text-main/80 hover:bg-surface/50 transition-colors"
            title="Cambia Tema"
          >
            <Show when={themeStore.theme === 'dark'} fallback={<IoSunnyOutline size={4} />}><IoMoonOutline size={4} /></Show>
          </button>
        </div>

        <Motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, easing: [0.16, 1, 0.3, 1] }}
          class="w-full max-w-sm bg-surface/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-border"
        >
          <h1 class="text-3xl font-bold text-center text-primary mb-2">
            {isSignUp() ? content.titleSignUp : content.titleLogin}
          </h1>
          <p class="text-center text-text-muted mb-8">
            {isSignUp() ? content.descSignUp : content.descLogin}
          </p>
          
          <form onSubmit={handleAuth} class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-text-muted">{content.emailLabel}</label>
              <input
                id="email" type="email"
                class="mt-1 block w-full bg-surface-hover border-2 border-border rounded-md p-2 text-text-main focus:border-primary focus:ring focus:ring-primary/50 transition"
                value={email()} onInput={(e) => setEmail(e.currentTarget.value)} required
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-text-muted">{content.passwordLabel}</label>
              <input
                id="password" type="password"
                class="mt-1 block w-full bg-surface-hover border-2 border-border rounded-md p-2 text-text-main focus:border-primary focus:ring focus:ring-primary/50 transition"
                value={password()} onInput={(e) => setPassword(e.currentTarget.value)} required minLength={6}
              />
            </div>
            
            <Show when={errorMessage()}>
              <p class="text-sm text-error text-center">{errorMessage()}</p>
            </Show>

            <button type="submit" disabled={loading()}
              class="w-full py-3 px-4 font-bold text-white bg-primary rounded-md transition hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 ring-primary/50"
            >
              {loading() ? content.loading : (isSignUp() ? content.buttonSignUp : content.buttonLogin)}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-text-muted">
            {isSignUp() ? content.promptLogin : content.promptSignUp}
            <button onClick={() => { setIsSignUp(!isSignUp()); setErrorMessage(""); }} class="font-semibold text-primary hover:underline ml-1">
              {isSignUp() ? content.buttonLogin : content.buttonSignUp}
            </button>
          </p>
        </Motion.div>
      </div>
    </>
  );
}