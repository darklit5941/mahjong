import { expect, it } from 'vitest';
import { createGame, getPlayerView, getLegalActions, applyAction } from '../../src/mahjong/game';
import { tableMarkup } from '../../src/ui/table';
for (const discardDrawn of [false, true]) it(`U7 separates exact drawn tile then merges retained cards: discard drawn=${discardDrawn}`, () => {
 const state=createGame({seed:1,mode:'no-flowers',gameId:'draw-ui'});
 const view=getPlayerView(state,'east');
 const drawn=state.players[0].hand.find(t=>t.id===state.lastDrawnTileId)!;
 const html=tableMarkup(view);
 expect(html).toContain('class="drawn-tile"');
 const section=html.split('class="drawn-tile"')[1].split('</div>')[0];
 const drawAction=view.legalActions.findIndex(a=>a.kind==='discard'&&a.tileIds[0]===drawn.id);
 expect(section).toContain(`data-select="${drawAction}"`);
 expect(html.match(/data-select=/g)).toHaveLength(17);
 const action=getLegalActions(state,'east').find(a=>a.kind==='discard'&&(a.tileIds[0]===drawn.id)===discardDrawn)!;
 const next=applyAction(state,action).state;
 expect(next.players[0].hand.some(t=>t.id===drawn.id)).toBe(!discardDrawn);
 expect(tableMarkup(getPlayerView(next,'east'))).not.toContain('class="drawn-tile"');
});
