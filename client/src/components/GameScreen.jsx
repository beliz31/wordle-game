// components/GameScreen.jsx
import { useGame } from "../context/GameContext";
import { useGameActions } from "../hooks/useGameActions";
import { t } from "../utils/i18n";
import GameBoard from "./GameBoard";
import Keyboard from "./Keyboard";
import OpponentGrid from "./OpponentGrid";
import clsx from "clsx";

const MODE_LABELS = {
  duel: "⚔️ Düello",
  group: "🏁 Grup Yarışı",
  battle_royale: "💀 Battle Royale",
};

export default function GameScreen() {
  const { state } = useGame();
  const { room, phase, guesses, lang, opponents } = state;

  const isEliminated = phase === "eliminated";
  const isWon = phase === "finished_won";

  const remainingPlayers =
    room?.mode === "battle_royale"
      ? Object.values(opponents).filter((o) => !o.eliminated).length + (isEliminated ? 0 : 1)
      : null;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      {/* BG grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,211,83,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57,211,83,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-bg-secondary/80 backdrop-blur-sm relative z-10">
        <span className="font-display text-xl tracking-widest text-white">
          {t(lang, "appTitle")}
        </span>
        <span className="font-mono text-xs text-gray-500">
          {MODE_LABELS[room?.mode] || ""}
        </span>
        <div className="flex items-center gap-3">
          {room?.mode === "battle_royale" && remainingPlayers !== null && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="text-xs font-mono text-red-400">
                👥 {remainingPlayers}
              </span>
            </div>
          )}
          <span className="font-mono text-xs text-gray-500">
            {guesses.length}/6
          </span>
        </div>
      </header>

      {/* Eliminated Banner */}
      {isEliminated && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-center animate-fade-in">
          <p className="font-mono text-sm text-red-400">
            💀 {t(lang, "eliminated")} — İzlemeye devam edebilirsin
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-auto">
        {/* Left: Board + Keyboard */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className={clsx("w-full", isEliminated && "opacity-50 pointer-events-none")}>
            <GameBoard />
          </div>

          {!isEliminated && (
            <div className="w-full">
              <Keyboard />
            </div>
          )}

          {isEliminated && (
            <div className="font-mono text-sm text-gray-500 text-center animate-fade-in">
              Elendin — rakipleri izle 👀
            </div>
          )}

          {isWon && (
            <div className="font-display text-3xl text-neon-green text-center animate-bounce"
              style={{ textShadow: "0 0 20px rgba(57,211,83,0.6)" }}>
              KAZANDIN! 🎉
            </div>
          )}
        </div>

        {/* Right: Opponents */}
        <div className="md:w-48 flex flex-col">
          <OpponentGrid />
        </div>
      </div>
    </div>
  );
}
