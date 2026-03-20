// components/OpponentGrid.jsx
import clsx from "clsx";
import { useGame } from "../context/GameContext";

const STATUS_COLOR = {
  correct: "bg-neon-green",
  present: "bg-neon-yellow",
  absent: "bg-neon-gray",
  empty: "bg-bg-elevated border border-white/5",
};

function MiniTile({ status }) {
  return (
    <div
      className={clsx(
        "w-4 h-4 rounded-sm transition-all duration-300",
        STATUS_COLOR[status] || STATUS_COLOR.empty
      )}
    />
  );
}

function MiniGrid({ grid, currentRow }) {
  // Build 6x5 grid
  const rows = [];
  for (let r = 0; r < 6; r++) {
    const guessRow = grid[r];
    const cells = [];
    for (let c = 0; c < 5; c++) {
      cells.push(guessRow ? guessRow[c]?.status || "empty" : "empty");
    }
    // Current active row indicator
    const isActive = r === currentRow && r < 6;
    rows.push({ cells, isActive });
  }

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1 items-center">
          {row.cells.map((status, ci) => (
            <MiniTile key={ci} status={status} />
          ))}
          {row.isActive && (
            <div className="w-1 h-1 rounded-full bg-neon-green animate-pulse ml-1" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OpponentGrid() {
  const { state } = useGame();
  const { opponents, room } = state;

  const opponentList = Object.values(opponents);
  if (opponentList.length === 0) return null;

  return (
    <div className="w-full">
      <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3 text-center">
        Rakipler
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {opponentList.map((opp) => (
          <div
            key={opp.id}
            className={clsx(
              "bg-bg-card border rounded-xl p-3 flex flex-col items-center gap-2 transition-all duration-300",
              opp.eliminated
                ? "border-red-500/30 opacity-40 grayscale"
                : opp.won
                ? "border-neon-green/40 shadow-neon-green"
                : "border-white/5"
            )}
          >
            {/* Name + status */}
            <div className="flex items-center gap-1.5">
              <div
                className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  opp.eliminated
                    ? "bg-red-500"
                    : opp.won
                    ? "bg-neon-green"
                    : opp.finished
                    ? "bg-gray-500"
                    : "bg-neon-green animate-pulse"
                )}
              />
              <span className="font-mono text-xs text-gray-300 truncate max-w-[80px]">
                {opp.name}
              </span>
              {opp.eliminated && (
                <span className="text-[9px] font-mono text-red-400 px-1 bg-red-500/10 rounded">
                  ELENDİ
                </span>
              )}
              {opp.won && (
                <span className="text-[9px] font-mono text-neon-green px-1 bg-green-500/10 rounded">
                  ✓
                </span>
              )}
            </div>

            {/* Mini grid */}
            <MiniGrid
              grid={opp.publicGrid || []}
              currentRow={opp.currentRow || 0}
            />

            {/* Row counter */}
            <span className="font-mono text-[10px] text-gray-600">
              {opp.currentRow || 0} / 6
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
