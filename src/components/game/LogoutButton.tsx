// src/components/game/LogoutButton.tsx

import { useNavigate } from "@solidjs/router";
import { signOutUser } from "~/lib/game-actions";
import { createSignal } from "solid-js";
import Spinner from "../ui/Spinner"; // Assumendo che tu abbia uno spinner

interface LogoutButtonProps {
  class?: string;
}

export default function LogoutButton(props: LogoutButtonProps) {
  // `useNavigate` è l'hook di Solid Router per navigare programmaticamente
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = createSignal(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    const result = await signOutUser();
    
    if (result.success) {
      // Se il logout ha successo, navighiamo alla homepage.
      // Usiamo un piccolo timeout per dare tempo alla UI di aggiornarsi se necessario,
      // e per evitare race condition.
      setTimeout(() => navigate("/", { replace: true }), 100);
    } else {
      // In caso di errore, potremmo mostrare un messaggio all'utente.
      console.error("Logout failed:", result.error);
      setIsLoggingOut(false);
    }
  };

  return (
    // Non più un <form>, ma un semplice bottone.
    <button
      onClick={handleLogout}
      disabled={isLoggingOut()}
      class={`${props.class || ""} flex items-center justify-center gap-2`}
    >
      {isLoggingOut() ? <Spinner class="w-4 h-4" /> : null}
      <span>Logout</span>
    </button>
  );
}