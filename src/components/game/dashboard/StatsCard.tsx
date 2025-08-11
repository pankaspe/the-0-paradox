// src/components/game/dashboard/StatsCard.tsx
import { type ParentComponent } from "solid-js";

interface Props {
  title: string;
}

const StatsCard: ParentComponent<Props> = (props) => {
  return (
    <div class="bg-starlight/10 p-6 rounded-lg">
      <h3 class="text-lg font-bold text-biolume/80 mb-2">{props.title}</h3>
      <div class="space-y-1">
        {props.children}
      </div>
    </div>
  );
};

export default StatsCard;