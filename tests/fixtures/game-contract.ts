import { buildWall } from '../../src/mahjong/rules';
import { SEATS, type GameState, type PlayerView } from '../../src/mahjong/game-types';
export function contractState(): GameState {
  const wall = buildWall(1, 'no-flowers').map((code, i) => ({ id: `tile-${i}`, code }));
  return { gameId: 'fixture', revision: 0, mode: 'no-flowers', seed: 1, phase: 'await-discard', activeSeat: 'east', players: SEATS.map(seat => ({ seat, hand: wall.splice(0, seat === 'east' ? 17 : 16), melds: [], flowers: [], discards: [] })), wall, pendingWindow: null, result: null, lastDrawnTileId: null, turnOrigin: 'initial' };
}
export function contractView(): PlayerView {
  const state = contractState();
  return { gameId: state.gameId, revision: 0, mode: state.mode, seed: 1, seat: 'east', phase: state.phase, activeSeat: 'east', drawnTileId:null,wallRemaining: state.wall.length, players: state.players.map(p => ({ ...p, melds: [], hand: p.seat === 'east' ? p.hand : [], handCount: p.hand.length })), legalActions: state.players[0].hand.map(tile => ({ gameId: state.gameId, expectedRevision: 0, seat: 'east', kind: 'discard', tileIds: [tile.id] })), pendingTile: null, pendingSourceSeat: null, result: null };
}
