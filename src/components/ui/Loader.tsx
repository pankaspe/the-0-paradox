// src/components/ui/Loader.tsx
import { type Component } from "solid-js";

interface LoaderProps {
  inCenter?: boolean; // Prop opzionale per centrarlo
}

const Loader: Component<LoaderProps> = (props) => {
  const wrapperClass = props.inCenter
    ? "absolute inset-0 flex flex-col items-center justify-center bg-abyss/50"
    : "flex flex-col items-center justify-center space-y-2 py-10";

  return (
    <div class={wrapperClass}>
      <div class="relative flex h-10 w-10">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-10 w-10 bg-primary"></span>
      </div>
      <p class="mt-4 text-primary/80 text-sm tracking-wider">Inizializzazione...</p>
    </div>
  );
};

export default Loader;