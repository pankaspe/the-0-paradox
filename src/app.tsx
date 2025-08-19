// src/app.tsx

import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

// =================================================================
// >>> INIZIO FIX THEME SWITCHER <<<
// Importiamo lo store del tema qui. Questo fa sì che il codice
// al suo interno venga eseguito all'avvio dell'app, attivando
// il createEffect che applica la classe .dark/.light all'HTML.
// =================================================================
import "~/lib/themeStore";

export default function App() {
  return (
    <MetaProvider>
      {/* Ho rinominato il titolo per coerenza con il nome del gioco */}
      <Title>The Paradox Zero</Title> 
      <Router
        root={(props) => (
          <>
            <Suspense>{props.children}</Suspense>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </MetaProvider>
  );
}