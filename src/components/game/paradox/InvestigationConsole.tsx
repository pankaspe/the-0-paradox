import { For, createEffect } from "solid-js";
import type { InteractionLog } from "~/lib/paradoxStore";
import { AnimatedLine } from "./AnimatedLine"; // Importiamo il nuovo componente
interface Props {
log: InteractionLog[];
}
export function InvestigationConsole(props: Props) {
let consoleRef: HTMLDivElement | undefined;
// Questa funzione fa scorrere la console fino in fondo
const scrollToBottom = () => {
if (consoleRef) {
consoleRef.scrollTop = consoleRef.scrollHeight;
}
};
// Usiamo createEffect per scorrere quando il log cambia
createEffect(() => {
scrollToBottom();
});
return (
<div
ref={consoleRef}
class="w-full h-48 bg-stone-950 p-4 font-mono text-sm text-green-400 overflow-y-auto"
>
<For each={props.log}>
{(entry) => (
<p classList={{ "text-blue-600": entry.type === 'command' }}>
{entry.type === 'command' && '> '}
{/* Usiamo AnimatedLine per mostrare il testo */}
<AnimatedLine fullText={entry.text} onFinished={scrollToBottom} />
</p>
)}
</For>
<div class="flex items-center gap-2 mt-2">
<span>$</span>
<span class="inline-block w-2 h-4 bg-green-400 translate-y-0.5 animate-pulse" />
</div>
</div>
);
}