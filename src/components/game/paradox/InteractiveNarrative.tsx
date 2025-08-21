import { createSignal, For, createMemo } from "solid-js";
import { Motion } from "solid-motionone";
import { Portal } from "solid-js/web";
import { paradoxStoreActions } from "~/lib/paradoxStore";

type InteractiveElement = {
  keyword: string;
  command: string;
  target: string;
};

interface Props {
  text: string;
  elements: InteractiveElement[];
}

export function InteractiveNarrative(props: Props) {
  const [menu, setMenu] = createSignal<{
    actions: { command: string; target: string }[];
    x: number;
    y: number;
  } | null>(null);

  const groupedElementsByKeyword = createMemo(() => {
    const map = new Map<string, { command: string; target: string }[]>();
    for (const el of props.elements) {
      if (!map.has(el.keyword)) map.set(el.keyword, []);
      map.get(el.keyword)!.push({ command: el.command, target: el.target });
    }
    return map;
  });

  const parsedText = createMemo(() => {
    const keywords = Array.from(groupedElementsByKeyword().keys());
    if (keywords.length === 0) return [props.text];
    
    const regex = new RegExp(`(${keywords.join("|")})`, "g");
    return props.text.split(regex);
  });

  const handleKeywordClick = (e: MouseEvent, keyword: string) => {
    const actions = groupedElementsByKeyword().get(keyword);
    if (actions) {
      setMenu({ actions, x: e.clientX, y: e.clientY });
    }
  };

  const handleActionClick = (target: string, command: string) => {
    paradoxStoreActions.handleInteraction(target, command);
    setMenu(null);
  };

  return (
    <div>
      <p class="text-xs md:text-sm text-text-main/80 mx-auto leading-relaxed">
        <For each={parsedText()}>
          {(part) =>
            groupedElementsByKeyword().has(part) ? (
              <button
                onClick={(e) => handleKeywordClick(e, part)}
                class="text-primary hover:underline font-bold transition-colors"
              >
                {part}
              </button>
            ) : (
              // Usa innerHTML per renderizzare i tag HTML come <br>
              <span innerHTML={part} />
            )
          }
        </For>
      </p>

      <Portal>
        {menu() && (
          <>
            <div
              class="fixed inset-0 z-40"
              onClick={() => setMenu(null)}
            />
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              class="fixed z-50 bg-surface border border-border rounded-md shadow-lg p-2 flex flex-col gap-1"
              style={{ top: `${menu()!.y + 5}px`, left: `${menu()!.x + 5}px` }}
            >
              <For each={menu()!.actions}>
                {(action) => (
                  <button
                    onClick={() => handleActionClick(action.target, action.command)}
                    class="px-4 py-1 text-left text-sm text-text-main hover:bg-primary hover:text-white rounded-sm transition-colors"
                  >
                    {action.command}
                  </button>
                )}
              </For>
            </Motion.div>
          </>
        )}
      </Portal>
    </div>
  );
}