import { expect, it } from 'vitest';
import { isWinningHand } from '../../src/mahjong/win';
import type { TileInstance, Meld } from '../../src/mahjong/game-types';
const tiles = (s:string):TileInstance[] => s.split(' ').map((code,i)=>({code,id:String(i)}));
it('W1 closed win and broken pair',()=>{const h=tiles('C1 C2 C3 C4 C5 C6 D7 D8 D9 B1 B1 B1 WE WE WE DR DR');expect(isWinningHand(h,[])).toBe(true);h[16].code='DG';expect(isWinningHand(h,[])).toBe(false)});
it('W2 kong counts once',()=>{const h=tiles('C1 C2 C3 C4 C5 C6 D7 D8 D9 B1 B1 B1 DR DR');const m:Meld[]=[{kind:'concealed-kong',tiles:tiles('WE WE WE WE').map(t=>({...t,id:'m'+t.id}))}];expect(isWinningHand(h,m)).toBe(true)});
it('W3 honors, insufficient and fifth copy rejected',()=>{expect(isWinningHand(tiles('C1 C2 C3 C4 C5 C6 D7 D8 D9 B1 B1 B1 WE WS WW DR DR'),[])).toBe(false);expect(isWinningHand(tiles('DR DR'),[])).toBe(false);expect(isWinningHand(tiles('B1 B1 B1 B1 B1 C1 C2 C3 C4 C5 C6 D1 D2 D3 WE WE WE'),[])).toBe(false)});
it('backtracks ambiguous triplet/sequence decompositions',()=>{expect(isWinningHand(tiles('C1 C1 C1 C2 C2 C2 C3 C3 C3 C4 C5 C6 B1 B2 B3 DR DR'),[])).toBe(true)});
