// src/components/ui/Loader.tsx
import { type Component } from "solid-js";

const Loader: Component = () => {
  return (
    <div class="flex flex-col items-center justify-center space-y-2">
      <div class="relative flex h-8 w-8">
        {/* Cerchio che pulsa (lo sfondo) */}
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-biolume/75 opacity-75"></span>
        {/* Cerchio statico (il centro) */}
        <span class="relative inline-flex rounded-full h-8 w-8 bg-biolume"></span>
      </div>
      <p class="text-biolume/80 text-sm">Inizializzazione Universo...</p>
    </div>
  );
};

export default Loader;