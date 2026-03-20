// utils/keyboard.js — Türkçe klavye düzeni ve harf normalleştirme

export const TR_KEYBOARD_ROWS = [
  ["e", "r", "t", "y", "u", "ı", "o", "p", "ğ", "ü"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ş", "i"],
  ["ENTER", "z", "x", "c", "v", "b", "n", "m", "ö", "ç", "DELETE"],
];

export const EN_KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["ENTER", "z", "x", "c", "v", "b", "n", "m", "DELETE"],
];

// Türkçe karakter → İngilizce (ASCII) normalleştirme
export const TR_TO_ASCII = {
  ğ: "g",
  ü: "u",
  ş: "s",
  ı: "i",
  ö: "o",
  ç: "c",
  Ğ: "G",
  Ü: "U",
  Ş: "S",
  İ: "I",
  Ö: "O",
  Ç: "C",
};

// Geçerli Türkçe harfler
export const VALID_LETTERS = new Set([
  "a","b","c","ç","d","e","f","g","ğ","h",
  "ı","i","j","k","l","m","n","o","ö","p",
  "r","s","ş","t","u","ü","v","y","z",
]);

export function isValidLetter(key) {
  return VALID_LETTERS.has(key.toLowerCase());
}

// Fiziksel klavye tuş olayını Türkçe harfe çevir
export function mapKeyEvent(e) {
  if (e.key === "Enter") return "ENTER";
  if (e.key === "Backspace" || e.key === "Delete") return "DELETE";
  const k = e.key.toLowerCase();
  if (isValidLetter(k)) return k;
  return null;
}
