import type { RuleMode, Seat } from './rules';
import type { TileCode } from './tiles';
export type { RuleMode, Seat, TileCode };
export const SEATS: readonly Seat[] = ['east', 'south', 'west', 'north'];
export interface TileInstance { id: string; code: TileCode }
export type MeldKind = 'chi' | 'pong' | 'exposed-kong' | 'concealed-kong' | 'added-kong';
export interface Meld { kind: MeldKind; tiles: TileInstance[]; sourceSeat?: Seat }
export interface GamePlayer { seat: Seat; hand: TileInstance[]; melds: Meld[]; flowers: TileInstance[]; discards: TileInstance[] }
export type ActionKind = 'discard' | MeldKind | 'win' | 'pass';
export interface GameAction { gameId: string; expectedRevision: number; windowId?: string; seat: Seat; kind: ActionKind; tileIds: string[] }
export interface ResponseWindow { id: string; sourceSeat: Seat; tile: TileInstance; eligibleSeats: Seat[]; responses: Partial<Record<Seat, GameAction>> }
export type GameResult = { kind: 'win'; winner: Seat; sourceSeat: Seat; winningTile: TileInstance; method: 'self-draw' | 'discard' | 'rob-kong' } | { kind: 'draw'; reason: 'reserve-exhausted' };
export type GamePhase = 'await-discard' | 'await-responses' | 'await-kong-responses' | 'finished';
export interface GameState { gameId: string; revision: number; mode: RuleMode; seed: number; phase: GamePhase; activeSeat: Seat; wall: TileInstance[]; players: GamePlayer[]; pendingWindow: ResponseWindow | null; result: GameResult | null; lastDrawnTileId: string | null; turnOrigin: 'initial' | 'draw' | 'claim'; }
export interface ViewMeld { kind: MeldKind; tiles: TileInstance[]; count: number; sourceSeat?: Seat }
export interface ViewPlayer { seat: Seat; hand: TileInstance[]; handCount: number; melds: ViewMeld[]; flowers: TileInstance[]; discards: TileInstance[] }
export interface PlayerView { gameId: string; revision: number; mode: RuleMode; seed: number; seat: Seat; phase: GamePhase; activeSeat: Seat; wallRemaining: number; players: ViewPlayer[]; legalActions: GameAction[]; pendingTile: TileInstance | null; pendingSourceSeat: Seat | null; result: GameResult | null; }
export interface GameEvent { type: string; seat?: Seat; message: string }
export interface ActionOutcome { ok: boolean; state: GameState; events: GameEvent[]; error?: string }
export interface GameOptions { seed: number; mode: RuleMode; gameId: string }
export interface EngineAdapter { createGame(options: GameOptions): GameState; getLegalActions(state: GameState, seat: Seat): GameAction[]; applyAction(state: GameState, action: GameAction): ActionOutcome; getPlayerView(state: GameState, seat: Seat): PlayerView }
