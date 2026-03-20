// components/GameOverScreen.jsx
import { useGame } from "../context/GameContext";
import { useGameActions } from "../hooks/useGameActions";
import { t } from "../utils/i18n";
import clsx from "clsx";

const RANK_STYLES = [
  "text-neon-yellow", // 🥇
  "text-gray-300",    // 🥈
  "text-orange-400",  // 🥉
];
const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default function GameOverScreen() {
  const { state } = useGame();
  const { gameResult, lang, socket } = state;
  const { resetGame } = useGameActions();

  if (!gameResult) return null;

  const { secret, leaderboard } = gameResult;
  const winner = leaderboard[0];
  const isWinner = winner?.id === socket?.id;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* BG */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,211,83,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57,211,83,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Winner flash */}
      {isWinner && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(57,211,83,0.08) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="w-full max-w-md animate-slide-up">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="font-display text-6xl tracking-widest"
            style={{
              color: isWinner ? "#39d353" : "white",
              textShadow: isWinner
                ? "0 0 30px rgba(57,211,83,0.7)"
                : "none",
            }}
          >
            {isWinner ? "KAZANDIN!" : t(lang, "gameOver")}
          </h1>
          <p className="font-mono text-gray-400 text-sm mt-2">
            {t(lang, "theWord")}:{" "}
            <span className="text-neon-green font-bold tracking-widest uppercase">
              {secret}
            </span>
          </p>
        </div>

        {/* Leaderboard */}
        <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-white/5 bg-bg-elevated">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-400 text-center">
              {t(lang, "leaderboard")}
            </p>
          </div>

          <div className="divide-y divide-white/5">
            {leaderboard.map((entry, i) => {
              const isMe = entry.id === socket?.id;
              const rankIcon = RANK_ICONS[i] || `${i + 1}.`;
              const rankColor = RANK_STYLES[i] || "text-gray-500";

              return (
                <div
                  key={entry.id}
                  className={clsx(
                    "flex items-center gap-4 px-4 py-3 transition-all",
                    isMe && "bg-neon-green/5 border-l-2 border-neon-green",
                    entry.eliminated && "opacity-40"
                  )}
                >
                  {/* Rank */}
                  <span className={clsx("w-8 text-center text-lg", rankColor)}>
                    {rankIcon}
                  </span>

                  {/* Name */}
                  <div className="flex-1">
                    <span className="font-mono text-sm text-white">
                      {entry.name}
                    </span>
                    {isMe && (
                      <span className="ml-2 text-xs font-mono text-neon-green">(sen)</span>
                    )}
                  </div>

                  {/* Result */}
                  <div className="text-right">
                    {entry.eliminated ? (
                      <span className="text-xs font-mono text-red-400">Elendi</span>
                    ) : entry.won ? (
                      <span className="text-xs font-mono text-neon-green">
                        ✓ {entry.attempts} deneme
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-gray-500">
                        Bulamadı
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secret word tiles */}
        <div className="flex justify-center gap-1.5 mb-6">
          {secret.split("").map((letter, i) => (
            <div
              key={i}
              className="w-10 h-10 flex items-center justify-center rounded-md bg-neon-green text-bg-primary font-display text-lg shadow-neon-green"
            >
              {letter.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={resetGame}
          className="w-full py-4 rounded-xl font-display text-xl tracking-widest bg-neon-green text-bg-primary hover:brightness-110 active:scale-95 transition-all shadow-neon-green mb-2"
        >
          {t(lang, "playAgain")} →
        </button>
        <button
          onClick={resetGame}
          className="w-full py-2 rounded-xl font-mono text-sm text-gray-500 hover:text-white transition-colors"
        >
          ← {t(lang, "backToLobby")}
        </button>
      </div>
    </div>
  );
}
