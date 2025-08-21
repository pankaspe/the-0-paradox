import { For, createEffect } from "solid-js";
import type { InteractionLog } from "~/lib/paradoxStore";
import { AnimatedLine } from "./AnimatedLine";

interface Props {
  log: InteractionLog[];
}

export function InvestigationConsole(props: Props) {
  let consoleRef: HTMLDivElement | undefined;

  const scrollToBottom = () => {
    if (consoleRef) {
      consoleRef.scrollTop = consoleRef.scrollHeight;
    }
  };

  // createEffect assicura che lo scroll avvenga ogni volta che il log si aggiorna
  createEffect(() => {
    scrollToBottom();
  });

  return (
    <>
      {/* CSS per nascondere la scrollbar in modo cross-browser */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE, Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <div
        ref={consoleRef}
        class="w-full h-40 bg-black/70 p-3 font-mono text-xs overflow-y-auto no-scrollbar" // h-40 per renderla più compatta
      >
        <For each={props.log}>
          {(entry, i) => {
            // Determiniamo il colore in base al tipo di log e alla posizione
            const isWelcomeMessage = i() < 2; // I primi due messaggi sono quelli di benvenuto

            const colorClass = () => {
              if (isWelcomeMessage) {
                return 'text-green-400'; // Verde per il "Kernel Paradox OS"
              }
              if (entry.type === 'command') {
                return 'text-sky-400'; // Blu per i comandi dell'utente (ESAMINA, RIFLETTI)
              }
              // Per default (outcome), il colore è un blu più chiaro/bianco sporco
              return 'text-sky-200';
            };

            return (
              <p class={colorClass()}>
                {entry.type === 'command' && '> '}
                <AnimatedLine fullText={entry.text} onFinished={scrollToBottom} />
              </p>
            );
          }}
        </For>
        
        {/* Cursore lampeggiante finale */}
        <div class="flex items-center gap-2 mt-1">
          <span class="text-green-400">{'>'}</span>
          <span class="inline-block w-1.5 h-3.5 bg-green-400 translate-y-px animate-pulse" />
        </div>
      </div>
    </>
  );
}