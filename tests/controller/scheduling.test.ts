import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGameController } from '../../src/game/controller';
import { contractState } from '../fixtures/game-contract';
import { SEATS, type EngineAdapter, type GameState, type Seat, type GameAction } from '../../src/mahjong/game-types';

function adapter(waitHuman = false) {
  const legal = (s: GameState, seat: Seat): GameAction[] => {
    if (s.phase === 'finished') return [];
    if (s.phase === 'await-responses') return seat === 'east' || seat === 'west' ? [{gameId:s.gameId, expectedRevision:s.revision, seat, kind:'pass', tileIds:[], windowId:'window'}] : [];
    return seat === s.activeSeat ? [{gameId:s.gameId, expectedRevision:s.revision, seat, kind:'discard',tileIds:[s.players.find(p => p.seat === seat)!.hand[0].id]}] : [];
  };
  const engine: EngineAdapter = {
    createGame: options => ({...contractState(), ...options}),
    getLegalActions: legal,
    getPlayerView: (s, seat) => ({gameId:s.gameId, revision:s.revision, seed:s.seed, mode:s.mode, seat, phase:s.phase, activeSeat:s.activeSeat, drawnTileId:null,wallRemaining:s.wall.length, players:s.players.map(p=>({...p, hand:p.seat===seat?p.hand:[], handCount:p.hand.length, melds:[]})), legalActions:legal(s,seat),pendingTile:null,pendingSourceSeat:null,result:s.result}),
    applyAction: vi.fn((s, a) => {
      if (a.gameId !== s.gameId || a.expectedRevision !== s.revision) return {ok:false, state:s, events:[], error:'stale'};
      let next = {...s, revision:s.revision+1};
      if (s.phase === 'await-responses') next = {...next, phase:'await-discard',activeSeat:'west'};
      else if (s.activeSeat === 'north') next = {...next, phase:'finished',result:{kind:'draw',reason:'reserve-exhausted'}};
      else if (waitHuman && s.activeSeat === 'south') next = {...next,phase:'await-responses'};
      else next = {...next,activeSeat:SEATS[SEATS.indexOf(s.activeSeat)+1]};
      return {ok:true,state:next,events:[]};
    })
  };
  return engine;
}
const options = {gameId:'first', seed:1, mode:'no-flowers' as const};
describe('B3–B4 controller lifecycle', () => {
  beforeEach(()=>vi.useFakeTimers());
  afterEach(()=>vi.useRealTimers());
  it('runs bots once each, publishes only east views and cancels at finish', () => {
    const engine=adapter(); const onChange=vi.fn();
    const controller=createGameController({engine,onChange,delayMs:10});
    expect(controller.getView()).toBeNull();
    controller.start(options);
    expect(vi.getTimerCount()).toBe(0);
    expect(controller.dispatch(controller.getView()!.legalActions[0])).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    vi.runAllTimers();
    expect(engine.applyAction).toHaveBeenCalledTimes(4);
    expect(controller.getView()!.phase).toBe('finished');
    expect(vi.getTimerCount()).toBe(0);
    expect(onChange.mock.calls.every(([v])=>v.seat==='east' && v.players.slice(1).every((p: {hand:unknown[]})=>p.hand.length===0))).toBe(true);
  });
  it('B3 waits indefinitely for east response even when another bot can respond', () => {
    const engine=adapter(true); const c=createGameController({engine,onChange:()=>{},delayMs:10});
    c.start(options); c.dispatch(c.getView()!.legalActions[0]); vi.runAllTimers();
    expect(c.getView()!.phase).toBe('await-responses');
    expect(engine.applyAction).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(10000);
    expect(c.getView()!.phase).toBe('await-responses');
    c.dispatch(c.getView()!.legalActions[0]); vi.runAllTimers();
    expect(c.getView()!.phase).toBe('finished');
  });
  it('B4 restart and dispose cancel pending callbacks and duplicate dispatch is rejected', () => {
    const engine=adapter(); const error=vi.fn(); const c=createGameController({engine,onChange:()=>{},onError:error,delayMs:10});
    c.start(options); const old=c.getView()!.legalActions[0]; c.dispatch(old);
    expect(c.dispatch(old)).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
    c.start({...options,gameId:'second'}); vi.runAllTimers();
    expect(engine.applyAction).toHaveBeenCalledTimes(1);
    expect(c.getView()!.gameId).toBe('second');
    c.dispatch(c.getView()!.legalActions[0]); c.dispose(); vi.runAllTimers();
    expect(engine.applyAction).toHaveBeenCalledTimes(2);
    expect(c.dispatch(old)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('B4 ignores an already queued callback even if scheduler cancellation cannot retract it', () => {
    const callbacks: Array<() => void> = [];
    const engine = adapter();
    const c = createGameController({engine, onChange:()=>{}, scheduler:{set: callback => {callbacks.push(callback); return callbacks.length;}, clear:()=>{}}});
    c.start(options); c.dispatch(c.getView()!.legalActions[0]);
    c.start(options); // Same external game id still belongs to a new generation.
    callbacks[0]();
    expect(engine.applyAction).toHaveBeenCalledTimes(1);
    expect(c.getView()!.revision).toBe(0);
    c.dispatch(c.getView()!.legalActions[0]); c.dispose(); callbacks[1]();
    expect(engine.applyAction).toHaveBeenCalledTimes(2);
  });
  it('rejects human attempts to operate bot seats', () => {
    const engine=adapter(); const c=createGameController({engine,onChange:()=>{}});
    c.start(options); c.dispatch(c.getView()!.legalActions[0]);
    const fake={...c.getView()!.legalActions[0], gameId:'first',expectedRevision:1,seat:'south' as const,kind:'discard' as const,tileIds:[]};
    expect(c.dispatch(fake)).toBe(false);
    expect(engine.applyAction).toHaveBeenCalledTimes(1);
    c.dispose();
  });
});
