// src/components/ui/Spinner.tsx
import { type Component } from "solid-js";

const Spinner: Component<{ class?: string }> = (props) => {
  return (
    <div
      class={`animate-spin rounded-full border-2 border-transparent border-t-biolume ${props.class || 'h-6 w-6'}`}
      role="status"
    >
      <span class="sr-only">Caricamento...</span>
    </div>
  );
};

export default Spinner;