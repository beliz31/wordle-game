function evaluateGuess(guess, secret) {
  const result = Array(5).fill(null).map((_, i) => ({
    letter: guess[i],
    status: "absent",
  }));
  const secretArr = secret.split("");
  const guessArr = guess.split("");
  const usedInSecret = Array(5).fill(false);
  const usedInGuess = Array(5).fill(false);
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === secretArr[i]) {
      result[i].status = "correct";
      usedInSecret[i] = true;
      usedInGuess[i] = true;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (usedInGuess[i]) continue;
    for (let j = 0; j < 5; j++) {
      if (usedInSecret[j]) continue;
      if (guessArr[i] === secretArr[j]) {
        result[i].status = "present";
        usedInSecret[j] = true;
        break;
      }
    }
  }
  return result;
}

module.exports = { evaluateGuess };
