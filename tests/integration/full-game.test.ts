import { describe, expect, it, vi } from 'vitest';
import { createGame, applyAction, getLegalActions, getPlayerView } from '../../src/mahjong/game';
import { chooseBotAction } from '../../src/game/bot';
import { createGameController } from '../../src/game/controller';
import { SEATS, type GameState, type PlayerView } from '../../src/mahjong/game-types';

function assertConservation(state: GameState) {
 const tiles = [...state.wall, ...state.players.flatMap(p => [...p.hand, ...p.flowers, ...p.discards, ...p.melds.flatMap(m => m.tiles)])];
 if (state.result?.kind === 'win' && state.result.method !== 'self-draw') tiles.push(state.result.winningTile);
 expect(tiles).toHaveLength(state.mode === 'flowers' ? 144 : 136);
 expect(new Set(tiles.map(t => t.id)).size).toBe(tiles.length);
 const counts = new Map<string,number>();
 for (const tile of tiles) counts.set(tile.code,(counts.get(tile.code) ?? 0)+1);
 for (const [code,count] of counts) expect(count).toBe(code.startsWith('F') ? 1 : 4);
}

describe('完整單機牌局整合', () => {
 for (const mode of ['flowers','no-flowers'] as const) {
  for (const seed of [1,42,1234,20260915]) {
   it(`${mode} seed ${seed} 合法完整牌局可終局且每步守恆`, () => {
    let state=createGame({mode,seed,gameId:`full-${seed}`});
    let steps=0;
    while (state.phase !== 'finished' && steps < 1500) {
     assertConservation(state);
     const seat=SEATS.find(s=>getLegalActions(state,s).length>0);
     expect(seat).toBeDefined();
     const view=getPlayerView(state,seat!);
     const action=chooseBotAction(view,seed+steps);
     expect(action).not.toBeNull();
     const outcome=applyAction(state,action!);
     expect(outcome.ok,outcome.error).toBe(true);
     state=outcome.state; steps++;
    }
    expect(state.phase).toBe('finished');
    expect(state.result).not.toBeNull();
    assertConservation(state);
    for (const seat of SEATS) expect(getLegalActions(state,seat)).toEqual([]);
   });
  }
 }
 it('真人出牌後電腦自動推進，重開取消舊回合', () => {
  vi.useFakeTimers();
  const views:PlayerView[]=[];
  const errors:string[]=[];
  const controller=createGameController({engine:{createGame,applyAction,getLegalActions,getPlayerView},onChange:v=>views.push(v),onError:e=>errors.push(e),delayMs:10});
  try {
   controller.start({mode:'no-flowers',seed:1,gameId:'old'});
   const action=controller.getView()!.legalActions.find(a=>a.kind==='discard')!;
   expect(controller.dispatch(action)).toBe(true);
   vi.runAllTimers();
   expect(controller.getView()!.revision).toBeGreaterThan(0);
   expect(controller.getView()!.legalActions.length>0 || controller.getView()!.phase==='finished').toBe(true);
   controller.start({mode:'flowers',seed:42,gameId:'new'});
   vi.runAllTimers();
   expect(controller.getView()!.gameId).toBe('new');
   expect(controller.getView()!.revision).toBe(0);
   expect(controller.getView()!.activeSeat).toBe('east');
   expect(errors).toEqual([]);
  } finally { controller.dispose(); vi.useRealTimers(); }
 });
});
