const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { evaluateGuess } = require("./gameManager");
const { isValidWord } = require("./wordList");
const {
  GAME_MODES,
  createRoom,
  joinRoom,
  startGame,
  processGuess,
  getRoom,
  removePlayerFromRoom,
  getRoomSnapshot,
} = require("./roomManager");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "OK" }));

const playerRoomMap = new Map();

io.on("connection", (socket) => {
  console.log(`🟢 Bağlandı: ${socket.id}`);

  socket.on("create_room", ({ playerName, mode }, callback) => {
    if (!playerName || !Object.values(GAME_MODES).includes(mode)) {
      return callback({ error: "Geçersiz istek." });
    }
    const room = createRoom({ hostId: socket.id, hostName: playerName, mode });
    socket.join(room.id);
    playerRoomMap.set(socket.id, room.id);
    console.log(`🏠 Oda: ${room.id} | Mod: ${mode} | Host: ${playerName}`);
    callback({ success: true, roomCode: room.id, room: getRoomSnapshot(room) });
  });

  socket.on("join_room", ({ roomCode, playerName }, callback) => {
    const result = joinRoom({ roomCode: roomCode.toUpperCase(), playerId: socket.id, playerName });
    if (result.error) return callback({ error: result.error });
    socket.join(roomCode.toUpperCase());
    playerRoomMap.set(socket.id, roomCode.toUpperCase());
    const snapshot = getRoomSnapshot(result.room);
    io.to(roomCode.toUpperCase()).emit("room_updated", snapshot);
    console.log(`🚪 ${playerName} → ${roomCode}`);
    callback({ success: true, room: snapshot });
  });

  socket.on("start_game", (callback) => {
    const roomCode = playerRoomMap.get(socket.id);
    if (!roomCode) return callback?.({ error: "Oda bulunamadı." });
    const room = getRoom(roomCode);
    if (!room) return callback?.({ error: "Oda bulunamadı." });
    if (room.host !== socket.id) return callback?.({ error: "Sadece host başlatabilir." });
    const result = startGame(roomCode);
    if (result.error) return callback?.({ error: result.error });
    io.to(roomCode).emit("game_started", { room: getRoomSnapshot(result.room) });
    console.log(`🎮 Başladı: ${roomCode} | Kelime: ${result.room.secret}`);
    callback?.({ success: true });
  });

  socket.on("submit_guess", ({ guess }, callback) => {
    const roomCode = playerRoomMap.get(socket.id);
    if (!roomCode) return callback({ error: "Oda bulunamadı." });
    const room = getRoom(roomCode);
    if (!room) return callback({ error: "Oda bulunamadı." });
    const normalizedGuess = guess.toLowerCase().trim();
    if (normalizedGuess.length !== 5) return callback({ error: "Kelime 5 harf olmalı." });
    if (!isValidWord(normalizedGuess)) return callback({ error: "Kelime listede yok." });
    const evaluatedResult = evaluateGuess(normalizedGuess, room.secret);
    const { player, eliminatedPlayers, gameOver } = processGuess({
      roomCode, playerId: socket.id, guess: normalizedGuess, evaluatedResult,
    });
    if (!player) return callback({ error: "Oyuncu durumu hatalı." });
    callback({ success: true, result: evaluatedResult, finished: player.finished, won: player.won });
    io.to(roomCode).emit("player_guessed", {
      playerId: socket.id,
      playerName: player.name,
      currentRow: player.currentRow,
      publicGrid: player.guesses.map((g) => g.map((c) => ({ status: c.status }))),
      finished: player.finished,
      won: player.won,
      eliminated: player.eliminated,
    });
    if (eliminatedPlayers.length > 0) {
      io.to(roomCode).emit("players_eliminated", { eliminatedIds: eliminatedPlayers });
    }
    if (gameOver) {
      io.to(roomCode).emit("game_over", gameOver);
      console.log(`🏆 Bitti: ${roomCode}`);
    }
  });

  socket.on("leave_room", () => handleDisconnect(socket));
  socket.on("disconnect", () => {
    console.log(`🔴 Ayrıldı: ${socket.id}`);
    handleDisconnect(socket);
  });


  // ── SONSUZ MOD: ODA OLUŞTUR ───────────────────────────────────────────────
  socket.on("endless_create", ({ playerName }, callback) => {
    const roomCode = generateEndlessCode();
    const room = {
      id: roomCode,
      host: socket.id,
      players: [{ id: socket.id, name: playerName }],
      scores: { [socket.id]: 0 },
      round: 0,
      secret: "",
      roundResults: {},
    };
    endlessRooms.set(roomCode, room);
    socket.join("endless_" + roomCode);
    playerRoomMap.set(socket.id, "endless_" + roomCode);
    console.log("♾️ Sonsuz oda: " + roomCode);
    callback({ success: true, roomCode, players: room.players });
  });

  socket.on("endless_join", ({ playerName, roomCode }, callback) => {
    const room = endlessRooms.get(roomCode);
    if (!room) return callback({ error: "Oda bulunamadı." });
    if (room.players.length >= 10) return callback({ error: "Oda dolu (maks. 10 kişi)." });
    room.players.push({ id: socket.id, name: playerName });
    room.scores[socket.id] = 0;
    socket.join("endless_" + roomCode);
    playerRoomMap.set(socket.id, "endless_" + roomCode);
    io.to("endless_" + roomCode).emit("endless_room_updated", { players: room.players });
    callback({ success: true, players: room.players });
  });

  socket.on("endless_start_round", (_, callback) => {
    const key = playerRoomMap.get(socket.id);
    if (!key) return;
    const roomCode = key.replace("endless_", "");
    const room = endlessRooms.get(roomCode);
    if (!room || room.host !== socket.id) return;
    room.round++;
    room.secret = getEndlessWord();
    room.roundResults = {};
    io.to("endless_" + roomCode).emit("endless_round_start", { secret: room.secret, round: room.round });
    console.log("♾️ Tur " + room.round + " başladı: " + room.secret);
  });

  socket.on("endless_guess_result", ({ won, attempts }) => {
    const key = playerRoomMap.get(socket.id);
    if (!key) return;
    const roomCode = key.replace("endless_", "");
    const room = endlessRooms.get(roomCode);
    if (!room) return;
    room.roundResults[socket.id] = { won, attempts };
    if (won) {
      room.scores[socket.id] = (room.scores[socket.id] || 0) + 1;
      io.to("endless_" + roomCode).emit("endless_score_update", { playerId: socket.id, scores: room.scores });
    }
    // Herkes tamamladı mı?
    if (Object.keys(room.roundResults).length >= room.players.length) {
      io.to("endless_" + roomCode).emit("endless_round_over", { secret: room.secret, scores: room.scores });
    }
  });

  socket.on("get_room", (callback) => {
    const roomCode = playerRoomMap.get(socket.id);
    if (!roomCode) return callback?.({ error: "Oda bulunamadı." });
    const room = getRoom(roomCode);
    if (!room) return callback?.({ error: "Oda bulunamadı." });
    callback?.({ room: getRoomSnapshot(room) });
  });
});

function handleDisconnect(socket) {
  const roomCode = playerRoomMap.get(socket.id);
  if (!roomCode) return;
  const updatedRoom = removePlayerFromRoom(roomCode, socket.id);
  playerRoomMap.delete(socket.id);
  if (updatedRoom && updatedRoom.players.size > 0) {
    io.to(roomCode).emit("player_left", { playerId: socket.id, room: getRoomSnapshot(updatedRoom) });
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │  🟩 Wordle Multiplayer Server           │
  │  Port     : ${PORT}                        │
  │  Socket.io: Aktif                       │
  └─────────────────────────────────────────┘
  `);
});
