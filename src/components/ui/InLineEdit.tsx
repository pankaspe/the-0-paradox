// src/components/ui/InlineEdit.tsx
import { createSignal, onMount } from "solid-js";
import { Show } from "solid-js";
import { FiCheck, FiEdit, FiX } from "solid-icons/fi";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<boolean>; // Ritorna true se il salvataggio ha successo
  label?: string;
  inputClass?: string;
  textClass?: string;
}

export function InlineEdit(props: InlineEditProps) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [inputValue, setInputValue] = createSignal(props.value);
  let inputRef: HTMLInputElement | undefined;

  const handleSave = async () => {
    const success = await props.onSave(inputValue());
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setInputValue(props.value);
    setIsEditing(false);
  };

  return (
    <div class="flex items-center gap-2">
      <Show
        when={isEditing()}
        fallback={
          <>
            <Show when={props.label}><span class="text-ghost/70">{props.label}</span></Show>
            <span class={`font-bold text-starlight ml-1 ${props.textClass}`}>{props.value || "Senza Nome"}</span>
            <button
              onClick={() => {
                setInputValue(props.value);
                setIsEditing(true);
                setTimeout(() => inputRef?.focus(), 0);
              }}
              class="text-ghost/50 hover:text-ghost transition-colors"
              title="Modifica"
            >
              <FiEdit size={3} />
            </button>
          </>
        }
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue()}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          class={`bg-transparent border-b-2 border-biolume/50 focus:outline-none text-starlight font-bold ${props.inputClass}`}
        />
        <button onClick={handleSave} class="text-green-400 hover:text-green-300" title="Salva"><FiCheck /></button>
        <button onClick={handleCancel} class="text-red-400 hover:text-red-300" title="Annulla"><FiX /></button>
      </Show>
    </div>
  );
}