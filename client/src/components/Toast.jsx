// components/Toast.jsx
import { useGame } from "../context/GameContext";
import clsx from "clsx";

const TYPE_STYLES = {
  success: "bg-neon-green text-bg-primary",
  error: "bg-red-500 text-white",
  warning: "bg-neon-yellow text-bg-primary",
  info: "bg-bg-elevated text-white border border-white/10",
};

export default function Toast() {
  const { state } = useGame();
  const { toast } = state;

  if (!toast) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-slide-up">
      <div
        className={clsx(
          "px-5 py-3 rounded-xl font-mono text-sm font-bold shadow-2xl backdrop-blur-sm",
          TYPE_STYLES[toast.type] || TYPE_STYLES.info
        )}
      >
        {toast.message}
      </div>
    </div>
  );
}
