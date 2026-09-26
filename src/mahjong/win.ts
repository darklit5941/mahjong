import type {
  Meld, TileInstance
} from './game-types';
import {
  NORMAL_TILE_CODES
} from './tiles';
/** Standard Taiwanese hand: five groups and one pair, counting each kong once. */
export function isWinningHand(hand: readonly TileInstance[], melds: readonly Meld[]): boolean {
  if (melds.length > 5 || hand.length !== (5 - melds.length) * 3 + 2) return false;
  const all = [...hand, ...melds.flatMap(m => m.tiles)];
  if (new Set(all.map(t => t.id)).size !== all.length) return false;
  const totals = new Map<string, number>();
  for (const t of all) {
    if (!NORMAL_TILE_CODES.includes(t.code)) return false;
    totals.set(t.code, (totals.get(t.code) ?? 0) + 1);
    if (totals.get(t.code)! > 4) return false;
  }
  for (const m of melds) {
    const codes = m.tiles.map(t => t.code).sort();
    if (m.kind === 'chi') {
      if (codes.length !== 3 || !/^[BCD][1-7]$/.test(codes[0]) || codes[1] !== codes[0][0] + (Number(codes[0][1]) + 1) || codes[2] !== codes[0][0] + (Number(codes[0][1]) + 2)) return false;
    } else if (codes.length !== (m.kind === 'pong' ? 3 : 4) || codes.some(c => c !== codes[0])) return false;
  }
  const counts = NORMAL_TILE_CODES.map(c => hand.filter(t => t.code === c).length);
  function groups(): boolean {
    const i = counts.findIndex(n => n > 0);
    if (i < 0) return true;
    if (counts[i] >= 3) {
      counts[i] -= 3;
      const ok = groups();
      counts[i] += 3;
      if (ok) return true;
    }
    if (i < 27 && i % 9 <= 6 && counts[i + 1] && counts[i + 2]) {
      counts[i]--;
      counts[i + 1]--;
      counts[i + 2]--;
      const ok = groups();
      counts[i]++;
      counts[i + 1]++;
      counts[i + 2]++;
      if (ok) return true;
    }
    return false;
  }
  for (let i = 0;
  i < counts.length;
  i++) {
    if (counts[i] < 2) continue;
    counts[i] -= 2;
    const ok = groups();
    counts[i] += 2;
    if (ok) return true;
  }
  return false;
}
