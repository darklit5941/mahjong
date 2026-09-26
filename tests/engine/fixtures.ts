import type { GameState, Seat, TileInstance, MeldKind } from '../../src/mahjong/game-types';
import { SEATS } from '../../src/mahjong/game-types';
import { buildWall } from '../../src/mahjong/rules';
/** Draws all configured tiles from one real deck; rejects impossible fifth copies. */
export function fixture(hands: Partial<Record<Seat,string>>, melds: {seat:Seat;kind:MeldKind;codes:string}[] = [], mode:'flowers'|'no-flowers'='no-flowers'):GameState {
 const pool=buildWall(1,mode).map((code,i)=>({code,id:'fixture:'+i}));
 const take=(codes:string):TileInstance[]=>codes?codes.split(' ').map(code=>{const i=pool.findIndex(t=>t.code===code);if(i<0)throw Error('Impossible fixture '+code);return pool.splice(i,1)[0]}):[];
 const players=SEATS.map(seat=>({seat,hand:take(hands[seat]??''),melds:[] as GameState['players'][number]['melds'],flowers:[] as TileInstance[],discards:[] as TileInstance[]}));
 for(const m of melds)players.find(p=>p.seat===m.seat)!.melds.push({kind:m.kind,tiles:take(m.codes)});
 for(const p of players)while(p.hand.length<(p.seat==='east'?17:16)-p.melds.length*3){const i=pool.findIndex(t=>!t.code.startsWith('F'));p.hand.push(pool.splice(i,1)[0]);}
 return {gameId:'fixture',revision:0,mode,seed:1,phase:'await-discard',activeSeat:'east',wall:pool,players,pendingWindow:null,result:null,lastDrawnTileId:players[0].hand.at(-1)!.id,turnOrigin:'draw'};
}
export function chiFixture(){return fixture({east:'C3',south:'C1 C2 C4 C5'});}
export function robKongFixture(){return fixture({east:'C3',south:'C1 C2 C4 C5 C6 D7 D8 D9 B1 B1 B1 WE WE WE DR DR'},[{seat:'east',kind:'pong',codes:'C3 C3 C3'}]);}
export function selfDrawFixture(){return fixture({east:'C1 C2 C3 C4 C5 C6 D7 D8 D9 B1 B1 B1 WE WE WE DR DR'});}
export function allTiles(s:GameState):TileInstance[]{return [...s.wall,...s.players.flatMap(p=>[...p.hand,...p.flowers,...p.discards,...p.melds.flatMap(m=>m.tiles)]),...(s.result?.kind==='win'&&s.result.method!=='self-draw'?[s.result.winningTile]:[])];}
