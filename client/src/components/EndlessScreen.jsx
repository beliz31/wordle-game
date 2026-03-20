// components/EndlessScreen.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useGame } from "../context/GameContext";
import { TR_KEYBOARD_ROWS, mapKeyEvent } from "../utils/keyboard";
import { io } from "socket.io-client";
import clsx from "clsx";

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
  "terzi","torun","turan","tutar","tutum","tuzak","vergi","verim","vezir",
  "viral","yaban","yakin","yanar","yapay","yarar","yatay","yazar","yayla",
  "yedek","yenge","yetki","yogun","yorum","yunus","yurek","zaman","zamir",
  "zarif","zebra","zemin","zirve","zorba","sabun","sacma","durun","durum",
  "kanat","kemer","kiraz","konum","korku","kovan","kucuk","kurul","lamba",
  "marka","masaj","mazot","mermi","mesut","metal","mezun","turna","gurus",
  "topuz","tarla","tatli","tosun","tufan","tugla","tuhaf","kapur","keski"
].filter(w => w.length === 5);

const usedWords = new Set();
function getNewWord() {
  const available = WORDS.filter(w => !usedWords.has(w));
  if (!available.length) usedWords.clear();
  const pool = available.length ? available : WORDS;
  const word = pool[Math.floor(Math.random() * pool.length)];
  usedWords.add(word);
  return word;
}

function evaluateGuess(guess, secret) {
  const result = Array(5).fill(null).map((_, i) => ({ letter: guess[i], status: "absent" }));
  const sArr = secret.split(""), gArr = guess.split("");
  const usedS = Array(5).fill(false), usedG = Array(5).fill(false);
  for (let i = 0; i < 5; i++) {
    if (gArr[i] === sArr[i]) { result[i].status = "correct"; usedS[i] = true; usedG[i] = true; }
  }
  for (let i = 0; i < 5; i++) {
    if (usedG[i]) continue;
    for (let j = 0; j < 5; j++) {
      if (usedS[j]) continue;
      if (gArr[i] === sArr[j]) { result[i].status = "present"; usedS[j] = true; break; }
    }
  }
  return result;
}

const TILE = {
  correct: "bg-neon-green text-bg-primary border-neon-green",
  present: "bg-neon-yellow text-bg-primary border-neon-yellow",
  absent: "bg-neon-gray text-white/50 border-neon-gray",
  filled: "bg-tile-filled text-white border-white/30",
  empty: "bg-tile-empty text-white border-white/10",
};

function Board({ guesses, current, shake }) {
  const rows = [];
  for (let i = 0; i < 6; i++) {
    if (i < guesses.length) rows.push({ type: "revealed", data: guesses[i] });
    else if (i === guesses.length) rows.push({ type: "active" });
    else rows.push({ type: "empty" });
  }
  return (
    <div className={clsx("flex flex-col gap-1.5 w-full max-w-xs", shake && "animate-shake")}>
      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-5 gap-1.5">
          {Array(5).fill(null).map((_, ci) => {
            let letter = "", status = "empty";
            if (row.type === "revealed") { letter = row.data.letters[ci]; status = row.data.result[ci].status; }
            else if (row.type === "active") { letter = current[ci] || ""; status = current[ci] ? "filled" : "empty"; }
            return (
              <div key={ci} className={clsx("aspect-square flex items-center justify-center font-display text-2xl rounded-md border-2 transition-all", TILE[status])}>
                {letter?.toUpperCase()}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function KeyboardComp({ onKey }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full max-w-sm">
      {TR_KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1 justify-center">
          {row.map((key) => (
            <button key={key} onClick={() => onKey(key)}
              className={clsx("flex items-center justify-center rounded-md font-mono font-bold text-sm transition-all active:scale-90 select-none bg-bg-elevated text-white hover:bg-white/10",
                key === "ENTER" || key === "DELETE" ? "px-3 py-4 text-[10px] flex-shrink-0" : "w-8 h-12")}>
              {key === "DELETE" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              ) : key === "ENTER" ? "GİR" : key.toUpperCase()}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── TEK BAŞINA ───────────────────────────────────────────────────────────────
function SoloEndless({ onBack }) {
  const [secret, setSecret] = useState(() => getNewWord());
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "info") { setToast({ msg, type }); setTimeout(() => setToast(null), 2000); }

  function nextRound(won) {
    setFlash(won ? "win" : "lose");
    if (!won) showToast(`Kelime: ${secret.toUpperCase()}`, "error");
    setTimeout(() => {
      setFlash(null); setSecret(getNewWord()); setGuesses([]); setCurrent(""); setRound(r => r + 1);
      if (won) setScore(s => s + 1);
    }, 1400);
  }

  const handleKey = useCallback((key) => {
    if (flash) return;
    if (key === "DELETE") { setCurrent(c => c.slice(0, -1)); return; }
    if (key === "ENTER") {
      setCurrent(c => {
        if (c.length < 5) { showToast("5 harf gir", "error"); setShake(true); setTimeout(() => setShake(false), 600); return c; }
        const result = evaluateGuess(c, secret);
        const ng = [...guesses, { letters: c.split(""), result }];
        setGuesses(ng);
        const won = result.every(r => r.status === "correct");
        if (won || ng.length >= 6) setTimeout(() => nextRound(won), 400);
        return "";
      });
      return;
    }
    if (current.length < 5) setCurrent(c => c + key);
  }, [flash, current, guesses, secret]);

  useEffect(() => {
    function onKeyDown(e) { const key = mapKeyEvent(e); if (key) { e.preventDefault(); handleKey(key); } }
    window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(245,200,66,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,200,66,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className={clsx("px-5 py-3 rounded-xl font-mono text-sm font-bold shadow-2xl",
            toast.type === "error" ? "bg-red-500 text-white" : "bg-bg-elevated text-white border border-white/10")}>{toast.msg}</div>
        </div>
      )}
      {flash && (
        <div className={clsx("fixed inset-0 z-40 flex items-center justify-center pointer-events-none", flash === "win" ? "bg-neon-green/10" : "bg-red-500/10")}>
          <span className="font-display text-8xl animate-fade-in" style={{ textShadow: flash === "win" ? "0 0 40px #39d353" : "0 0 40px #ff4757" }}>{flash === "win" ? "✓" : "✗"}</span>
        </div>
      )}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-bg-secondary/80">
        <button onClick={onBack} className="font-mono text-xs text-gray-500 hover:text-white transition-colors">← Geri</button>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg tracking-widest text-white">SONSUZ</span>
          <span className="font-mono text-xs text-neon-yellow bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg">Tur {round}</span>
        </div>
        <div className="font-display text-xl text-neon-yellow">{score} <span className="text-xs font-mono text-gray-500">puan</span></div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-4">
        <Board guesses={guesses} current={current} shake={shake} />
        <KeyboardComp onKey={handleKey} />
      </div>
    </div>
  );
}

// ─── MULTIPLAYER — LOBİ ───────────────────────────────────────────────────────
function MultiLobby({ onBack, onStart }) {
  const { state } = useGame();
  const [tab, setTab] = useState("create");
  const [name, setName] = useState(state.playerName || "");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(245,200,66,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,200,66,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="font-display text-5xl tracking-widest text-white">SONSUZ</h1>
          <p className="font-mono text-neon-yellow text-xs tracking-widest mt-1">♾️ ÇOK OYUNCULU</p>
        </div>
        <div className="bg-bg-card border border-white/5 rounded-2xl p-5">
          <div className="mb-4">
            <label className="block font-mono text-xs uppercase tracking-widest text-gray-400 mb-2">Adın</label>
            <input type="text" maxLength={16} value={name} onChange={e => setName(e.target.value)} placeholder="Oyuncu adı..."
              className="w-full bg-bg-elevated border border-white/10 rounded-lg px-4 py-3 font-mono text-white placeholder-gray-600 focus:outline-none focus:border-neon-yellow/50 transition-all" />
          </div>
          <div className="flex rounded-lg bg-bg-elevated p-1 mb-4 gap-1">
            {[{ id: "create", label: "Oda Kur" }, { id: "join", label: "Katıl" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={clsx("flex-1 py-2 rounded-md font-mono text-sm font-bold transition-all",
                  tab === t.id ? "bg-neon-yellow text-bg-primary" : "text-gray-400 hover:text-white")}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === "create" ? (
            <button onClick={() => { if (name.trim()) { setLoading(true); onStart("create", name.trim(), null); } }}
              disabled={!name.trim() || loading}
              className="w-full py-3.5 rounded-xl font-display text-lg tracking-widest bg-neon-yellow text-bg-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-40">
              {loading ? "Oluşturuluyor..." : "Oda Oluştur →"}
            </button>
          ) : (
            <>
              <input type="text" maxLength={6} value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ODA KODU"
                className="w-full bg-bg-elevated border border-white/10 rounded-lg px-4 py-3 font-mono text-white placeholder-gray-600 text-2xl tracking-[0.5em] uppercase mb-3 focus:outline-none focus:border-neon-yellow/50 transition-all" />
              <button onClick={() => { if (name.trim() && joinCode.length >= 4) { setLoading(true); onStart("join", name.trim(), joinCode); } }}
                disabled={!name.trim() || joinCode.length < 4 || loading}
                className="w-full py-3.5 rounded-xl font-display text-lg tracking-widest bg-neon-yellow text-bg-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-40">
                {loading ? "Katılıyor..." : "Katıl →"}
              </button>
            </>
          )}
        </div>
        <button onClick={onBack} className="w-full mt-3 py-2 font-mono text-sm text-gray-500 hover:text-white transition-colors">← Geri</button>
      </div>
    </div>
  );
}

// ─── MULTIPLAYER — OYUN ───────────────────────────────────────────────────────
function MultiGame({ playerName, roomCode: initCode, mode, onBack }) {
  const socketRef = useRef(null);
  const myId = useRef(null);
  const [roomCode, setRoomCode] = useState(initCode || "");
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [phase, setPhase] = useState("waiting");
  const [secret, setSecret] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(null);
  const [scores, setScores] = useState({});
  const [round, setRound] = useState(1);
  const [toast, setToast] = useState(null);
  const [roundOver, setRoundOver] = useState(false);
  const playersRef = useRef([]);
  playersRef.current = players;

  function showToast(msg, type = "info") { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); }
  function copyCode() { navigator.clipboard.writeText(roomCode); showToast("Kod kopyalandı!", "success"); }

  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    const socket = io(window.location.origin, { path: "/socket.io", timeout: 8000 });
    socketRef.current = socket;

    socket.on("connect", () => {
      myId.current = socket.id;
      if (mode === "create") {
        socket.emit("endless_create", { playerName }, (res) => {
          if (res.error) { showToast(res.error, "error"); setConnecting(false); return; }
          setRoomCode(res.roomCode);
          setIsHost(true);
          setPlayers(res.players);
          setScores(Object.fromEntries(res.players.map(p => [p.id, 0])));
          setConnecting(false);
        });
      } else {
        socket.emit("endless_join", { playerName, roomCode: initCode }, (res) => {
          if (res.error) { showToast(res.error, "error"); onBack(); return; }
          setPlayers(res.players);
          setScores(Object.fromEntries(res.players.map(p => [p.id, 0])));
          setConnecting(false);
        });
      }
    });

    socket.on("connect_error", () => {
      showToast("Sunucuya bağlanılamadı!", "error");
      setConnecting(false);
    });

    socket.on("endless_room_updated", ({ players: p }) => {
      setPlayers(p);
      setScores(s => { const n = { ...s }; p.forEach(pl => { if (!(pl.id in n)) n[pl.id] = 0; }); return n; });
    });

    socket.on("endless_round_start", ({ secret: s, round: r }) => {
      setSecret(s); setRound(r); setGuesses([]); setCurrent("");
      setFlash(null); setRoundOver(false); setPhase("playing");
    });

    socket.on("endless_score_update", ({ playerId, scores: s }) => {
      setScores(s);
      const pl = playersRef.current.find(p => p.id === playerId);
      if (pl && playerId !== myId.current) showToast(`${pl.name} buldu! 🎉`, "success");
    });

    socket.on("endless_round_over", ({ secret: s, scores: sc }) => {
      setScores(sc); setRoundOver(true);
      showToast(`Kelime: ${s.toUpperCase()}`, "info");
    });

    socket.on("endless_player_left", ({ players: p }) => setPlayers(p));

    return () => socket.disconnect();
  }, []);

  const handleKey = useCallback((key) => {
    if (phase !== "playing" || flash || roundOver) return;
    if (key === "DELETE") { setCurrent(c => c.slice(0, -1)); return; }
    if (key === "ENTER") {
      setCurrent(c => {
        if (c.length < 5) { showToast("5 harf gir", "error"); setShake(true); setTimeout(() => setShake(false), 600); return c; }
        const result = evaluateGuess(c, secret);
        const ng = [...guesses, { letters: c.split(""), result }];
        setGuesses(ng);
        const won = result.every(r => r.status === "correct");
        if (won || ng.length >= 6) {
          setFlash(won ? "win" : "lose");
          socketRef.current?.emit("endless_guess_result", { won, attempts: ng.length });
        }
        return "";
      });
      return;
    }
    if (current.length < 5) setCurrent(c => c + key);
  }, [phase, flash, roundOver, current, guesses, secret]);

  useEffect(() => {
    function onKeyDown(e) { const key = mapKeyEvent(e); if (key) { e.preventDefault(); handleKey(key); } }
    window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const sortedPlayers = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(245,200,66,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,200,66,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className={clsx("px-5 py-3 rounded-xl font-mono text-sm font-bold shadow-2xl",
            toast.type === "success" ? "bg-neon-green text-bg-primary" :
            toast.type === "error" ? "bg-red-500 text-white" : "bg-bg-elevated text-white border border-white/10")}>{toast.msg}</div>
        </div>
      )}
      {flash && (
        <div className={clsx("fixed inset-0 z-40 flex items-center justify-center pointer-events-none", flash === "win" ? "bg-neon-green/10" : "bg-red-500/10")}>
          <span className="font-display text-8xl animate-fade-in" style={{ textShadow: flash === "win" ? "0 0 40px #39d353" : "0 0 40px #ff4757" }}>{flash === "win" ? "✓" : "✗"}</span>
        </div>
      )}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-bg-secondary/80">
        <button onClick={onBack} className="font-mono text-xs text-gray-500 hover:text-white transition-colors">← Çık</button>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg tracking-widest text-white">SONSUZ</span>
          {phase === "playing" && <span className="font-mono text-xs text-neon-yellow bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg">Tur {round}</span>}
        </div>
        <button onClick={copyCode} className="font-display text-base text-neon-yellow tracking-widest hover:brightness-125 transition-all">{roomCode} 📋</button>
      </header>

      {phase === "waiting" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          {connecting && (
            <div className="text-center animate-pulse">
              <p className="font-mono text-sm text-gray-400">Sunucuya bağlanıyor...</p>
            </div>
          )}
          {!connecting && <div className="w-full max-w-sm bg-bg-card border border-white/5 rounded-2xl p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-1 text-center">Oda Kodu — Arkadaşlarına at</p>
            <button onClick={copyCode} className="w-full text-center font-display text-5xl tracking-[0.3em] text-neon-yellow mb-4 hover:brightness-125 transition-all"
              style={{ textShadow: "0 0 20px rgba(245,200,66,0.5)" }}>{roomCode}</button>
            <p className="font-mono text-xs text-gray-500 text-center mb-4">2-10 kişi katılabilir</p>
            <div className="flex flex-col gap-2 mb-4">
              {players.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 bg-bg-elevated rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="font-mono text-sm text-white flex-1">{p.name}</span>
                  {p.id === myId.current && <span className="text-xs text-gray-500 font-mono">(sen)</span>}
                  {i === 0 && <span className="text-xs text-neon-yellow font-mono px-1.5 py-0.5 bg-yellow-500/10 rounded border border-yellow-500/20">HOST</span>}
                </div>
              ))}
            </div>
            {isHost ? (
              <button onClick={() => socketRef.current?.emit("endless_start_round", {})} disabled={players.length < 2}
                className="w-full py-3.5 rounded-xl font-display text-lg tracking-widest bg-neon-yellow text-bg-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-30">
                {players.length < 2 ? "Oyuncu bekleniyor..." : "Oyunu Başlat →"}
              </button>
            ) : (
              <p className="text-center font-mono text-sm text-gray-400 animate-pulse">Host başlatmasını bekle...</p>
            )}
          </div>}
        </div>
      )}

      {phase === "playing" && (
        <div className="flex-1 flex flex-col md:flex-row gap-2 px-4 py-3 overflow-auto">
          <div className="flex-1 flex flex-col items-center gap-3">
            <Board guesses={guesses} current={current} shake={shake} />
            {!roundOver && !flash && <KeyboardComp onKey={handleKey} />}
            {roundOver && (
              <div className="text-center animate-slide-up mt-2">
                {isHost ? (
                  <button onClick={() => socketRef.current?.emit("endless_start_round", {})}
                    className="px-8 py-3 rounded-xl font-display text-lg tracking-widest bg-neon-yellow text-bg-primary hover:brightness-110 active:scale-95 transition-all shadow-neon-yellow">
                    Sonraki Tur →
                  </button>
                ) : (
                  <p className="font-mono text-sm text-gray-400 animate-pulse">Host sonraki turu başlatacak...</p>
                )}
              </div>
            )}
          </div>
          <div className="md:w-44 flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 text-center">Skor</p>
            {sortedPlayers.map((p, i) => (
              <div key={p.id} className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                p.id === myId.current ? "bg-neon-yellow/5 border-yellow-500/30" : "bg-bg-elevated border-white/5")}>
                <span className="font-mono text-xs text-gray-500 w-4">{i + 1}.</span>
                <span className="font-mono text-xs text-white flex-1 truncate">{p.name}</span>
                <span className="font-display text-lg text-neon-yellow">{scores[p.id] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANA MENÜ ─────────────────────────────────────────────────────────────────
export default function EndlessScreen() {
  const { dispatch } = useGame();
  const [view, setView] = useState("menu");
  const [multiConfig, setMultiConfig] = useState(null);

  function onBack() {
    if (view === "menu") dispatch({ type: "SET_PHASE", payload: "lobby" });
    else setView("menu");
  }

  if (view === "solo") return <SoloEndless onBack={onBack} />;
  if (view === "multilobby") return <MultiLobby onBack={onBack} onStart={(mode, name, code) => { setMultiConfig({ mode, playerName: name, roomCode: code }); setView("multigame"); }} />;
  if (view === "multigame") return <MultiGame {...multiConfig} onBack={onBack} />;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(245,200,66,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,200,66,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-7xl tracking-widest text-white" style={{ textShadow: "0 0 30px rgba(245,200,66,0.4)" }}>SONSUZ</h1>
          <p className="font-mono text-neon-yellow text-sm tracking-[0.4em] mt-1 opacity-80">♾️ MOD</p>
          <p className="font-mono text-xs text-gray-500 mt-2">Doğru buldukça yeni kelime, durmaz!</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => setView("solo")}
            className="w-full py-4 rounded-xl font-display text-xl tracking-widest bg-neon-yellow text-bg-primary hover:brightness-110 active:scale-95 transition-all shadow-neon-yellow">
            🎮 Tek Başına
          </button>
          <button onClick={() => setView("multilobby")}
            className="w-full py-4 rounded-xl font-display text-xl tracking-widest border-2 border-neon-yellow text-neon-yellow hover:bg-neon-yellow/10 active:scale-95 transition-all">
            👥 Arkadaşlarla (2-10 Kişi)
          </button>
          <button onClick={onBack} className="w-full py-2 rounded-xl font-mono text-sm text-gray-500 hover:text-white transition-colors mt-1">← Geri</button>
        </div>
      </div>
    </div>
  );
}
