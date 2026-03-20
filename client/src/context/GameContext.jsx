// context/GameContext.jsx
import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const GameContext = createContext(null);

// ─── Başlangıç Durumu ─────────────────────────────────────────────────────────
const initialState = {
  // Bağlantı
  socket: null,
  connected: false,

  // Oyuncu
  playerId: null,
  playerName: "",
  lang: "tr",

  // Oda
  room: null,
  roomCode: null,
  isHost: false,

  // Oyun
  phase: "lobby", // lobby | waiting | playing | eliminated | finished
  currentGuess: "",
  guesses: [],        // [{ letters: [...], result: [...] }]
  keyStatuses: {},    // harf -> "correct" | "present" | "absent"

  // Rakipler (canlı ızgara)
  opponents: {},      // playerId -> { name, currentRow, publicGrid, finished, won, eliminated }

  // Sonuç
  gameResult: null,   // { secret, leaderboard }

  // UI
  shake: false,
  toast: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "SET_SOCKET":
      return { ...state, socket: action.payload };
    case "SET_CONNECTED":
      return { ...state, connected: action.payload };
    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.payload };
    case "SET_LANG":
      return { ...state, lang: action.payload };
    case "SET_ROOM": {
      const room = action.payload;
      if (!room) return { ...state, room: null, roomCode: null, isHost: false };
      const isHost = room.host === state.socket?.id;
      // Build opponents map (exclude self)
      const opponents = {};
      room.players.forEach((p) => {
        if (p.id !== state.socket?.id) opponents[p.id] = p;
      });
      return { ...state, room, roomCode: room.id, isHost, opponents };
    }
    case "SET_PHASE":
      return { ...state, phase: action.payload };
    case "TYPE_LETTER": {
      if (state.currentGuess.length >= 5) return state;
      return { ...state, currentGuess: state.currentGuess + action.payload };
    }
    case "DELETE_LETTER": {
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
    }
    case "SUBMIT_GUESS_SUCCESS": {
      const { guess, result } = action.payload;
      const newGuess = { letters: guess.split(""), result };
      // Key statuses güncelle
      const keyStatuses = { ...state.keyStatuses };
      result.forEach((cell) => {
        const existing = keyStatuses[cell.letter];
        const priority = { correct: 3, present: 2, absent: 1 };
        if (!existing || priority[cell.status] > priority[existing]) {
          keyStatuses[cell.letter] = cell.status;
        }
      });
      return {
        ...state,
        guesses: [...state.guesses, newGuess],
        currentGuess: "",
        keyStatuses,
      };
    }
    case "UPDATE_OPPONENT": {
      const { playerId, data } = action.payload;
      return {
        ...state,
        opponents: {
          ...state.opponents,
          [playerId]: { ...state.opponents[playerId], ...data },
        },
      };
    }
    case "PLAYER_LEFT": {
      const { playerId, room } = action.payload;
      const opponents = { ...state.opponents };
      delete opponents[playerId];
      const isHost = room?.host === state.socket?.id;
      return { ...state, opponents, room: room || state.room, isHost };
    }
    case "GAME_STARTED": {
      const room = action.payload;
      const isHost = room.host === state.socket?.id;
      const opponents = {};
      room.players.forEach((p) => {
        if (p.id !== state.socket?.id) opponents[p.id] = p;
      });
      return {
        ...state,
        room,
        isHost,
        opponents,
        phase: "playing",
        currentGuess: "",
        guesses: [],
        keyStatuses: {},
        gameResult: null,
      };
    }
    case "SET_GAME_RESULT":
      return { ...state, gameResult: action.payload, phase: "finished" };
    case "SET_ELIMINATED":
      return { ...state, phase: "eliminated" };
    case "SHAKE":
      return { ...state, shake: true };
    case "STOP_SHAKE":
      return { ...state, shake: false };
    case "SET_TOAST":
      return { ...state, toast: action.payload };
    case "RESET":
      return {
        ...initialState,
        socket: state.socket,
        connected: state.connected,
        playerName: state.playerName,
        lang: state.lang,
      };
    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Toast helper
  const showToast = useCallback((message, type = "info", duration = 2500) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    dispatch({ type: "SET_TOAST", payload: { message, type } });
    toastTimerRef.current = setTimeout(
      () => dispatch({ type: "SET_TOAST", payload: null }),
      duration
    );
  }, []);

  // Socket bağlantısı
  useEffect(() => {
    const serverUrl = window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : window.location.origin;
    const socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    dispatch({ type: "SET_SOCKET", payload: socket });

    socket.on("connect", () => {
      dispatch({ type: "SET_CONNECTED", payload: true });
    });
    socket.on("disconnect", () => {
      dispatch({ type: "SET_CONNECTED", payload: false });
    });

    // Oda güncellendi (lobi aşamasında)
    socket.on("room_updated", (room) => {
      dispatch({ type: "SET_ROOM", payload: room });
    });

    // Oyun başladı
    socket.on("game_started", ({ room }) => {
      dispatch({ type: "GAME_STARTED", payload: room });
      showToast("Oyun başladı! 🎮", "success");
    });

    // Rakip tahmin yaptı
    socket.on("player_guessed", (data) => {
      dispatch({
        type: "UPDATE_OPPONENT",
        payload: {
          playerId: data.playerId,
          data: {
            currentRow: data.currentRow,
            publicGrid: data.publicGrid,
            finished: data.finished,
            won: data.won,
            eliminated: data.eliminated,
          },
        },
      });
    });

    // Battle Royale eleme
    socket.on("players_eliminated", ({ eliminatedIds }) => {
      eliminatedIds.forEach((id) => {
        dispatch({
          type: "UPDATE_OPPONENT",
          payload: { playerId: id, data: { eliminated: true } },
        });
        // Kendi elenme kontrolü
        if (id === socket.id) {
          dispatch({ type: "SET_ELIMINATED" });
          showToast("Elendin! İzlemeye devam edebilirsin...", "error", 4000);
        } else {
          const opponent = state.opponents[id];
          if (opponent) showToast(`${opponent.name} elendi!`, "warning");
        }
      });
    });

    // Oyuncu ayrıldı
    socket.on("player_left", ({ playerId, room }) => {
      dispatch({ type: "PLAYER_LEFT", payload: { playerId, room } });
    });

    // Oyun bitti
    socket.on("game_over", (result) => {
      dispatch({ type: "SET_GAME_RESULT", payload: result });
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, showToast, socket: socketRef }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
