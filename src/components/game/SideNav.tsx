// src/components/game/SideNav.tsx
import { For, type Component } from "solid-js";
import { A } from "@solidjs/router";
import { Motion } from "solid-motionone";
import { CgGames } from "solid-icons/cg";
import { BiSolidDashboard, BiSolidPlanet } from 'solid-icons/bi';
import { FaSolidShop } from 'solid-icons/fa';
import { BsStars } from 'solid-icons/bs';
import { FaSolidUserGear, FaSolidInfo } from 'solid-icons/fa'


const menuItems = [
  { href: "/game/about", text: "The project", icon: FaSolidInfo },
  { href: "/game/dashboard", text: "Dashboard", icon: BiSolidDashboard },
  { href: "/game/bioma", text: "Bioma", icon: BiSolidPlanet },
  { href: "/game/profile", text: "Profilo", icon: FaSolidUserGear },
  { href: "/game/chronicles", text: "Cronache", icon: CgGames },
  { href: "/game/galaxy-map", text: "Galassia", icon: BsStars },
  { href: "/game/emporio", text: "Emporio", icon: FaSolidShop },
];

const NavLink: Component<{ href: string; icon: any; text: string }> = (props) => {
  const Icon = props.icon;
  return (
    <A 
      href={props.href} 
      class="group flex flex-col items-center justify-center gap-1 w-full h-full transition-colors text-ghost/60 hover:text-biolume"
      activeClass="active-link"
      end
    >
      <div class="relative flex items-center justify-center">
        <div class="absolute rounded-full blur-lg transition-opacity duration-500 opacity-0 group-[.active-link]:opacity-60 bg-glow-start w-10 h-10"></div>
        <Icon class="relative w-7 h-7 flex-shrink-0 transition-colors duration-300 group-[.active-link]:text-glow-start" />
      </div>
      
      <span class="text-[10px] font-semibold tracking-wide transition-colors group-[.active-link]:bg-gradient-to-r group-[.active-link]:from-glow-start group-[.active-link]:to-glow-end group-[.active-link]:bg-clip-text group-[.active-link]:text-transparent group-[.active-link]:animate-gradient-text"
        style={{"background-size": "200% 200%"}}
      >
        {props.text}
      </span>
    </A>
  );
};

export default function SideNav() {
  return (
    <>
      {/* --- LAYOUT DESKTOP --- */}
      {/* 
        1. Il Motion.div è il figlio diretto del flex container del layout.
           Dobbiamo dirgli di non restringersi (`flex-shrink-0`).
      */}
      <Motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, easing: "ease-out" }}
        class="hidden lg:flex flex-shrink-0 bg-abyss" // Aggiunto flex-shrink-0
      >
        {/* 
          2. Il <nav> interno deve occupare tutta l'altezza del suo genitore.
             `h-full` fa esattamente questo.
        */}
        <nav class="w-24 bg-gradient-to-b from-abyss to-starlight/10 p-4 flex flex-col border-r border-starlight/10 h-full">
          <div class="text-center mb-16 mt-4">
            <A href="/game/dashboard" class="group">
              <h2 class="text-4xl font-bold text-biolume group-hover:animate-pulse tracking-widest">B</h2>
              <p class="text-sm text-biolume/50 tracking-widest -mt-2">Z</p>
            </A>
          </div>
          <ul class="space-y-8">
            <For each={menuItems}>
              {(item) => (
                <li><NavLink href={item.href} icon={item.icon} text={item.text} /></li>
              )}
            </For>
          </ul>
          <div class="mt-auto text-center text-xs text-starlight/40">
            <p>v0.1.0</p>
          </div>
        </nav>
      </Motion.div>

      {/* --- LAYOUT MOBILE --- */}
      <Motion.nav
        initial={{ y: "100%" }} // Parte da sotto lo schermo
        animate={{ y: 0 }}
        transition={{ duration: 0.5, easing: "ease-out" }}
        class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-abyss/80 backdrop-blur-lg border-t border-starlight/10 z-50"
      >
        <ul class="flex justify-around items-center h-full">
          <For each={menuItems}>
            {(item) => (
              <li class="flex-1 h-full"><NavLink href={item.href} icon={item.icon} text={item.text} /></li>
            )}
          </For>
        </ul>
      </Motion.nav>
    </>
  );
}