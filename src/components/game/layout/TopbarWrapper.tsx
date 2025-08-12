// src/components/game/layout/TopbarWrapper.tsx
import { createAsync } from "@solidjs/router";
import { Suspense } from "solid-js";
import { getGameData } from "~/lib/game-actions";
import Topbar from "./Topbar";

export default function TopbarWrapper() {
  const data = createAsync(() => getGameData());
  return (
    <Suspense fallback={<div class="h-16 flex-shrink-0 bg-abyss" />}>
      <Topbar 
        soul_fragments={data()?.soul_fragments ?? 0}
        energy={data()?.energy ?? 0}
        avatar_id={data()?.active_avatar_id ?? null}
      />
    </Suspense>
  );
}