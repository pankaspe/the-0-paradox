// src/routes/login.tsx

import { createSignal, onMount, Show, createMemo, type Component } from "solid-js";
import { supabase } from "~/lib/supabase.client";
import { useNavigate } from "@solidjs/router";
import { isServer } from "solid-js/web";
import { themeStore, themeStoreActions } from "~/lib/themeStore";
import { IoLanguage, IoMoonOutline, IoSunnyOutline } from "solid-icons/io";
import { Motion } from "solid-motionone";

// 1. GESTIONE DEI CONTENUTI MULTI-LINGUA (autocontenuta)
const content = {
  en: {
    titleLogin: "Access Protocol",
    titleSignUp: "Create Entity",
    descLogin: "Authenticate to continue your sequence.",
    descSignUp: "Register to initiate your first paradox.",
    emailLabel: "Email",
    passwordLabel: "Password (min. 6 characters)",
    buttonLogin: "Login",
    buttonSignUp: "Sign Up",
    loading: "Processing...",
    promptSignUp: "Don't have an entity yet?",
    promptLogin: "Already have an entity?",
    signUpSuccess: "Registration successful! Please check your email to confirm your account.",
  },
  it: {
    titleLogin: "Accesso al Protocollo",
    titleSignUp: "Crea Entità",
    descLogin: "Autenticati per continuare la tua sequenza.",
    descSignUp: "Registrati per iniziare il tuo primo paradosso.",
    emailLabel: "Email",
    passwordLabel: "Password (min. 6 caratteri)",
    buttonLogin: "Accedi",
    buttonSignUp: "Registrati",
    loading: "In elaborazione...",
    promptSignUp: "Non hai ancora un'entità?",
    promptLogin: "Hai già un'entità?",
    signUpSuccess: "Registrazione completata! Controlla la tua email per confermare l'account.",
  }
};

/**
 * La pagina di Login/Registrazione, corretta e indipendente dallo store principale.
 */
export default function LoginPage() {
  const navigate = useNavigate();

  const [lang, setLang] = createSignal<'en' | 'it'>('en');
  onMount(() => {
    if (!isServer) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'it') setLang('it');
    }
  });
  const t = createMemo(() => content[lang()]);

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Il reindirizzamento qui va bene, punta alla directory del gioco
      navigate("/game", { replace: true });
    }
  });

  const [loading, setLoading] = createSignal(false);
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [isSignUp, setIsSignUp] = createSignal(false);

  // Gestore dell'autenticazione che usa alert() come richiesto.
  const handleAuth = async (event: Event) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (isSignUp()) {
        const { error } = await supabase.auth.signUp({ 
          email: email(), 
          password: password() 
        });
        if (error) throw error;
        alert(t().signUpSuccess); // Usiamo alert() per il feedback
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email(), 
          password: password() 
        });
        if (error) throw error;
        
        window.location.href = "/game";
      }
    } catch (error: any) {
      alert(error.message || "An error occurred"); // Usiamo alert() per gli errori
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-page text-text-main flex items-center justify-center p-4 font-sans transition-colors duration-500">
      {/* Non c'è più il componente Toast qui */}
      <div class="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button onClick={() => setLang(l => l === 'en' ? 'it' : 'en')} class="btn-icon">
          <IoLanguage />
        </button>
        <button onClick={() => themeStoreActions.toggleTheme()} class="btn-icon">
          <Show when={themeStore.theme === 'dark'} fallback={<IoSunnyOutline />}><IoMoonOutline /></Show>
        </button>
      </div>

      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        class="w-full max-w-sm bg-surface p-8 rounded-xl shadow-lg border border-border"
      >
        <h1 class="text-3xl font-bold text-center text-primary mb-2">
          {isSignUp() ? t().titleSignUp : t().titleLogin}
        </h1>
        <p class="text-center text-text-muted mb-8">
          {isSignUp() ? t().descSignUp : t().descLogin}
        </p>
        
        <form onSubmit={handleAuth} class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-text-muted">{t().emailLabel}</label>
            <input
              id="email"
              type="email"
              class="mt-1 block w-full bg-surface-hover border-2 border-border rounded-md p-2 text-text-main focus:border-primary focus:ring focus:ring-primary/50 transition"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-text-muted">{t().passwordLabel}</label>
            <input
              id="password"
              type="password"
              class="mt-1 block w-full bg-surface-hover border-2 border-border rounded-md p-2 text-text-main focus:border-primary focus:ring focus:ring-primary/50 transition"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading()}
            class="w-full py-3 px-4 font-bold text-white bg-primary rounded-md transition hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 ring-primary/50"
          >
            {loading() ? t().loading : (isSignUp() ? t().buttonSignUp : t().buttonLogin)}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-text-muted">
          {isSignUp() ? t().promptLogin : t().promptSignUp}
          <button onClick={() => setIsSignUp(!isSignUp())} class="font-semibold text-primary hover:underline ml-1">
            {isSignUp() ? t().buttonLogin : t().buttonSignUp}
          </button>
        </p>
      </Motion.div>
    </div>
  );
}