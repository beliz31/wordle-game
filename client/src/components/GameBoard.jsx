// components/GameBoard.jsx
import { useEffect } from "react";
import clsx from "clsx";
import { useGame } from "../context/GameContext";

const EMPTY_ROW = Array(5).fill({ letter: "", status: "empty" });
const MAX_ROWS = 6;

// ─── Single Tile ──────────────────────────────────────────────────────────────
function Tile({ letter, status, delay = 0, animate = false }) {
  const base =
    "relative w-full aspect-square flex items-center justify-center font-display text-2xl md:text-3xl tracking-wide select-none rounded-md border-2 transition-colors";

  const statusStyles = {
    empty: "border-white/10 bg-tile-empty text-transparent",
    filled: "border-white/20 bg-tile-filled text-white scale-105",
    correct: "border-neon-green bg-tile-correct text-bg-primary shadow-neon-green",
    present: "border-neon-yellow bg-tile-present text-bg-primary shadow-neon-yellow",
    absent: "border-neon-gray bg-tile-absent text-white/50",
  };

  return (
    <div
      className={clsx(base, statusStyles[status] || statusStyles.empty)}
      style={{
        animationDelay: animate ? `${delay}ms` : "0ms",
        ...(animate && status !== "empty" && status !== "filled"
          ? {
              animation: `flipIn 0.25s ease-in ${delay}ms forwards, flipOut 0.25s ease-in ${delay + 250}ms reverse forwards`,
            }
          : {}),
      }}
    >
      {letter && (
        <span
          className={clsx(
            "font-display",
            status === "correct" || status === "present"
              ? "text-bg-primary"
              : "text-white"
          )}
          style={{ textShadow: status === "correct" ? "0 1px 3px rgba(0,0,0,0.4)" : "none" }}
        >
          {letter.toUpperCase()}
        </span>
      )}
      {/* Glow pulse for correct tiles */}
      {status === "correct" && (
        <div className="absolute inset-0 rounded-md bg-neon-green/20 animate-pulse" />
      )}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function Row({ cells, shake = false, revealed = false }) {
  return (
    <div className={clsx("grid grid-cols-5 gap-1.5", shake && "animate-shake")}>
      {cells.map((cell, i) => (
        <Tile
          key={i}
          letter={cell.letter}
          status={cell.status}
          delay={i * 100}
          animate={revealed}
        />
      ))}
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default function GameBoard() {
  const { state } = useGame();
  const { guesses, currentGuess, shake } = state;

  // Build rows
  const rows = [];

  // Submitted guesses
  guesses.forEach((g) => {
    rows.push(
      g.result.map((cell) => ({ letter: cell.letter, status: cell.status }))
    );
  });

  // Current active row
  if (rows.length < MAX_ROWS) {
    const activeRow = Array(5)
      .fill(null)
      .map((_, i) => ({
        letter: currentGuess[i] || "",
        status: currentGuess[i] ? "filled" : "empty",
      }));
    rows.push(activeRow);
  }

  // Empty rows
  while (rows.length < MAX_ROWS) {
    rows.push(EMPTY_ROW.map((c) => ({ ...c })));
  }

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[19rem] mx-auto">
      {rows.map((cells, i) => {
        const isActive = i === guesses.length && guesses.length < MAX_ROWS;
        const isRevealed = i < guesses.length;
        return (
          <Row
            key={i}
            cells={cells}
            shake={isActive && shake}
            revealed={isRevealed}
          />
        );
      })}
    </div>
  );
}
