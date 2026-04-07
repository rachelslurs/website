/** Deterministic pseudo-random offset for jittered layout (Dymo, cards). */
export function seededOffset(i: number, range: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return Number(((x - Math.floor(x) - 0.5) * 2 * range).toFixed(3));
}
