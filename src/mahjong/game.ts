import {
  buildWall
} from './rules';
import {
  isFlower, NORMAL_TILE_CODES
} from './tiles';
import {
  SEATS, type GameState, type GameOptions, type GameAction, type Seat, type TileInstance, type ActionOutcome, type ActionKind, type PlayerView
} from './game-types';
import {
  isWinningHand
} from './win';
const next = (seat: Seat): Seat => SEATS[(SEATS.indexOf(seat) + 1) % 4];
const player = (s: GameState, seat: Seat) => s.players.find(p => p.seat === seat)!;
function sort(s: GameState, seat: Seat) {
  player(s, seat).hand.sort((a,b) => NORMAL_TILE_CODES.indexOf(a.code) - NORMAL_TILE_CODES.indexOf(b.code));
}
function draw(s: GameState, seat: Seat, tail: boolean): void {
  while (true) {
    if (s.wall.length <= 16) {
      s.phase = 'finished';
      s.result = {
        kind: 'draw', reason: 'reserve-exhausted'
      };
      s.pendingWindow = null;
      return;
    }
    const tile = (tail ? s.wall.pop() : s.wall.shift())!;
    if (isFlower(tile.code)) {
      player(s, seat).flowers.push(tile);
      tail = true;
      continue;
    }
    player(s, seat).hand.push(tile);
    sort(s, seat);
    s.lastDrawnTileId = tile.id;
    return;
  }
}
export function createGame(options: GameOptions): GameState {
  if (!Number.isInteger(options.seed) || options.seed <= 0 || !['flowers','no-flowers'].includes(options.mode)) throw new Error('Invalid game options');
  const s: GameState = {
    ...options, revision: 0, phase: 'await-discard', activeSeat: 'east', wall: buildWall(options.seed,options.mode).map((code,i)=>({
      code,id:`${options.gameId}:${i}`
    })), players: SEATS.map(seat=>({
      seat,hand:[],melds:[],flowers:[],discards:[]
    })), pendingWindow:null,result:null,lastDrawnTileId:null,turnOrigin:'initial'
  };
  let eastFinalTileId: string | null = null;
  for (const seat of SEATS) {
    while (player(s, seat).hand.length < (seat === 'east' ? 17 : 16)) draw(s, seat, false);
    if (seat === 'east') eastFinalTileId = s.lastDrawnTileId;
  }
  s.lastDrawnTileId = eastFinalTileId;
  return s;
}
function action(s: GameState, seat: Seat, kind: ActionKind, tiles: TileInstance[] = []): GameAction {
  return {
    gameId:s.gameId, expectedRevision:s.revision, ...(s.pendingWindow ? {
      windowId:s.pendingWindow.id
    }:{
    }), seat,kind,tileIds:tiles.map(t=>t.id)
  };
}
function responseActions(s: GameState, seat: Seat): GameAction[] {
  const w=s.pendingWindow!;
  if(seat===w.sourceSeat) return [];
  const p=player(s,seat), result:GameAction[]=[];
  if(isWinningHand([...p.hand,w.tile],p.melds)) result.push(action(s,seat,'win'));
  if(s.phase==='await-kong-responses') return result;
  const same=p.hand.filter(t=>t.code===w.tile.code);
  if(same.length>=2) result.push(action(s,seat,'pong',same.slice(0,2)));
  if(same.length===3) result.push(action(s,seat,'exposed-kong',same));
  if(seat===next(w.sourceSeat) && /^[BCD][1-9]$/.test(w.tile.code)) {
    const n=Number(w.tile.code[1]);
    for(let start=n-2;
    start<=n;
    start++) {
      if(start<1 || start>7) continue;
      const needed=[start,start+1,start+2].filter(v=>v!==n).map(v=>p.hand.find(t=>t.code===w.tile.code[0]+v));
      if(needed.every(t=>t)) result.push(action(s,seat,'chi',needed as TileInstance[]));
    }
  }
  return result;
}
export function getLegalActions(s: GameState, seat: Seat): GameAction[] {
  if(s.phase==='finished') return [];
  if(s.pendingWindow) {
    if(!s.pendingWindow.eligibleSeats.includes(seat) || s.pendingWindow.responses[seat]) return [];
    return [...responseActions(s,seat),action(s,seat,'pass')];
  }
  if(seat!==s.activeSeat) return [];
  const p=player(s,seat), result=p.hand.map(t=>action(s,seat,'discard',[t]));
  if(s.turnOrigin!=='claim' && isWinningHand(p.hand,p.melds)) result.push(action(s,seat,'win'));
  if(s.turnOrigin!=='claim') {
    for(const code of new Set(p.hand.map(t=>t.code))) {
      const same=p.hand.filter(t=>t.code===code);
      if(same.length===4) result.push(action(s,seat,'concealed-kong',same));
      if(p.melds.some(m=>m.kind==='pong' && m.tiles[0].code===code)) result.push(action(s,seat,'added-kong',[same[0]]));
    }
  }
  return result;
}
function advance(s: GameState, seat: Seat) {
  s.pendingWindow=null;
  s.activeSeat=seat;
  s.phase='await-discard';
  s.turnOrigin='draw';
  s.lastDrawnTileId=null;
  draw(s,seat,false);
}
function openWindow(s: GameState, sourceSeat: Seat, tile: TileInstance, kong: boolean) {
  s.phase=kong?'await-kong-responses':'await-responses';
  s.pendingWindow={
    id:`${s.gameId}:window:${s.revision}`,sourceSeat,tile,eligibleSeats:[],responses:{
    }
  };
  s.pendingWindow.eligibleSeats=SEATS.filter(seat=>responseActions(s,seat).length>0);
  if(!s.pendingWindow.eligibleSeats.length) resolve(s);
}
function resolve(s: GameState) {
  const w=s.pendingWindow!, kong=s.phase==='await-kong-responses';
  const priority=(a:GameAction)=>a.kind==='win'?3:a.kind==='chi'?1:a.kind==='pass'?0:2;
  const choices=Object.values(w.responses).filter((a):a is GameAction=>!!a && a.kind!=='pass').sort((a,b)=>priority(b)-priority(a) || ((SEATS.indexOf(a.seat)-SEATS.indexOf(w.sourceSeat)+4)%4)-((SEATS.indexOf(b.seat)-SEATS.indexOf(w.sourceSeat)+4)%4));
  const chosen=choices[0], source=player(s,w.sourceSeat);
  if(chosen?.kind==='win') {
    if(kong) source.hand=source.hand.filter(t=>t.id!==w.tile.id);
    else source.discards=source.discards.filter(t=>t.id!==w.tile.id);
    s.result={
      kind:'win',winner:chosen.seat,sourceSeat:w.sourceSeat,winningTile:w.tile,method:kong?'rob-kong':'discard'
    };
    s.phase='finished';
    s.pendingWindow=null;
    return;
  }
  if(kong) {
    source.hand=source.hand.filter(t=>t.id!==w.tile.id);
    const meld=source.melds.find(m=>m.kind==='pong' && m.tiles[0].code===w.tile.code)!;
    meld.kind='added-kong';
    meld.tiles.push(w.tile);
    s.pendingWindow=null;
    s.phase='await-discard';
    s.turnOrigin='draw';
    draw(s,w.sourceSeat,true);
    return;
  }
  if(!chosen) {
    advance(s,next(w.sourceSeat));
    return;
  }
  const p=player(s,chosen.seat), tiles=p.hand.filter(t=>chosen.tileIds.includes(t.id));
  p.hand=p.hand.filter(t=>!chosen.tileIds.includes(t.id));
  source.discards=source.discards.filter(t=>t.id!==w.tile.id);
  p.melds.push({
    kind:chosen.kind as 'chi'|'pong'|'exposed-kong',tiles:[...tiles,w.tile],sourceSeat:w.sourceSeat
  });
  s.pendingWindow=null;
  s.activeSeat=chosen.seat;
  s.phase='await-discard';
  s.turnOrigin='claim';
  s.lastDrawnTileId=null;
  if(chosen.kind==='exposed-kong') {
    s.turnOrigin='draw';
    draw(s,chosen.seat,true);
  }
}
export function applyAction(state: GameState, a: GameAction): ActionOutcome {
  const legal=getLegalActions(state,a.seat).find(l=>l.kind===a.kind && l.gameId===a.gameId && l.expectedRevision===a.expectedRevision && l.windowId===a.windowId && l.tileIds.length===a.tileIds.length && [...l.tileIds].sort().every((id,i)=>id===[...a.tileIds].sort()[i]));
  if(!legal) return {
    ok:false,state,events:[],error:'非法或過期的動作'
  };
  const s=structuredClone(state);
  s.revision++;
  if(s.pendingWindow) {
    s.pendingWindow.responses[a.seat]=a;
    if(s.pendingWindow.eligibleSeats.every(seat=>s.pendingWindow!.responses[seat])) resolve(s);
  }
  else {
    const p=player(s,a.seat), tiles=p.hand.filter(t=>a.tileIds.includes(t.id));
    if(a.kind==='discard') {
      p.hand=p.hand.filter(t=>t.id!==tiles[0].id);
      p.discards.push(tiles[0]);
      s.lastDrawnTileId=null;
      openWindow(s,a.seat,tiles[0],false);
    }
    else if(a.kind==='win') {
      s.result={
        kind:'win',winner:a.seat,sourceSeat:a.seat,winningTile:p.hand.find(t=>t.id===s.lastDrawnTileId) ?? p.hand.at(-1)!,method:'self-draw'
      };
      s.phase='finished';
    }
    else if(a.kind==='added-kong') openWindow(s,a.seat,tiles[0],true);
    else if(a.kind==='concealed-kong') {
      p.hand=p.hand.filter(t=>!a.tileIds.includes(t.id));
      p.melds.push({
        kind:'concealed-kong',tiles
      });
      s.turnOrigin='draw';
      draw(s,a.seat,true);
    }
  }
  return {
    ok:true,state:s,events:[{
      type:a.kind,seat:a.seat,message:a.kind
    }]
  };
}
export function getPlayerView(s:GameState,seat:Seat):PlayerView {
  return structuredClone({
    gameId:s.gameId,revision:s.revision,mode:s.mode,seed:s.seed,seat,phase:s.phase,activeSeat:s.activeSeat,wallRemaining:s.wall.length,players:s.players.map(p=>({
      seat:p.seat,hand:p.seat===seat?p.hand:[],handCount:p.hand.length,melds:p.melds.map(m=>({
        ...m,tiles:m.kind==='concealed-kong' && p.seat!==seat?[]:m.tiles,count:m.tiles.length
      })),flowers:p.flowers,discards:p.discards
    })),legalActions:getLegalActions(s,seat),pendingTile:s.pendingWindow?.tile??null,pendingSourceSeat:s.pendingWindow?.sourceSeat??null,result:s.result
  });
}
