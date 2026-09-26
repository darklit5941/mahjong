import { expect,it } from 'vitest';
import { createGame, getLegalActions, applyAction, getPlayerView } from '../../src/mahjong/game';
import { dealInitialHands } from '../../src/mahjong/rules';
import { sortTiles } from '../../src/mahjong/tiles';
for(const mode of ['flowers','no-flowers'] as const) it('R1 '+mode+' preserves initial hands',()=>{const s=createGame({seed:1,mode,gameId:'a'}),old=dealInitialHands(1,mode);expect(s.players.map(p=>sortTiles(p.hand.map(t=>t.code)))).toEqual(old.players.map(p=>p.tiles));expect(s.wall.length).toBe(old.wallRemaining);expect(s.players.map(p=>p.hand.length)).toEqual([17,16,16,16]);});
it('R2 R11 discard, pass, draw and reject stale/out of turn',()=>{let s=createGame({seed:1,mode:'no-flowers',gameId:'a'});const a=getLegalActions(s,'east').find(a=>a.kind==='discard')!;const original=structuredClone(s);s=applyAction(s,a).state;expect(original.players[0].hand).toHaveLength(17);expect(applyAction(s,a).ok).toBe(false);while(s.pendingWindow){const seat=s.pendingWindow.eligibleSeats.find(seat=>!s.pendingWindow!.responses[seat])!;s=applyAction(s,getLegalActions(s,seat).find(a=>a.kind==='pass')!).state;}expect(s.activeSeat).toBe('south');expect(s.players[1].hand).toHaveLength(17);expect(getLegalActions(s,'east')).toEqual([])});
it('view hides other hands and wall',()=>{const s=createGame({seed:1,mode:'flowers',gameId:'a'});const v=getPlayerView(s,'east');expect(v.players.slice(1).every(p=>!p.hand.length)).toBe(true);expect(v).not.toHaveProperty('wall');v.players[0].hand.pop();expect(s.players[0].hand).toHaveLength(17)});

it('R1 initial winning tile is actual last east draw before sorting',()=>{const s=createGame({seed:1,mode:'no-flowers',gameId:'a'});expect(s.lastDrawnTileId).toBe('a:16');});
it('accepts finite positive integer seeds as existing input does',()=>{expect(()=>createGame({seed:1e20,mode:'flowers',gameId:'a'})).not.toThrow();});
