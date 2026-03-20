// components/WaitingRoom.jsx
import { useGame } from "../context/GameContext";
import { useGameActions } from "../hooks/useGameActions";
import { t } from "../utils/i18n";
import clsx from "clsx";

const MODE_ICONS = { duel: "⚔️", group: "🏁", battle_royale: "💀" };
const MODE_COLORS = {
  duel: "text-blue-400 border-blue-500/30 bg-blue-500/5",
  group: "text-green-400 border-green-500/30 bg-green-500/5",
  battle_royale: "text-red-400 border-red-500/30 bg-red-500/5",
};

export default function WaitingRoom() {
  const { state, dispatch } = useGame();
  const { startGame, resetGame } = useGameActions();
  const { room, isHost, lang, socket } = state;

  if (!room) return null;

  const modeName = {
    duel: t(lang, "modeDuel"),
    group: t(lang, "modeGroup"),
    battle_royale: t(lang, "modeBattleRoyale"),
  }[room.mode];

  function copyCode() {
    navigator.clipboard.writeText(room.id);
    // Toast via context
    dispatch({ type: "SET_TOAST", payload: { message: t(lang, "toastCopied"), type: "success" } });
    setTimeout(() => dispatch({ type: "SET_TOAST", payload: null }), 2000);
  }

  const canStart =
    isHost &&
    ((room.mode === "duel" && room.players.length >= 2) ||
      (room.mode !== "duel" && room.players.length >= 2));

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* BG grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,211,83,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(57,211,83,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl tracking-widest text-white">
            {t(lang, "appTitle")}
          </h1>
          <div className={clsx("inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full border font-mono text-sm", MODE_COLORS[room.mode])}>
            <span>{MODE_ICONS[room.mode]}</span>
            <span>{modeName}</span>
          </div>
        </div>

        {/* Room code card */}
        <div className="bg-bg-card border border-white/5 rounded-2xl p-6 mb-4">
          <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2 text-center">
            {t(lang, "roomCode")}
          </p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="font-display text-5xl tracking-[0.3em] text-neon-green"
              style={{ textShadow: "0 0 20px rgba(57,211,83,0.6)" }}>
              {room.id}
            </span>
            <button
              onClick={copyCode}
              className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-elevated/80 text-gray-400 hover:text-white transition-all"
              title={t(lang, "copy")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Players list */}
          <div className="border-t border-white/5 pt-4">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">
              {t(lang, "players")} ({room.players.length})
            </p>
            <div className="flex flex-col gap-2">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 bg-bg-elevated rounded-lg px-3 py-2"
                >
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="font-mono text-sm text-white flex-1">{p.name}</span>
                  {p.id === room.host && (
                    <span className="text-xs font-mono text-neon-yellow px-2 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                      HOST
                    </span>
                  )}
                  {p.id === socket?.id && (
                    <span className="text-xs font-mono text-gray-500">(sen)</span>
                  )}
                </div>
              ))}
            </div>

            {/* Waiting dots */}
            {room.mode === "duel" && room.players.length < 2 && (
              <div className="flex items-center gap-3 bg-bg-elevated rounded-lg px-3 py-2 mt-2 opacity-40 border border-dashed border-white/10">
                <div className="w-2 h-2 rounded-full bg-gray-600" />
                <span className="font-mono text-sm text-gray-500">{t(lang, "waitingForPlayers")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        {isHost ? (
          <button
            onClick={startGame}
            disabled={!canStart}
            className="w-full py-4 rounded-xl font-display text-xl tracking-widest bg-neon-green text-bg-primary hover:brightness-110 active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shadow-neon-green"
          >
            {t(lang, "startGame")} →
          </button>
        ) : (
          <div className="text-center py-4 font-mono text-sm text-gray-400 animate-pulse">
            {t(lang, "waitingForHost")}
          </div>
        )}

        <button
          onClick={resetGame}
          className="w-full mt-3 py-2 rounded-xl font-mono text-sm text-gray-500 hover:text-white transition-colors"
        >
          ← {t(lang, "back")}
        </button>
      </div>
    </div>
  );
}
