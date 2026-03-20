// components/Keyboard.jsx
import { useEffect, useCallback } from "react";
import clsx from "clsx";
import { useGame } from "../context/GameContext";
import { useGameActions } from "../hooks/useGameActions";
import { TR_KEYBOARD_ROWS, EN_KEYBOARD_ROWS, mapKeyEvent } from "../utils/keyboard";
import { t } from "../utils/i18n";

const STATUS_STYLES = {
  correct: "bg-neon-green text-bg-primary shadow-neon-green",
  present: "bg-neon-yellow text-bg-primary shadow-neon-yellow",
  absent: "bg-neon-gray text-white/40",
  default: "bg-bg-elevated text-white hover:bg-white/10",
};

function Key({ label, onPress, status, wide = false }) {
  return (
    <button
      onClick={() => onPress(label)}
      className={clsx(
        "flex items-center justify-center rounded-md font-mono font-bold text-sm transition-all duration-150 active:scale-90 select-none",
        wide ? "px-3 py-4 text-xs flex-shrink-0" : "w-8 h-12 md:w-9",
        STATUS_STYLES[status] || STATUS_STYLES.default
      )}
    >
      {label === "DELETE" ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
      ) : label === "ENTER" ? (
        <span className="text-[10px] font-bold tracking-wide">GİR</span>
      ) : (
        label.toUpperCase()
      )}
    </button>
  );
}

export default function Keyboard() {
  const { state } = useGame();
  const { typeLetter, deleteLetter, submitGuess } = useGameActions();
  const { keyStatuses, phase, lang } = state;

  const rows = lang === "tr" ? TR_KEYBOARD_ROWS : EN_KEYBOARD_ROWS;

  const handleKey = useCallback(
    (key) => {
      if (phase !== "playing") return;
      if (key === "ENTER") submitGuess();
      else if (key === "DELETE") deleteLetter();
      else typeLetter(key);
    },
    [phase, submitGuess, deleteLetter, typeLetter]
  );

  // Physical keyboard support
  useEffect(() => {
    function onKeyDown(e) {
      const key = mapKeyEvent(e);
      if (key) {
        e.preventDefault();
        handleKey(key);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  return (
    <div className="flex flex-col items-center gap-1.5 w-full max-w-sm mx-auto select-none">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1 justify-center">
          {row.map((key) => (
            <Key
              key={key}
              label={key}
              onPress={handleKey}
              status="default"
              wide={key === "ENTER" || key === "DELETE"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
