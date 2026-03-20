// hooks/useGameActions.js
import { useCallback } from "react";
import { useGame } from "../context/GameContext";
import { t } from "../utils/i18n";

export function useGameActions() {
  const { state, dispatch, showToast, socket } = useGame();
  const { lang } = state;

  const createRoom = useCallback(
    (playerName, mode) => {
      return new Promise((resolve, reject) => {
        if (!playerName.trim()) {
          showToast(t(lang, "nameRequired"), "error");
          return reject("no name");
        }
        socket.current.emit("create_room", { playerName: playerName.trim(), mode }, (res) => {
          if (res.error) {
            showToast(res.error, "error");
            reject(res.error);
          } else {
            dispatch({ type: "SET_ROOM", payload: res.room });
            dispatch({ type: "SET_PHASE", payload: "waiting" });
            resolve(res);
          }
        });
      });
    },
    [socket, dispatch, showToast, lang]
  );

  const joinRoom = useCallback(
    (roomCode, playerName) => {
      return new Promise((resolve, reject) => {
        if (!playerName.trim()) {
          showToast(t(lang, "nameRequired"), "error");
          return reject("no name");
        }
        socket.current.emit(
          "join_room",
          { roomCode: roomCode.toUpperCase(), playerName: playerName.trim() },
          (res) => {
            if (res.error) {
              showToast(res.error, "error");
              reject(res.error);
            } else {
              dispatch({ type: "SET_ROOM", payload: res.room });
              dispatch({ type: "SET_PHASE", payload: "waiting" });
              resolve(res);
            }
          }
        );
      });
    },
    [socket, dispatch, showToast, lang]
  );

  const startGame = useCallback(() => {
    socket.current.emit("start_game", (res) => {
      if (res?.error) showToast(res.error, "error");
    });
  }, [socket, showToast]);

  const submitGuess = useCallback(() => {
    const guess = state.currentGuess;
    if (guess.length < 5) {
      showToast(t(lang, "tooShort"), "error");
      dispatch({ type: "SHAKE" });
      setTimeout(() => dispatch({ type: "STOP_SHAKE" }), 600);
      return;
    }

    socket.current.emit("submit_guess", { guess }, (res) => {
      if (res.error) {
        showToast(res.error, "error");
        dispatch({ type: "SHAKE" });
        setTimeout(() => dispatch({ type: "STOP_SHAKE" }), 600);
        return;
      }

      dispatch({
        type: "SUBMIT_GUESS_SUCCESS",
        payload: { guess, result: res.result },
      });

      if (res.won) {
        showToast(t(lang, "won"), "success", 4000);
        dispatch({ type: "SET_PHASE", payload: "finished_won" });
      } else if (res.finished && !res.won) {
        dispatch({ type: "SET_PHASE", payload: "finished_lost" });
      }
    });
  }, [state.currentGuess, socket, dispatch, showToast, lang]);

  const typeLetter = useCallback(
    (letter) => {
      if (
        state.phase !== "playing" ||
        state.currentGuess.length >= 5
      )
        return;
      dispatch({ type: "TYPE_LETTER", payload: letter });
    },
    [state.phase, state.currentGuess, dispatch]
  );

  const deleteLetter = useCallback(() => {
    dispatch({ type: "DELETE_LETTER" });
  }, [dispatch]);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET" });
    dispatch({ type: "SET_PHASE", payload: "lobby" });
  }, [dispatch]);

  const setLang = useCallback(
    (l) => dispatch({ type: "SET_LANG", payload: l }),
    [dispatch]
  );

  return {
    createRoom,
    joinRoom,
    startGame,
    submitGuess,
    typeLetter,
    deleteLetter,
    resetGame,
    setLang,
  };
}
