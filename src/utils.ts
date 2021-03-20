const lowerAlpha = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];
const upperAlpha = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const numeric = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const allowedCharsSet = new Set([...lowerAlpha, ...upperAlpha, ...numeric]);

export function sanitizeDeviceName(s: string): string {
  const out: string[] = [];
  for (const c of s) {
    if (!allowedCharsSet.has(c)) {
      continue;
    }
    out.push(c);
  }

  return out.join("");
}
