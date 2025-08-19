// src/lib/themeStore.ts

import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";
// Importa la nuova azione che abbiamo creato
import { updateThemePreference } from "./game-actions"; 

type Theme = 'light' | 'dark';

const [store, setStore] = createStore<{ theme: Theme }>({
  theme: 'dark' 
});

const actions = {
  // Questa funzione è utile per inizializzare il tema dal profilo utente
  setTheme(theme: Theme) {
    if (theme === 'light' || theme === 'dark') {
      setStore('theme', theme);
    }
  },

  // Trasformiamo toggleTheme in una funzione asincrona
  async toggleTheme() {
    const newTheme = store.theme === 'dark' ? 'light' : 'dark';
    
    // 1. Aggiornamento ottimistico: cambiamo subito la UI
    setStore('theme', newTheme);
    
    // 2. Chiamiamo l'azione per salvare la preferenza nel database
    try {
      const result = await updateThemePreference(newTheme);
      if (!result.success) {
        console.error("Failed to save theme preference:", result.error);
        // Potresti voler mostrare un toast di errore qui e annullare la modifica
      }
    } catch (e) {
      console.error("Error calling updateThemePreference:", e);
    }
  }
};

createEffect(() => {
  if (isServer) return;
  const currentTheme = store.theme;
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(currentTheme);
  localStorage.setItem('paradox-theme', currentTheme);
});

// Rimuoviamo la logica di inizializzazione da qui, la sposteremo
// dove abbiamo accesso ai dati del profilo.

export { store as themeStore, actions as themeStoreActions };