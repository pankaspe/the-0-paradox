// src/components/game/bioma/NarrativeLoader.tsx
import { Motion } from "solid-motionone";
import Spinner from "~/components/ui/Spinner"; // Assumiamo che tu abbia uno spinner

interface NarrativeLoaderProps {
  phrase: string;
}

export default function NarrativeLoader(props: NarrativeLoaderProps) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      class="flex flex-col items-center justify-center space-y-4 text-center"
    >
      <Spinner class="w-8 h-8 text-biolume" />
      <p class="text-xl font-light italic text-ghost/80">
        {props.phrase}
      </p>
    </Motion.div>
  );
}