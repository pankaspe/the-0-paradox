// src/components/game/SideNav.tsx
import { For, type Component } from "solid-js";
import { A } from "@solidjs/router";
import { Motion } from "solid-motionone";

// Importiamo le icone
import { CgGames } from "solid-icons/cg";
import { BiSolidDashboard } from 'solid-icons/bi';
import { FaSolidShop } from 'solid-icons/fa';
import { BsStars } from 'solid-icons/bs';

const menuItems = [
  { href: "/game/dashboard", text: "Dashboard", icon: BiSolidDashboard },
  { href: "/game/chronicles", text: "Cronache", icon: CgGames },
  { href: "/game/galaxy-map", text: "Galassia", icon: BsStars },
  { href: "/game/emporium", text: "Emporio", icon: FaSolidShop },
];

const NavLink: Component<{ href: string; icon: any; text: string; index: number }> = (props) => {
  const Icon = props.icon;
  return (
    <Motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + props.index * 0.1, easing: "ease-out" }}
    >
      <A 
        href={props.href} 
        class="flex flex-col items-center gap-2 p-3 rounded-lg transition-colors text-ghost/60 hover:bg-starlight/10 hover:text-ghost"
        activeClass="!text-biolume"
        end
      >
        <Icon class="w-7 h-7 flex-shrink-0" />
        <span class="text-xs font-medium">{props.text}</span>
      </A>
    </Motion.li>
  );
};

// Il componente ora accetta props per gestire lo stato di apertura su mobile
interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideNav(props: SideNavProps) {
  return (
    <>
      {/* --- Overlay per Mobile --- */}
      {/* Appare solo quando il menu è aperto su mobile, per scurire lo sfondo */}
      <div 
        class={`fixed inset-0 z-30 bg-black/60 transition-opacity md:hidden ${props.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={props.onClose} 
      />

      {/* --- Contenuto della Sidebar --- */}
      <nav 
        class={`fixed top-0 left-0 h-full z-40 flex-shrink-0 bg-gradient-to-b from-abyss to-starlight/10 p-4 flex flex-col border-r border-starlight/10 transition-transform md:relative md:translate-x-0 ${props.isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Section */}
        <div class="text-center mb-16 mt-4">
          <A href="/game/dashboard" class="group">
            <h2 class="text-4xl font-bold text-biolume group-hover:animate-pulse tracking-widest">B</h2>
            <p class="text-sm text-biolume/50 tracking-widest -mt-2">Z</p>
          </A>
        </div>

        {/* Menu Section */}
        <ul class="space-y-6">
          <For each={menuItems}>
            {(item, index) => (
              <NavLink href={item.href} icon={item.icon} text={item.text} index={index()} />
            )}
          </For>
        </ul>

        {/* Footer Section */}
        <div class="mt-auto text-center text-xs text-starlight/40">
          <p>v0.1.0</p>
        </div>
      </nav>
    </>
  );
}