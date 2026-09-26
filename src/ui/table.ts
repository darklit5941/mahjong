import { tileFace } from './tile-face';
import type { GameAction, PlayerView, Seat, TileInstance, ViewPlayer } from '../mahjong/game-types';
import { NORMAL_TILE_CODES, tileLabel } from '../mahjong/tiles';
const seats: Record<Seat,string> = {east:'東家',south:'南家',west:'西家',north:'北家'};
const names: Record<GameAction['kind'],string> = {discard:'出牌',chi:'吃',pong:'碰','exposed-kong':'明槓','concealed-kong':'暗槓','added-kong':'加槓',win:'胡牌',pass:'放棄'};
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const ordered = (tiles: TileInstance[]) => [...tiles].sort((a,b) => NORMAL_TILE_CODES.indexOf(a.code)-NORMAL_TILE_CODES.indexOf(b.code));
function face(tile: TileInstance): string {
 return tileFace(tile.code);
}
function tiles(items: TileInstance[]): string { return items.map(t=>`<span class="tile">${face(t)}</span>`).join(''); }
export function actionLabel(view: PlayerView, action: GameAction): string {
 if(action.kind==='pass'||action.kind==='win') return names[action.kind];
 const hand=view.players.find(p=>p.seat===view.seat)?.hand??[];
 const selected=hand.filter(t=>action.tileIds.includes(t.id));
 if(view.pendingTile && ['chi','pong','exposed-kong'].includes(action.kind) && !selected.some(t=>t.id===view.pendingTile!.id)) selected.push(view.pendingTile);
 return `${names[action.kind]} · ${ordered(selected).map(t=>tileLabel(t.code)).join(' ')}`;
}
function playerMarkup(view: PlayerView, player: ViewPlayer): string {
 const own=player.seat===view.seat; const active=view.phase!=='finished'&&view.activeSeat===player.seat;
 const drawn=own && view.phase==='await-discard' && view.activeSeat===view.seat ? player.hand.find(t=>t.id===view.drawnTileId) : undefined;
 const handTile=(tile: TileInstance)=>{
 const index=view.phase==='finished'?-1:view.legalActions.findIndex(a=>a.kind==='discard'&&a.tileIds.includes(tile.id));
 return index<0?`<span class="tile">${face(tile)}</span>`:`<button type="button" class="tile hand-tile" data-select="${index}" aria-label="選擇 ${escape(tileLabel(tile.code))}" aria-pressed="false">${face(tile)}</button>`;
 };
 const hand=own ? `<div class="tiles concealed-hand">${ordered(player.hand.filter(t=>t.id!==drawn?.id)).map(handTile).join('')}</div>${drawn?`<div class="drawn-tile" aria-label="本次摸牌">${handTile(drawn)}<span class="drawn-label">摸牌</span></div>`:''}`:Array.from({length:player.handCount},()=>'<span class="tile tile-back" aria-hidden="true"></span>').join('');
 const melds=player.melds.map(m=>`<div class="meld"><span class="meld-name">${names[m.kind]}</span><div class="tiles">${m.kind==='concealed-kong'&&!own?Array.from({length:m.count},()=>'<span class="tile tile-back" aria-hidden="true"></span>').join(''):tiles(m.tiles)}</div></div>`).join('');
 return `<article class="player-panel seat-${player.seat} ${own?'player-human':''} ${active?'is-active':''}" aria-label="${seats[player.seat]}"><header class="player-heading"><h2><span class="seat-badge">${seats[player.seat][0]}</span>${own?'你':seats[player.seat]} <small>${own?'莊家':'電腦'}</small></h2><span class="hand-count">${player.handCount} 張${active?' · 當前':''}</span></header><div class="tiles hand ${own?'human-hand':'hidden-hand'}" aria-label="${own?'你的手牌':`${player.handCount} 張暗手`}">${hand}</div>${melds?`<div class="melds" aria-label="副露">${melds}</div>`:''}<div class="flower-area"><span class="area-label">花牌</span>${player.flowers.length?`<div class="tiles">${tiles(player.flowers)}</div>`:`<span class="empty-state">${view.mode==='no-flowers'?'此模式不使用花牌':'尚無花牌'}</span>`}</div><div class="discard-area"><span class="area-label">棄牌 <b>${player.discards.length}</b></span><div class="tiles">${player.discards.length?tiles(player.discards):'<span class="empty-state">尚未出牌</span>'}</div></div></article>`;
}
export function tableMarkup(view: PlayerView): string {
 let status=view.activeSeat===view.seat?'輪到你出牌':'電腦思考中';
 if(view.phase==='await-responses'||view.phase==='await-kong-responses') status=view.legalActions.length?'選擇應對方式':'等待其他玩家應對';
 let result='';
 if(view.result){
 status='本局結束';
 const r=view.result;
 const title=r.kind==='draw'?'流局':`${seats[r.winner]}${r.winner===view.seat?'（你）':''} · ${r.method==='self-draw'?'自摸':r.method==='rob-kong'?'搶槓胡':'胡牌'}`;
 const detail=r.kind==='draw'?'牌牆已達最後 16 張保留牌。':`勝利牌：${tileLabel(r.winningTile.code)} · ${r.method==='self-draw'?'自己摸得':`來自${seats[r.sourceSeat]}`}`;
 result=`<section class="result-card" role="status"><p class="eyebrow">本局結果</p><h2>${title}</h2><p>${detail}</p><button type="button" data-restart>再玩一局</button></section>`;
 }
 const actions=view.phase==='finished'?'':view.legalActions.map((a,i)=>a.kind==='discard'?'':`<button type="button" class="action-button ${a.kind==='win'?'action-win':''} ${a.kind==='pass'?'action-pass':''}" data-action="${i}">${escape(actionLabel(view,a))}</button>`).join('');
 const discard=view.phase!=='finished'&&view.legalActions.some(a=>a.kind==='discard')?'<button type="button" class="discard-confirm" data-confirm disabled>請先選一張牌</button>':'';
 const pending=view.pendingTile?`<div class="pending-tile">${view.pendingSourceSeat?seats[view.pendingSourceSeat]:''}${view.phase==='await-kong-responses'?'加槓':'打出'} <span class="tile">${face(view.pendingTile)}</span></div>`:'';
 return `<div class="table-center"><span class="table-mark" aria-hidden="true">麻</span><p class="eyebrow">台灣十六張 · 單局練習</p><h2 role="status">${status}</h2>${pending}<p class="table-note">${view.phase==='finished'?'開啟新的一局，繼續練習。':discard?'點選手牌，再按出牌。':'吃碰槓胡以目前合法選項為準。'}</p><div class="action-controls">${actions}${discard}</div>${result}</div>${['west','north','south','east'].map(seat=>view.players.find(p=>p.seat===seat)).filter((p):p is ViewPlayer=>!!p).map(p=>playerMarkup(view,p)).join('')}`;
}
/** Owns #table only. All decisions are supplied by the engine's PlayerView. */
export function renderTable(view: PlayerView, onAction: (action: GameAction)=>void): void {
 const container=document.querySelector<HTMLElement>('#table');
 if(!container) throw new Error('頁面缺少 #table');
 container.innerHTML=tableMarkup(view);
 let selected:number|null=null; let submitted=false;
 const submit=(index:number)=>{
  if(submitted||!view.legalActions[index]) return;
  submitted=true;
  container.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{b.disabled=true;});
  onAction(view.legalActions[index]);
 };
 container.onclick=(event)=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('button');
  if(!button||button.disabled||!container.contains(button)) return;
  if(button.hasAttribute('data-restart')) {document.querySelector<HTMLFormElement>('#round-form')?.requestSubmit();return;}
  if(button.dataset.select!==undefined){
   selected=Number(button.dataset.select);
   container.querySelectorAll('[data-select]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   const confirm=container.querySelector<HTMLButtonElement>('[data-confirm]')!;
   confirm.disabled=false;confirm.textContent=actionLabel(view,view.legalActions[selected]);
  }else if(button.hasAttribute('data-confirm')&&selected!==null) submit(selected);
  else if(button.dataset.action!==undefined) submit(Number(button.dataset.action));
 };
}
