// src/components/ui/Logo.tsx

import { type Component } from "solid-js";
import { A } from "@solidjs/router";
import { Motion } from "solid-motionone";

interface LogoProps {
  class?: string;
  href: string;
}

/**
 * Un componente Logo animato e reattivo per Bioma Zero.
 * Il colore del testo pulsa lentamente attraverso una palette di colori,
 * animato esclusivamente con Solid-Motionone.
 */
export const Logo: Component<LogoProps> = (props) => {
  // Definiamo la nostra palette di colori per l'animazione
  const colorKeyframes = [
    "hsl(158 72% 66%)", // Biolume (Verde)
    "hsl(231 48% 68%)", // Starlight (Blu)
    "hsl(262 84% 70%)", // Un viola complementare
    "hsl(231 48% 68%)", // Starlight (Blu)
    "hsl(158 72% 66%)", // Ritorno a Biolume per un ciclo perfetto
  ];

  // Definiamo le opzioni di transizione per un'animazione lenta e infinita
  const transitionOptions = {
    duration: 12, // Durata molto lenta per un effetto "respiro"
    repeat: Infinity,
    ease: "ease-in-out",
  };

  return (
    <Motion.div
      class={props.class}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, easing: "ease-out" }}
    >
      <A href={props.href} class="group outline-none" title="Vai alla Dashboard">
        {/* --- LOGO DESKTOP --- */}
        <div class="hidden md:block">
          {/* Usiamo Motion.h2 per poter animare le sue proprietà */}
          <Motion.h2
            class="text-4xl font-bold transition-all duration-300 group-hover:brightness-150"
            // Applichiamo l'animazione del colore direttamente qui
            animate={{ color: colorKeyframes }}
            transition={transitionOptions}
            // L'aura (drop-shadow) è fissa e applicata con lo stile
            style={{ 
              filter: "drop-shadow(0 0 8px hsl(158 72% 66% / 0.4))"
            }}
          >
            Bioma Zero
          </Motion.h2>
        </div>

        {/* --- LOGO MOBILE (MONOGRAMMA) --- */}
        <div class="block md:hidden">
          {/* Usiamo Motion.div per animare il colore, che verrà ereditato dagli span figli */}
          <Motion.div
            class="flex flex-col items-center justify-center font-bold transition-all duration-300 group-hover:brightness-150"
            animate={{ color: colorKeyframes }}
            transition={transitionOptions}
            style={{
              filter: "drop-shadow(0 0 8px hsl(158 72% 66% / 0.4))"
            }}
          >
            <span class="text-4xl leading-none">B</span>
            {/* Diamo un colore fisso a "ZERO" per un contrasto migliore */}
            <span class="text-sm leading-none tracking-widest text-biolume/80 -mt-1">
              ZERO
            </span>
          </Motion.div>
        </div>
      </A>
    </Motion.div>
  );
};