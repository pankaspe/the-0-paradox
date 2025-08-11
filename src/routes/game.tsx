// src/routes/game.tsx
import { onMount } from "solid-js";
import { A, type RouteSectionProps } from "@solidjs/router"; // Importa RouteSectionProps
import SideNav from "~/components/game/SideNav";
import { animate } from "motion/mini";

// La firma del componente cambia per accettare le props
export default function GameLayout(props: RouteSectionProps) {
  let mainContentRef: HTMLDivElement | undefined;

  // Anima l'elemento quando il componente viene montato
  onMount(() => {
    if (mainContentRef) {
      animate(mainContentRef, { opacity: [0, 1] }, { duration: 0.5 });
    }
  });

  return (
    <div class="min-h-screen bg-abyss text-ghost flex">
      <SideNav />
      <main ref={mainContentRef} class="flex-1 p-8 overflow-y-auto">
        {props.children}
      </main>
    </div>
  );
}