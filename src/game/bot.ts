import type { GameAction, PlayerView } from '../mahjong/game-types';
import { createSeededRandom } from '../mahjong/random';

/** Uses only this seat's projection. Decision RNG never advances the wall RNG. */
export function chooseBotAction(view: PlayerView, decisionSeed: number): GameAction | null {
  if (view.phase === 'finished' || !view.legalActions.length) return null;
  const hand = view.players.find(p => p.seat === view.seat)?.hand ?? [];
  const score = (action: GameAction): number => {
    if (action.kind === 'win') return 1000;
    if (action.kind.includes('kong')) return 100;
    if (action.kind === 'pong') return 80;
    if (action.kind === 'chi') return 60;
    if (action.kind === 'pass') return 0;
    const tile = hand.find(t => t.id === action.tileIds[0]);
    if (!tile) return -100;
    let connected = 0;
    for (const other of hand) {
      if (other.id === tile.id) continue;
      if (other.code === tile.code) connected += 5;
      else if (/^[BCD][1-9]$/.test(tile.code) && other.code[0] === tile.code[0]) {
        const distance = Math.abs(Number(tile.code[1]) - Number(other.code[1]));
        if (distance <= 2) connected += 3 - distance;
      }
    }
    return -connected;
  };
  const ranked = view.legalActions.map(action => ({action, score:score(action), key:JSON.stringify([action.kind, action.tileIds])}));
  ranked.sort((a,b) => b.score-a.score || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const best = ranked.filter(candidate => candidate.score === ranked[0].score);
  return best[Math.floor(createSeededRandom(decisionSeed)() * best.length)].action;
}
