// src/components/game/layout/TopbarWrapper.tsx
import { gameStore } from "~/lib/gameStore";
import Topbar from "./Topbar";

export default function TopbarWrapper() {
  // Diamo un nome anche a questa query, lo stesso della pagina del profilo.  
  return (
      <Topbar 
        username={gameStore.profile?.username ?? null}
        soul_fragments={gameStore.profile?.soul_fragments ?? 0}
        energy={gameStore.profile?.energy ?? 0}
        avatar_id={gameStore.profile?.active_avatar_id ?? null}
      />
  );
}