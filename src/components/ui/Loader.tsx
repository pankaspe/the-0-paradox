// in src/components/ui/Loader.tsx

import { IoSyncOutline } from "solid-icons/io";

// 1. Aggiungiamo 'text' alle props
interface LoaderProps {
  inCenter?: boolean;
  text?: string; // Prop opzionale per il testo
}

export default function Loader(props: LoaderProps) {
  return (
    <div
      class="flex flex-col items-center justify-center gap-4 text-text-main/80"
      classList={{
        "absolute inset-0 z-50": props.inCenter,
        "py-10": !props.inCenter,
      }}
    >
      <IoSyncOutline size={32} class="animate-spin" />
      {/* 2. Mostriamo il testo se viene passato */}
      {props.text && <p class="font-mono text-sm">{props.text}</p>}
    </div>
  );
}