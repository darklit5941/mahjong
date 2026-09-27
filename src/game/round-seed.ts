const MAX_SEED = 0xffffffff;

/** Keep seeds distinct for this page's lifetime without changing the seeded shuffle. */
export function createRoundSeedGenerator(
  randomUint32: () => number = () => crypto.getRandomValues(new Uint32Array(1))[0],
): () => number {
  const used = new Set<number>();
  return () => {
    if (used.size === MAX_SEED) throw new Error('牌局 Seed 已用盡，請重新載入頁面。');
    let seed = (randomUint32() >>> 0) || 1;
    while (used.has(seed)) seed = seed === MAX_SEED ? 1 : seed + 1;
    used.add(seed);
    return seed;
  };
}
