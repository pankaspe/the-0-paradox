// src/components/game/LogoutButton.tsx
import { action } from "@solidjs/router";
import { signOutUser } from "~/lib/game-actions";

interface LogoutButtonProps {
  class?: string;
}

// Definiamo l'azione usando l'helper `action`
const logoutAction = action(signOutUser, "logout");

export default function LogoutButton(props: LogoutButtonProps) {
  return (
    // Usiamo un componente <Form> di Solid Router
    <form action={logoutAction}>
      <button
        type="submit" // I pulsanti nei form devono avere type="submit"
        class={props.class || ""}
      >
        Logout
      </button>
    </form>
  );
}