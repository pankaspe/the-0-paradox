// src/components/game/bioma/CustomizationPanel.tsx

import { type Component, createMemo } from "solid-js";
import { type InventoryItemWithDetails, type EquippedLayers } from "~/types/game";
import { DesktopPanel } from "./DesktopPanel";
import { MobilePanel } from "./MobilePanel";

// I nomi dei gruppi che vogliamo mostrare
const groupDisplayNames: Record<string, string> = {
  bioma_background: "Sfondi",
  bioma_bioma: "Nuclei",
  // Aggiungi qui altre categorie future
  // 'aura': 'Aure',
};

interface CustomizationPanelProps {
  inventory: InventoryItemWithDetails[];
  equippedLayers: EquippedLayers | null;
  onEquip: (item: InventoryItemWithDetails) => void;
  savingItemId: string | null;
}

export const CustomizationPanel: Component<CustomizationPanelProps> = (props) => {

  // Creiamo i gruppi di oggetti una sola volta qui
  const groupedItems = createMemo(() => {
    return Object.keys(groupDisplayNames).map(type => {
      return {
        type: type,
        name: groupDisplayNames[type],
        items: props.inventory.filter(i => i.game_items?.item_type === type)
      }
    }).filter(group => group.items.length > 0); // Mostriamo solo gruppi con almeno un oggetto
  });

  return (
    <>
      {/* Mostra il pannello desktop su schermi md e più grandi */}
      <div class="hidden lg:flex h-full">
        <DesktopPanel 
          groups={groupedItems()}
          equippedLayers={props.equippedLayers}
          onEquip={props.onEquip}
          savingItemId={props.savingItemId}
        />
      </div>
      
      {/* Mostra il pannello mobile su schermi più piccoli di md */}
      <div class="lg:hidden">
        <MobilePanel 
          groups={groupedItems()}
          equippedLayers={props.equippedLayers}
          onEquip={props.onEquip}
          savingItemId={props.savingItemId}
        />
      </div>
    </>
  );
};