import { describe, expect, it } from 'vitest';
import { chooseBotAction } from '../../src/game/bot';
import { contractView } from '../fixtures/game-contract';

describe('B1–B2 bot policy', () => {
  it('chooses a legal action deterministically without changing its input', () => {
    const view = contractView();
    const before = structuredClone(view);
    const chosen = chooseBotAction(view, 123);
    expect(view.legalActions).toContainEqual(chosen);
    expect(chooseBotAction(view, 123)).toEqual(chosen);
    expect(view).toEqual(before);
    expect(chooseBotAction({...view, legalActions: [...view.legalActions].reverse()}, 123)).toEqual(chosen);
  });
  it('always takes a legal win', () => {
    const view = contractView();
    const win = {...view.legalActions[0], kind: 'win' as const};
    view.legalActions.push(win);
    for (let seed = 0; seed < 20; seed++) expect(chooseBotAction(view, seed)).toEqual(win);
  });
  it('preserves connected tiles over an isolated honor', () => {
    const view = contractView();
    view.players[0].hand = ['B1','B2','B3','WE'].map((code, i) => ({code, id: `t${i}`}));
    view.legalActions = view.players[0].hand.map(t => ({...view.legalActions[0], tileIds: [t.id]}));
    expect(chooseBotAction(view, 1)?.tileIds).toEqual(['t3']);
  });
  it('B2 depends only on visible projection and handles empty/finished views', () => {
    const view = contractView();
    const hiddenA = {view, wall: ['B1'], otherHand: ['B2']};
    const hiddenB = {view: structuredClone(view), wall: ['C1'], otherHand: ['C2']};
    expect(chooseBotAction(hiddenA.view, 9)).toEqual(chooseBotAction(hiddenB.view, 9));
    expect(chooseBotAction({...view, legalActions: []}, 1)).toBeNull();
    expect(chooseBotAction({...view, phase: 'finished'}, 1)).toBeNull();
  });
});
