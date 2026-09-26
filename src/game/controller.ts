import { SEATS, type EngineAdapter, type GameAction, type GameOptions, type GameState, type PlayerView } from '../mahjong/game-types';
import { chooseBotAction } from './bot';

export interface ControllerOptions {
  engine: EngineAdapter;
  onChange(view: PlayerView): void;
  onError?(message: string): void;
  delayMs?: number;
  scheduler?: { set(callback: () => void, delayMs: number): unknown; clear(handle: unknown): void };
}

/** Sole state owner. start replaces the round; dispatch accepts only human actions.
 * dispose cancels pending work permanently. getView never exposes engine state.
 */
export function createGameController(options: ControllerOptions) {
  const {engine, onChange, onError} = options;
  const scheduler = options.scheduler ?? {
    set: (callback: () => void, delay: number) => setTimeout(callback, delay),
    clear: (handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  };
  let state: GameState | null = null;
  let timer: unknown = null;
  let generation = 0;
  let disposed = false;
  const getView = (): PlayerView | null => state ? engine.getPlayerView(state, 'east') : null;
  const cancel = () => {
    generation++;
    if (timer !== null) scheduler.clear(timer);
    timer = null;
  };
  const publish = () => { const view = getView(); if (view) onChange(view); };
  const schedule = () => {
    if (disposed || !state || state.phase === 'finished' || timer !== null) return;
    if (engine.getLegalActions(state, 'east').length) return;
    const seat = SEATS.find(s => s !== 'east' && engine.getLegalActions(state!, s).length);
    if (!seat) return;
    const scheduledState = state;
    const token = generation;
    timer = scheduler.set(() => {
      if (disposed || token !== generation || state !== scheduledState) return;
      timer = null;
      const action = chooseBotAction(engine.getPlayerView(state, seat), state.seed ^ Math.imul(state.revision + 1, 2654435761) ^ SEATS.indexOf(seat));
      if (!action) return;
      const outcome = engine.applyAction(state, action);
      if (!outcome.ok) { onError?.(outcome.error ?? '電腦動作遭拒絕'); return; }
      state = outcome.state;
      publish();
      schedule();
    }, options.delayMs ?? 350);
  };
  return {
    start(gameOptions: GameOptions): PlayerView {
      if (disposed) throw new Error('Controller has been disposed');
      const next = engine.createGame(gameOptions);
      cancel();
      state = next;
      publish();
      schedule();
      return getView()!;
    },
    dispatch(action: GameAction): boolean {
      if (disposed || !state || state.phase === 'finished') return false;
      const legal = engine.getLegalActions(state, 'east');
      const match = legal.find(a => a.gameId === action.gameId && a.expectedRevision === action.expectedRevision && a.windowId === action.windowId && a.seat === action.seat && a.kind === action.kind && a.tileIds.length === action.tileIds.length && a.tileIds.every((id,i) => id === action.tileIds[i]));
      if (!match) { onError?.('動作已過期或不合法'); return false; }
      const outcome = engine.applyAction(state, match);
      if (!outcome.ok) { onError?.(outcome.error ?? '動作遭拒絕'); return false; }
      cancel();
      state = outcome.state;
      publish();
      schedule();
      return true;
    },
    dispose(): void { cancel(); disposed = true; },
    getView,
  };
}
