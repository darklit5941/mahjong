import { expect, it } from 'vitest';
import { createGame, getPlayerView, getLegalActions, applyAction } from '../../src/mahjong/game';
import { fixture } from './fixtures';
it('U8 projects drawn identity only to its owner during a draw discard turn',()=>{
 const s=createGame({seed:1,mode:'no-flowers',gameId:'draw'});
 expect(getPlayerView(s,'east')).toHaveProperty('drawnTileId',s.lastDrawnTileId);
 expect(getPlayerView(s,'south')).toHaveProperty('drawnTileId',null);
 for(const phase of ['await-responses','await-kong-responses','finished'] as const) expect(getPlayerView({...s,phase},'east')).toHaveProperty('drawnTileId',null);
 expect(getPlayerView({...s,turnOrigin:'claim'},'east')).toHaveProperty('drawnTileId',null);
});
it('U7 kong replacement exposes the replacement, including a flower chain',()=>{
 const s=fixture({east:'C3 C3 C3 C3'},[],'flowers');
 const take=(code:string)=>s.wall.splice(s.wall.findIndex(t=>t.code===code),1)[0];
 const flower=take('F1'), replacement=take('D5'); s.wall.push(replacement,flower);
 const action=getLegalActions(s,'east').find(a=>a.kind==='concealed-kong')!;
 const next=applyAction(s,action).state;
 expect(next.players[0].flowers).toContainEqual(flower);
 expect(getPlayerView(next,'east')).toHaveProperty('drawnTileId',replacement.id);
});
