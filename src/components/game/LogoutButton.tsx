// src/components/game/LogoutButton.tsx
import { createSignal } from "solid-js";
import { supabase } from "~/lib/supabase.client";
import { BiRegularLogOutCircle } from 'solid-icons/bi'

export default function LogoutButton() {
  const [loading, setLoading] = createSignal(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Dopo il logout, reindirizza alla homepage.
      window.location.href = "/"; 
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading()}
      class="mt-8 py-2 px-4 font-semibold text-abyss bg-starlight rounded-md transition hover:bg-starlight/80 disabled:bg-starlight/50"
    >
      {loading() ? "Uscita in corso..." : <BiRegularLogOutCircle />}
    </button>
  );
}