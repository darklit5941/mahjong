import { expect, it } from 'vitest';
import { contractView } from '../fixtures/game-contract';
import { tableMarkup, actionLabel } from '../../src/ui/table';
it('U1 never renders opponent private cards, even if present in input', () => {
 const view = contractView();
 view.players[1].hand = [{id:'secret-id',code:'F8'}];
 view.players[1].melds = [{kind:'concealed-kong',tiles:[{id:'secret-kong',code:'F8'}],count:4}];
 const html = tableMarkup(view);
 expect(html).not.toContain('secret'); expect(html).not.toContain('菊');
 expect(html).toContain('暗槓'); expect(html).toContain('此模式不使用花牌');
 expect(html.match(/data-select=/g)).toHaveLength(17);
});
it('U2 labels every chi with the three faces and exposes only legal choices', () => {
 const view = contractView();
 view.players[0].hand = [{id:'one',code:'C1'},{id:'two',code:'C2'},{id:'four',code:'C4'}];
 view.pendingTile = {id:'three',code:'C3'};
 view.phase = 'await-responses';
 view.legalActions = [{gameId:view.gameId,expectedRevision:0,seat:'east',kind:'chi',tileIds:['one','two']},{gameId:view.gameId,expectedRevision:0,seat:'east',kind:'chi',tileIds:['two','four']},{gameId:view.gameId,expectedRevision:0,seat:'east',kind:'pass',tileIds:[]}];
 expect(actionLabel(view,view.legalActions[0])).toBe('吃 · 一萬 二萬 三萬');
 const html = tableMarkup(view); expect(html).toContain('吃 · 二萬 三萬 四萬'); expect(html).toContain('放棄'); expect(html).not.toContain('data-select=');
});
it('U5 terminal view removes actions and offers restart with result source', () => {
 const view = contractView(); view.phase='finished'; view.result={kind:'win',winner:'south',sourceSeat:'east',winningTile:{id:'win',code:'C3'},method:'rob-kong'};
 const html=tableMarkup(view); expect(html).toContain('搶槓胡'); expect(html).toContain('東家'); expect(html).toContain('再玩一局'); expect(html).not.toContain('data-select='); expect(html).not.toContain('data-action=');
});
