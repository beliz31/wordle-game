// utils/i18n.js — Türkçe / English dil desteği

export const translations = {
  tr: {
    // Genel
    appTitle: "WORDLE",
    appSubtitle: "Çok Oyunculu",
    loading: "Bağlanıyor...",
    error: "Hata",
    back: "Geri",
    copy: "Kopyala",
    copied: "Kopyalandı!",
    close: "Kapat",

    // Lobi
    lobbyTitle: "Oda Kur veya Katıl",
    yourName: "Adın",
    namePlaceholder: "Oyuncu adı gir...",
    createRoom: "Oda Oluştur",
    joinRoom: "Odaya Katıl",
    roomCode: "Oda Kodu",
    roomCodePlaceholder: "6 haneli kodu gir...",
    join: "Katıl",
    waiting: "Bekleniyor...",
    startGame: "Oyunu Başlat",
    copyCode: "Kodu Kopyala",
    inviteLink: "Davet Linki",
    players: "Oyuncular",
    waitingForPlayers: "Oyuncular bekleniyor...",
    waitingForHost: "Host oyunu başlatması bekleniyor...",
    youAreHost: "Sen host'sun",

    // Mod seçimi
    selectMode: "Oyun Modu Seç",
    modeDuel: "Düello",
    modeDuelDesc: "1v1 — Hızlı kapışma",
    modeGroup: "Grup Yarışı",
    modeGroupDesc: "Sınırsız oyuncu, aynı anda",
    modeBattleRoyale: "Battle Royale",
    modeBattleRoyaleDesc: "Eleme sistemi — son kalan kazanır",
    maxPlayers: "Maks. 2 oyuncu",
    unlimitedPlayers: "Sınırsız oyuncu",

    // Oyun
    guess: "Tahmin",
    attempts: "Deneme",
    row: "Satır",
    yourTurn: "Tahminin",
    opponentGrid: "Rakip Izgaraları",
    eliminated: "ELENDİN",
    eliminatedBy: "Bu turda elendi",
    won: "KAZANDIN! 🎉",
    lost: "Kaybettin",
    theWord: "Kelime",
    round: "Tur",
    remainingPlayers: "Kalan Oyuncu",

    // Klavye
    enter: "GİR",
    delete: "SİL",

    // Hatalar
    wordNotFound: "Kelime listede yok",
    tooShort: "Kelime 5 harf olmalı",
    notYourTurn: "Sıra sende değil",
    gameNotStarted: "Oyun henüz başlamadı",
    alreadyFinished: "Oyun bitti",
    disconnected: "Bağlantı kesildi",
    roomFull: "Oda dolu",
    roomNotFound: "Oda bulunamadı",
    nameRequired: "Önce adını gir",

    // Oyun sonu
    gameOver: "OYUN BİTTİ",
    leaderboard: "Sıralama",
    rank: "Sıra",
    player: "Oyuncu",
    result: "Sonuç",
    playAgain: "Tekrar Oyna",
    backToLobby: "Lobiye Dön",
    winner: "Kazanan",
    secretWord: "Gizli Kelime",

    // Toast
    toastCopied: "Oda kodu kopyalandı!",
    toastPlayerJoined: "odaya katıldı",
    toastPlayerLeft: "ayrıldı",
    toastGameStarted: "Oyun başladı!",
    toastEliminated: "elendi!",
    toastYouEliminated: "Elendin! Izle bakalım...",
  },

  en: {
    appTitle: "WORDLE",
    appSubtitle: "Multiplayer",
    loading: "Connecting...",
    error: "Error",
    back: "Back",
    copy: "Copy",
    copied: "Copied!",
    close: "Close",

    lobbyTitle: "Create or Join a Room",
    yourName: "Your Name",
    namePlaceholder: "Enter player name...",
    createRoom: "Create Room",
    joinRoom: "Join Room",
    roomCode: "Room Code",
    roomCodePlaceholder: "Enter 6-digit code...",
    join: "Join",
    waiting: "Waiting...",
    startGame: "Start Game",
    copyCode: "Copy Code",
    inviteLink: "Invite Link",
    players: "Players",
    waitingForPlayers: "Waiting for players...",
    waitingForHost: "Waiting for host to start...",
    youAreHost: "You are the host",

    selectMode: "Select Game Mode",
    modeDuel: "Duel",
    modeDuelDesc: "1v1 — Fast match",
    modeGroup: "Group Race",
    modeGroupDesc: "Unlimited players, all at once",
    modeBattleRoyale: "Battle Royale",
    modeBattleRoyaleDesc: "Elimination — last one standing wins",
    maxPlayers: "Max. 2 players",
    unlimitedPlayers: "Unlimited players",

    guess: "Guess",
    attempts: "Attempts",
    row: "Row",
    yourTurn: "Your guess",
    opponentGrid: "Opponent Grids",
    eliminated: "ELIMINATED",
    eliminatedBy: "Eliminated this round",
    won: "YOU WON! 🎉",
    lost: "You lost",
    theWord: "The word",
    round: "Round",
    remainingPlayers: "Remaining Players",

    enter: "ENTER",
    delete: "DEL",

    wordNotFound: "Word not in list",
    tooShort: "Word must be 5 letters",
    notYourTurn: "Not your turn",
    gameNotStarted: "Game hasn't started",
    alreadyFinished: "Game is over",
    disconnected: "Disconnected",
    roomFull: "Room is full",
    roomNotFound: "Room not found",
    nameRequired: "Enter your name first",

    gameOver: "GAME OVER",
    leaderboard: "Leaderboard",
    rank: "Rank",
    player: "Player",
    result: "Result",
    playAgain: "Play Again",
    backToLobby: "Back to Lobby",
    winner: "Winner",
    secretWord: "Secret Word",

    toastCopied: "Room code copied!",
    toastPlayerJoined: "joined the room",
    toastPlayerLeft: "left",
    toastGameStarted: "Game started!",
    toastEliminated: "was eliminated!",
    toastYouEliminated: "You've been eliminated! Watch on...",
  },
};

export function t(lang, key, vars = {}) {
  const str = translations[lang]?.[key] || translations["tr"][key] || key;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(`{{${k}}}`, v),
    str
  );
}
