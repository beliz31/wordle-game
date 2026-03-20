// components/SinglePlayerScreen.jsx
import { useState, useEffect, useCallback } from "react";
import { useGame } from "../context/GameContext";
import { useGameActions } from "../hooks/useGameActions";
import { TR_KEYBOARD_ROWS, mapKeyEvent } from "../utils/keyboard";
import clsx from "clsx";

// 5 harfli Türkçe kelime listesi (offline)
const WORDS = [
  "araba","aslan","balik","bahce","beyin","bilgi","bulut","cadde","ceket",
  "cicek","deniz","demir","duman","duvar","elmas","ekmek","fener","forma",
  "gelin","gunes","guzel","hakim","hamur","hayat","insan","kalem","karga",
  "kadin","kahve","kapak","kasap","kayak","kazma","kebap","kenar","kilic",
  "kitap","kofte","konak","kopek","koyun","kumar","liman","limon","masal",
  "marul","merak","meyve","mezar","miras","misir","model","moral","motor",
  "nabiz","nefes","nehir","nimet","nisan","odun","okuma","onlar","onur",
  "orman","ortak","oynak","ozlem","palet","panel","papaz","pasta","pazar",
  "perde","pilot","polis","radar","rapor","rende","resim","roman","rozet",
  "sabah","safir","sahne","sakal","salon","saman","sanat","saray","saygi",
  "sefer","sehir","selam","senet","serin","sevgi","sicak","silah","siyah",
  "sorun","sucuk","sulak","surat","tahta","takim","talip","tango","taraf",
  "tarih","tarim","tavuk","tavan","tekel","tekne","temiz","temel","tepsi",
  "terzi","toprak","torun","turan","tutar","tutum","tuzak","vergi","verim",
  "vezir","viral","yaban","yakin","yanar","yapay","yarar","yatay","yazar",
  "yayla","yedek","yenge","yetki","yogun","yorum","yunus","yurek","zaman",
  "zamir","zarif","zebra","zemin","zirve","zorba","sabun","sacma","sade",
  "tembel","tepki","tosun","tufan","tugla","tuhaf","uzman","vagon","vakit",
  "zengin","zeytin","zihin","canli","daire","damga","davul","deger","dergi"
].filter(w => w.length === 5);

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function evaluateGuess(guess, secret) {
  const result = Array(5).fill(null).map((_, i) => ({ letter: guess[i], status: "absent" }));
  const secretArr = secret.split("");
  const guessArr = guess.split("");
  const usedSecret = Array(5).fill(false);
  const usedGuess = Array(5).fill(false);
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === secretArr[i]) {
      result[i].status = "correct";
      usedSecret[i] = true;
      usedGuess[i] = true;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (usedGuess[i]) continue;
    for (let j = 0; j < 5; j++) {
      if (usedSecret[j]) continue;
      if (guessArr[i] === secretArr[j]) {
        result[i].status = "present";
        usedSecret[j] = true;
        break;
      }
    }
  }
  return result;
}

const STATUS_STYLES = {
  correct: "bg-neon-green text-bg-primary border-neon-green shadow-neon-green",
  present: "bg-neon-yellow text-bg-primary border-neon-yellow shadow-neon-yellow",
  absent: "bg-neon-gray text-white/50 border-neon-gray",
  filled: "bg-tile-filled text-white border-white/30",
  empty: "bg-tile-empty text-white border-white/10",
};

const KEY_STATUS_STYLES = {
  correct: "bg-neon-green text-bg-primary",
  present: "bg-neon-yellow text-bg-primary",
  absent: "bg-neon-gray text-white/40",
  default: "bg-bg-elevated text-white hover:bg-white/10",
};

export default function SinglePlayerScreen() {
  const { dispatch } = useGame();
  const [secret, setSecret] = useState(() => getRandomWord());
  const [guesses, setGuesses] = useState([]); // [{letters, result}]
  const [current, setCurrent] = useState("");
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState(null);
  const [gameOver, setGameOver] = useState(null); // null | "won" | "lost"
  const [keyStatuses, setKeyStatuses] = useState({});
  const [revealRow, setRevealRow] = useState(-1);

  function showToast(msg, type = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  function doShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  function resetGame() {
    setSecret(getRandomWord());
    setGuesses([]);
    setCurrent("");
    setGameOver(null);
    setKeyStatuses({});
    setRevealRow(-1);
    setToast(null);
  }

  function backToLobby() {
    dispatch({ type: "SET_PHASE", payload: "lobby" });
  }

  const handleKey = useCallback((key) => {
    if (gameOver) return;
    if (key === "DELETE") {
      setCurrent(c => c.slice(0, -1));
      return;
    }
    if (key === "ENTER") {
      setCurrent(c => {
        if (c.length < 5) {
          showToast("Kelime 5 harf olmalı", "error");
          doShake();
          return c;
        }
        const result = evaluateGuess(c, secret);
        const newGuess = { letters: c.split(""), result };
        const newGuesses = [...guesses, newGuess];
        setGuesses(newGuesses);
        setRevealRow(newGuesses.length - 1);

        // Update key statuses
        const newKeys = { ...keyStatuses };
        const priority = { correct: 3, present: 2, absent: 1 };
        result.forEach(cell => {
          const existing = newKeys[cell.letter];
          if (!existing || priority[cell.status] > priority[existing]) {
            newKeys[cell.letter] = cell.status;
          }
        });
        setKeyStatuses(newKeys);

        const won = result.every(r => r.status === "correct");
        if (won) {
          setTimeout(() => setGameOver("won"), 600);
          setTimeout(() => showToast("🎉 Tebrikler!", "success"), 700);
        } else if (newGuesses.length >= 6) {
          setTimeout(() => setGameOver("lost"), 600);
          setTimeout(() => showToast(`Kelime: ${secret.toUpperCase()}`, "error"), 700);
        }
        return "";
      });
      return;
    }
    if (current.length < 5) {
      setCurrent(c => c + key);
    }
  }, [gameOver, current, guesses, secret, keyStatuses]);

  // Physical keyboard
  useEffect(() => {
    function onKeyDown(e) {
      const key = mapKeyEvent(e);
      if (key) { e.preventDefault(); handleKey(key); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  // Build 6 rows
  const rows = [];
  for (let i = 0; i < 6; i++) {
    if (i < guesses.length) {
      rows.push({ type: "revealed", data: guesses[i] });
    } else if (i === guesses.length && !gameOver) {
      rows.push({ type: "active" });
    } else {
      rows.push({ type: "empty" });
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      {/* BG grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(57,211,83,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57,211,83,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className={clsx("px-5 py-3 rounded-xl font-mono text-sm font-bold shadow-2xl",
            toast.type === "success" && "bg-neon-green text-bg-primary",
            toast.type === "error" && "bg-red-500 text-white",
            toast.type === "info" && "bg-bg-elevated text-white border border-white/10"
          )}>{toast.msg}</div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-bg-secondary/80 backdrop-blur-sm">
        <button onClick={backToLobby} className="font-mono text-xs text-gray-500 hover:text-white transition-colors">
          ← Geri
        </button>
        <span className="font-display text-xl tracking-widest text-white">WORDLE</span>
        <span className="font-mono text-xs text-gray-500 bg-bg-elevated px-2 py-1 rounded-lg">
          🎮 Tek Kişilik
        </span>
      </header>

      {/* Board */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-6">
        <div className={clsx("flex flex-col gap-1.5 w-full max-w-xs", shake && "animate-shake")}>
          {rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-5 gap-1.5">
              {Array(5).fill(null).map((_, ci) => {
                let letter = "";
                let status = "empty";
                if (row.type === "revealed") {
                  letter = row.data.letters[ci];
                  status = row.data.result[ci].status;
                } else if (row.type === "active") {
                  letter = current[ci] || "";
                  status = current[ci] ? "filled" : "empty";
                }
                return (
                  <div key={ci}
                    className={clsx(
                      "aspect-square flex items-center justify-center font-display text-2xl rounded-md border-2 transition-all duration-150",
                      STATUS_STYLES[status]
                    )}
                    style={row.type === "revealed" && revealRow === ri ? {
                      animation: `flipIn 0.25s ease-in ${ci * 100}ms forwards, flipOut 0.25s ease-in ${ci * 100 + 250}ms reverse forwards`
                    } : {}}>
                    {letter?.toUpperCase()}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Game over overlay */}
        {gameOver && (
          <div className="animate-slide-up text-center">
            {gameOver === "won" ? (
              <p className="font-display text-4xl text-neon-green" style={{ textShadow: "0 0 20px rgba(57,211,83,0.6)" }}>
                KAZANDIN! 🎉
              </p>
            ) : (
              <div>
                <p className="font-display text-3xl text-red-400">KAYBETTIN</p>
                <p className="font-mono text-sm text-gray-400 mt-1">
                  Kelime: <span className="text-neon-yellow tracking-widest font-bold">{secret.toUpperCase()}</span>
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-4 justify-center">
              <button onClick={resetGame}
                className="px-6 py-2.5 rounded-xl font-display tracking-widest bg-neon-green text-bg-primary hover:brightness-110 active:scale-95 transition-all shadow-neon-green">
                TEKRAR
              </button>
              <button onClick={backToLobby}
                className="px-6 py-2.5 rounded-xl font-mono text-sm text-gray-400 border border-white/10 hover:text-white transition-colors">
                Menü
              </button>
            </div>
          </div>
        )}

        {/* Keyboard */}
        {!gameOver && (
          <div className="flex flex-col items-center gap-1.5 w-full max-w-sm">
            {TR_KEYBOARD_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1 justify-center">
                {row.map((key) => (
                  <button key={key} onClick={() => handleKey(key)}
                    className={clsx(
                      "flex items-center justify-center rounded-md font-mono font-bold text-sm transition-all duration-150 active:scale-90 select-none",
                      key === "ENTER" || key === "DELETE" ? "px-3 py-4 text-[10px] flex-shrink-0" : "w-8 h-12",
                      KEY_STATUS_STYLES["default"]
                    )}>
                    {key === "DELETE" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                      </svg>
                    ) : key === "ENTER" ? "GİR" : key.toUpperCase()}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
