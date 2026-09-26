import { expect, it } from 'vitest';
import { contractState, contractView } from './fixtures/game-contract';
it('shared fixture conserves 136 unique tiles and redacts opponents', () => {
 const state = contractState();
 const tiles = [...state.wall, ...state.players.flatMap(p => p.hand)];
 expect(tiles).toHaveLength(136);
 expect(new Set(tiles.map(t => t.id)).size).toBe(136);
 expect(state.wall).toHaveLength(71);
 expect(contractView().players.slice(1).every(p => p.hand.length === 0 && p.handCount === 16)).toBe(true);
});
