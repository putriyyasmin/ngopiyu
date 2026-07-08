export function parseHarga(str) {
  if (!str) return null;

  const hasRb = /rb/i.test(str);

  let s = str
    .replace(/Rp/gi, "")
    .replace(/\./g, "")
    .replace(/rb/gi, "")
    .replace(/\s/g, "")
    .replace("–", "-")
    .trim();

  const nums = s
    .split("-")
    .map((n) => parseInt(n, 10))
    .filter((n) => !isNaN(n));

  const normalized = nums.map((n) => (hasRb && n < 1000 ? n * 1000 : n));

  if (normalized.length === 0) return null;
  return normalized.reduce((a, b) => a + b, 0) / normalized.length;
}
