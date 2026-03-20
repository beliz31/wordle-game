const { getRandomWord } = require("./wordList");

const GAME_MODES = { DUEL: "duel", GROUP: "group", BATTLE_ROYALE: "battle_royale" };
const ROOM_STATUS = { WAITING: "waiting", PLAYING: "playing", FINISHED: "finished" };
const MAX_ATTEMPTS = 6;
const rooms = new Map();

function createRoom({ hostId, hostName, mode }) {
  const roomCode = generateRoomCode();
  const room = {
    id: roomCode, mode, status: ROOM_STATUS.WAITING,
    secret: getRandomWord(), host: hostId,
    players: new Map(), createdAt: Date.now(),
    battleRoyaleRound: 1, eliminationQueue: [],
  };
  addPlayerToRoom(room, hostId, hostName);
  rooms.set(roomCode, room);
  return room;
}

function joinRoom({ roomCode, playerId, playerName }) {
  const room = rooms.get(roomCode);
  if (!room) return { error: "Oda bulunamadı." };
  if (room.status !== ROOM_STATUS.WAITING) return { error: "Oyun zaten başladı." };
  if (room.mode === GAME_MODES.DUEL && room.players.size >= 2) return { error: "Düello odası dolu." };
  addPlayerToRoom(room, playerId, playerName);
  return { room };
}

function startGame(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return { error: "Oda bulunamadı." };
  if (room.players.size < 2) return { error: "En az 2 oyuncu gerekiyor." };
  room.status = ROOM_STATUS.PLAYING;
  room.startedAt = Date.now();
  room.secret = getRandomWord();
  room.players.forEach((player) => resetPlayerState(player));
  return { room };
}

function processGuess({ roomCode, playerId, guess, evaluatedResult }) {
  const room = rooms.get(roomCode);
  if (!room || room.status !== ROOM_STATUS.PLAYING) return { error: "Geçersiz işlem." };
  const player = room.players.get(playerId);
  if (!player || player.eliminated || player.finished) return { error: "Oyuncu aktif değil." };
  player.guesses.push(evaluatedResult);
  player.currentRow = player.guesses.length;
  player.lastGuessAt = Date.now();
  const isWon = evaluatedResult.every((cell) => cell.status === "correct");
  const isLost = !isWon && player.guesses.length >= MAX_ATTEMPTS;
  if (isWon) { player.finished = true; player.won = true; player.finishedAt = Date.now(); }
  else if (isLost) { player.finished = true; player.won = false; player.finishedAt = Date.now(); }
  let eliminatedPlayers = [];
  if (room.mode === GAME_MODES.BATTLE_ROYALE) eliminatedPlayers = checkBattleRoyaleElimination(room);
  const gameOver = checkRoomGameOver(room);
  return { player, eliminatedPlayers, gameOver };
}

function checkBattleRoyaleElimination(room) {
  const activePlayers = getActivePlayers(room);
  if (activePlayers.length <= 1) return [];
  const currentRound = room.battleRoyaleRound;
  const completedThisRound = activePlayers.filter((p) => p.guesses.length >= currentRound);
  if (completedThisRound.length !== activePlayers.length) return [];
  const nonWinners = activePlayers.filter((p) => !p.won);
  if (nonWinners.length === 0) return [];
  const sorted = [...nonWinners].sort((a, b) => {
    const aCorrect = (a.guesses[currentRound - 1] || []).filter(c => c.status === "correct").length;
    const bCorrect = (b.guesses[currentRound - 1] || []).filter(c => c.status === "correct").length;
    if (aCorrect !== bCorrect) return aCorrect - bCorrect;
    return (a.lastGuessAt || 0) - (b.lastGuessAt || 0);
  });
  const toEliminate = sorted[0];
  toEliminate.eliminated = true;
  toEliminate.finished = true;
  toEliminate.eliminatedAt = Date.now();
  room.battleRoyaleRound++;
  return [toEliminate.id];
}

function checkRoomGameOver(room) {
  const activePlayers = getActivePlayers(room);
  if (room.mode === GAME_MODES.BATTLE_ROYALE) {
    if (activePlayers.length > 1) return null;
  } else {
    const allDone = [...room.players.values()].every((p) => p.finished);
    if (!allDone) return null;
  }
  room.status = ROOM_STATUS.FINISHED;
  room.finishedAt = Date.now();
  return buildLeaderboard(room);
}

function addPlayerToRoom(room, playerId, playerName) {
  room.players.set(playerId, createPlayer(playerId, playerName));
}

function createPlayer(id, name) {
  return { id, name, guesses: [], currentRow: 0, finished: false, won: false, eliminated: false, lastGuessAt: null, finishedAt: null };
}

function resetPlayerState(player) {
  player.guesses = []; player.currentRow = 0; player.finished = false;
  player.won = false; player.eliminated = false; player.lastGuessAt = null; player.finishedAt = null;
}

function getActivePlayers(room) {
  return [...room.players.values()].filter((p) => !p.eliminated && !p.finished);
}

function buildLeaderboard(room) {
  const players = [...room.players.values()];
  const ranked = players.map((p) => ({
    id: p.id, name: p.name, won: p.won, attempts: p.guesses.length,
    eliminated: p.eliminated, finishedAt: p.finishedAt,
  })).sort((a, b) => {
    if (a.won && !b.won) return -1;
    if (!a.won && b.won) return 1;
    if (a.won && b.won) return a.attempts - b.attempts || a.finishedAt - b.finishedAt;
    return (b.finishedAt || 0) - (a.finishedAt || 0);
  });
  return { secret: room.secret, leaderboard: ranked };
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return rooms.has(code) ? generateRoomCode() : code;
}

function getRoom(roomCode) { return rooms.get(roomCode); }

function removePlayerFromRoom(roomCode, playerId) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.players.delete(playerId);
  if (room.players.size === 0) rooms.delete(roomCode);
  return room;
}

function getRoomSnapshot(room) {
  const playersArray = [...room.players.values()].map((p) => ({
    id: p.id, name: p.name, currentRow: p.currentRow,
    finished: p.finished, won: p.won, eliminated: p.eliminated,
    publicGrid: p.guesses.map((g) => g.map((c) => ({ status: c.status }))),
  }));
  return { id: room.id, mode: room.mode, status: room.status, host: room.host, players: playersArray, battleRoyaleRound: room.battleRoyaleRound };
}

module.exports = { GAME_MODES, ROOM_STATUS, createRoom, joinRoom, startGame, processGuess, getRoom, removePlayerFromRoom, getRoomSnapshot };
