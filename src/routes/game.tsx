// src/routes/game.tsx
import { A, type RouteSectionProps } from "@solidjs/router"; // Importa RouteSectionProps
import SideNav from "~/components/game/SideNav";
import { animate } from "motion/mini";

export default function GameLayout(props: RouteSectionProps) {
  return (
    <div class="min-h-screen bg-abyss text-ghost flex">
      <SideNav />
      <main class="flex-1 p-8 overflow-y-auto">
        {props.children}
      </main>
    </div>
  );
}