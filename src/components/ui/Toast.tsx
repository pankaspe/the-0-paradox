// src/components/ui/Toast.tsx

import { type Component, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { gameStore, gameStoreActions } from "~/lib/gameStore";
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from "solid-icons/fi";

const toastStyles = {
  success: { bg: 'bg-green-500/90', icon: FiCheckCircle },
  error: { bg: 'bg-red-500/90', icon: FiAlertTriangle },
  info: { bg: 'bg-blue-500/90', icon: FiInfo },
};

export const Toast: Component = () => {
  return (
    // Contenitore fisso in alto al centro dello schermo
    <div class="fixed top-5 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
      <Presence>
        <Show when={gameStore.toast}>
          {(toast) => {
            const styles = toastStyles[toast().type];
            const Icon = styles.icon;
            return (
              <Motion.div
                class={`pointer-events-auto flex items-center gap-4 text-white text-base font-semibold px-6 py-3 rounded-full shadow-lg ${styles.bg}`}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
              >
                <Icon class="w-6 h-6" />
                <span>{toast().message}</span>
                <button 
                  onClick={gameStoreActions.hideToast}
                  class="-mr-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <FiX class="w-5 h-5" />
                </button>
              </Motion.div>
            )
          }}
        </Show>
      </Presence>
    </div>
  );
};