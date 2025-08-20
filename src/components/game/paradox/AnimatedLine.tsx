import { createSignal, createEffect, onCleanup } from "solid-js";

interface Props {
  fullText: string;
  onFinished?: () => void; // Funzione opzionale da chiamare quando l'animazione finisce
}

export function AnimatedLine(props: Props) {
  const [displayedText, setDisplayedText] = createSignal("");
  
  createEffect(() => {
    // Ogni volta che il testo completo cambia, facciamo ripartire l'animazione
    setDisplayedText("");
    let index = 0;

    const interval = setInterval(() => {
      if (index < props.fullText.length) {
        setDisplayedText((prev) => prev + props.fullText[index]);
        index++;
      } else {
        clearInterval(interval);
        if (props.onFinished) props.onFinished();
      }
    }, 20); // 20ms di delay tra i caratteri. Puoi regolare questo valore per la velocità.

    // Pulisci l'intervallo se il componente viene distrutto o il testo cambia
    onCleanup(() => clearInterval(interval));
  });

  return <>{displayedText()}</>;
}