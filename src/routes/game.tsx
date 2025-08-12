// src/routes/game.tsx
import { type RouteSectionProps } from "@solidjs/router";
import { Suspense, createSignal } from "solid-js";
import SideNav from "~/components/game/SideNav";
import TopbarWrapper from "~/components/game/layout/TopbarWrapper";
import Loader from "~/components/ui/Loader";

// Importiamo l'icona del menu hamburger
import { FiMenu } from "solid-icons/fi";

export default function GameLayout(props: RouteSectionProps) {
  // Segnale per controllare lo stato del menu mobile (aperto/chiuso)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);

  return (
    <div class="h-screen bg-abyss text-ghost flex overflow-hidden">
      {/* La SideNav ora riceve le props per gestirsi su mobile */}
      <SideNav 
        isOpen={isMobileMenuOpen()} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <div class="flex-1 flex flex-col">
        {/* --- Pulsante Menu Mobile --- */}
        {/* Questo pulsante è visibile solo su schermi piccoli (md:hidden) */}
        <div class="md:hidden h-16 flex-shrink-0 flex items-center px-4">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <FiMenu class="w-6 h-6 text-ghost" />
          </button>
        </div>

        {/* La Topbar non è più visibile su schermi piccoli per dare spazio */}
        <div class="hidden md:block">
          <TopbarWrapper />
        </div>
        
        <main class="flex-1 p-4 md:p-8 overflow-y-auto relative">
          <Suspense fallback={<Loader inCenter={true} />}>
            {props.children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}