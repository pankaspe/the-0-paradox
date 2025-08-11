// src/components/game/SideNav.tsx
import { For, type Component } from "solid-js";
import { A } from "@solidjs/router";
import { BiSolidDashboard, BiSolidUser } from 'solid-icons/bi';
import LogoutButton from "~/components/game/LogoutButton";

// Un array di oggetti per definire i link del menu in modo dinamico
const menuItems = [
  { href: "/game/dashboard", text: "Dashboard", icon: BiSolidDashboard as Component },
  { href: "/game/profile", text: "Profilo", icon: BiSolidUser as Component },
  // Puoi aggiungere altri link qui
];

// Il nostro componente NavLink riutilizzabile, ora con layout a colonna
const NavLink = (props: { href: string, icon: Component, text: string }) => {
  return (
    <li>
     <A 
        href={props.href} 
        class="flex flex-col items-center p-2 rounded-md transition hover:bg-starlight/20"
        activeClass="bg-biolume/20 text-biolume font-bold"
        end
      >
        <span class="text-2xl">
          <props.icon /> 
        </span>
        <span class="text-xs mt-1">{props.text}</span>
      </A>
    </li>
  );
};

// Il componente SideNav principale
export default function SideNav() {
  return (
    <nav class="w-24 flex-shrink-0 bg-starlight/5 p-4 flex flex-col border-r border-starlight/10">
      <div>
        <h2 class="text-xl font-bold text-biolume text-center mb-8">BZ</h2>
        <ul class="space-y-4">
          <For each={menuItems}>
            {(item) => (
              <NavLink href={item.href} icon={item.icon} text={item.text} />
            )}
          </For>
        </ul>
      </div>
      <div class="mt-auto">
        <LogoutButton />
      </div>
    </nav>
  );
}