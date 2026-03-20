// components/LobbyScreen.jsx
import { useState } from "react";
import { useGame } from "../context/GameContext";
import { useGameActions } from "../hooks/useGameActions";
import { t } from "../utils/i18n";
import clsx from "clsx";

const MODES = [
  {
    id: "duel",
    icon: "⚔️",
    color: "neon-blue",
    borderColor: "border-blue-500",
    glowColor: "shadow-neon-blue",
    bgActive: "bg-blue-500/10",
  },
  {
    id: "group",
    icon: "🏁",
    color: "neon-green",
    borderColor: "border-green-500",
    glowColor: "shadow-neon-green",
    bgActive: "bg-green-500/10",
  },
  {
    id: "battle_royale",
    icon: "💀",
    color: "neon-red",
    borderColor: "border-red-500",
    glowColor: "shadow-neon-red",
    bgActive: "bg-red-500/10",
  },
];

const LANG_OPTIONS = ["tr", "en"];

export default function LobbyScreen() {
  const { state, dispatch } = useGame();
  const { createRoom, joinRoom, setLang } = useGameActions();
  const { lang } = state;

  const [tab, setTab] = useState("create"); // create | join
  const [playerName, setPlayerName] = useState("");
  const [selectedMode, setSelectedMode] = useState("group");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!playerName.trim()) return;
    setLoading(true);
    try {
      dispatch({ type: "SET_PLAYER_NAME", payload: playerName });
      await createRoom(playerName, selectedMode);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!playerName.trim() || joinCode.length < 6) return;
    setLoading(true);
    try {
      dispatch({ type: "SET_PLAYER_NAME", payload: playerName });
      await joinRoom(joinCode, playerName);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,211,83,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(57,211,83,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Scan line effect */}
      <div className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent animate-scan-line" />

      {/* Lang toggle */}
      <div className="absolute top-6 right-6 flex gap-1 bg-bg-card rounded-lg p-1">
        {LANG_OPTIONS.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={clsx(
              "px-3 py-1 rounded-md text-xs font-mono font-bold uppercase transition-all duration-150",
              lang === l
                ? "bg-neon-green text-bg-primary"
                : "text-gray-400 hover:text-white"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Logo */}
      <div className="mb-10 text-center">
        <h1
          className="font-display text-7xl md:text-8xl tracking-widest text-white leading-none"
          style={{ textShadow: "0 0 30px rgba(57,211,83,0.5)" }}
        >
          {t(lang, "appTitle")}
        </h1>
        <p className="font-mono text-neon-green text-sm tracking-[0.4em] uppercase mt-1 opacity-80">
          {t(lang, "appSubtitle")}
        </p>
        {/* Decorative tiles */}
        <div className="flex justify-center gap-1.5 mt-4">
          {["correct","present","absent","correct","present"].map((s, i) => (
            <div
              key={i}
              className={clsx(
                "w-5 h-5 rounded-sm",
                s === "correct" && "bg-neon-green",
                s === "present" && "bg-neon-yellow",
                s === "absent" && "bg-neon-gray"
              )}
            />
          ))}
        </div>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md bg-bg-card border border-white/5 rounded-2xl p-6 shadow-2xl">
        {/* Name input */}
        <div className="mb-5">
          <label className="block font-mono text-xs uppercase tracking-widest text-gray-400 mb-2">
            {t(lang, "yourName")}
          </label>
          <input
            type="text"
            maxLength={16}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder={t(lang, "namePlaceholder")}
            className="w-full bg-bg-elevated border border-white/10 rounded-lg px-4 py-3 font-mono text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/30 transition-all"
          />
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-bg-elevated p-1 mb-5 gap-1">
          {[
            { id: "create", label: t(lang, "createRoom") },
            { id: "join", label: t(lang, "joinRoom") },
          ].map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={clsx(
                "flex-1 py-2 rounded-md font-mono text-sm font-bold transition-all duration-200",
                tab === tb.id
                  ? "bg-neon-green text-bg-primary shadow-neon-green"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {tab === "create" && (
          <div className="animate-fade-in">
            {/* Mode selector */}
            <label className="block font-mono text-xs uppercase tracking-widest text-gray-400 mb-3">
              {t(lang, "selectMode")}
            </label>
            <div className="flex flex-col gap-2 mb-5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={clsx(
                    "flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 text-left",
                    selectedMode === m.id
                      ? `${m.borderColor} ${m.bgActive} ${m.glowColor}`
                      : "border-white/5 hover:border-white/10 bg-bg-elevated"
                  )}
                >
                  <span className="text-2xl leading-none">{m.icon}</span>
                  <div>
                    <p className="font-mono font-bold text-white text-sm">
                      {t(lang, `mode${m.id.replace(/_([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase())}`)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t(lang, `mode${m.id.replace(/_([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase())}Desc`)}
                    </p>
                  </div>
                  {selectedMode === m.id && (
                    <div className={clsx("ml-auto w-2 h-2 rounded-full", `bg-${m.color}`.replace("neon-",""))} />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleCreate}
              disabled={!playerName.trim() || loading}
              className="w-full py-3.5 rounded-xl font-display text-lg tracking-widest bg-neon-green text-bg-primary hover:brightness-110 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-neon-green"
            >
              {loading ? t(lang, "loading") : t(lang, "createRoom")}
            </button>
          </div>
        )}

        {tab === "join" && (
          <div className="animate-fade-in">
            <label className="block font-mono text-xs uppercase tracking-widest text-gray-400 mb-2">
              {t(lang, "roomCode")}
            </label>
            <input
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder={t(lang, "roomCodePlaceholder")}
              className="w-full bg-bg-elevated border border-white/10 rounded-lg px-4 py-3 font-mono text-white placeholder-gray-600 focus:outline-none focus:border-neon-yellow/50 focus:ring-1 focus:ring-neon-yellow/30 transition-all text-2xl tracking-[0.5em] uppercase mb-5"
            />
            <button
              onClick={handleJoin}
              disabled={!playerName.trim() || joinCode.length < 6 || loading}
              className="w-full py-3.5 rounded-xl font-display text-lg tracking-widest bg-neon-yellow text-bg-primary hover:brightness-110 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-neon-yellow"
            >
              {loading ? t(lang, "loading") : t(lang, "join")}
            </button>
          </div>
        )}
      </div>

      {/* Extra modes */}
      <div className="w-full max-w-md mt-3 flex flex-col gap-2">
        <button
          onClick={() => dispatch({ type: "SET_PHASE", payload: "singleplayer" })}
          className="w-full py-3 rounded-xl font-mono text-sm text-gray-400 border border-white/5 bg-bg-card hover:border-white/20 hover:text-white transition-all duration-150"
        >
          🎮 Tek Başına Oyna
        </button>
        <button
          onClick={() => dispatch({ type: "SET_PHASE", payload: "endless" })}
          className="w-full py-3 rounded-xl font-mono text-sm text-neon-yellow border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/40 transition-all duration-150"
        >
          ♾️ Sonsuz Mod
        </button>
      </div>

      {/* Connection status */}
      <div className="mt-4 flex items-center gap-2">
        <div
          className={clsx(
            "w-2 h-2 rounded-full",
            state.connected ? "bg-neon-green animate-pulse" : "bg-red-500"
          )}
        />
        <span className="font-mono text-xs text-gray-500">
          {state.connected ? "Bağlı" : "Bağlanıyor..."}
        </span>
      </div>
    </div>
  );
}
