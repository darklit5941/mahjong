import { tileLabel, type TileCode } from '../mahjong/tiles';
const ink='#172f49', red='#b32c32', green='#176143';
const positions: Record<number, number[][]> = {
 1:[[30,42]],2:[[30,22],[30,62]],3:[[16,20],[30,42],[44,64]],
 4:[[16,22],[44,22],[16,62],[44,62]],5:[[16,20],[44,20],[30,42],[16,64],[44,64]],
 6:[[16,18],[44,18],[16,42],[44,42],[16,66],[44,66]],
 7:[[13,16],[30,16],[47,16],[17,40],[43,40],[17,66],[43,66]],
 8:[[16,14],[44,14],[16,32],[44,32],[16,52],[44,52],[16,70],[44,70]],
 9:[[13,18],[30,18],[47,18],[13,42],[30,42],[47,42],[13,66],[30,66],[47,66]],
};
const text=(value:string,x:number,y:number,size:number,color:string)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${color}" font-weight="700" font-family="KaiTi, BiauKai, Kaiti TC, Noto Serif TC, serif">${value}</text>`;
function dot(x:number,y:number,r:number,color:string):string {
 return `<g class="pip" fill="none" stroke="${color}"><circle cx="${x}" cy="${y}" r="${r}" stroke-width="2.6"/><circle cx="${x}" cy="${y}" r="${r*.55}" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="1.5" fill="${color}"/></g>`;
}
function bamboo(x:number,y:number,color:string,angle=0):string {
 return `<g class="bamboo" transform="translate(${x} ${y}) rotate(${angle})" stroke="${color}" stroke-linecap="round"><path d="M-2 -7 Q0 -5 -2 0 Q0 5 -2 7 M2 -7 Q0 -5 2 0 Q0 5 2 7" fill="none" stroke-width="2.3"/><path d="M-3 -8H3 M-3 0H3 M-3 8H3" stroke-width="2.5"/></g>`;
}
function plant(n:number):string {
 const stem='<path d="M31 73Q23 49 36 30 M29 59L15 43 M29 53L45 40" fill="none" stroke="#176143" stroke-width="2"/>';
 const leaves='<path d="M28 61Q8 61 12 49Q23 48 28 61 M31 53Q47 56 49 44Q36 43 31 53" fill="#176143"/>';
 if(n===7) return bamboo(28,50,green)+bamboo(28,68,green)+leaves;
 const petals=Array.from({length:n===8?12:5},(_,i)=>`<ellipse cx="0" cy="-7" rx="${n===8?2:4}" ry="7" transform="rotate(${i*(n===8?30:72)})"/>`).join('');
 return stem+leaves+`<g transform="translate(35 33)" fill="${[red,red,'#445aaa','#b98529','#a8413d',red,'#7057a1',green,'#b98529'][n]}">${petals}<circle r="3" fill="#bd8b2c"/></g>`;
}
/** Original vector artwork following traditional tile conventions; no remote assets. */
export function tileFace(code:TileCode):string {
 const n=Number(code.slice(1)); let art='';
 if(/^D[1-9]$/.test(code)) art=positions[n].map(([x,y],i)=>dot(x,y,n===1?20:n>=7?6:8,n===1?ink:n===5&&i===2?red:n===3?[ink,red,green][i]:n<=2?green:n>=7&&i<3?red:ink)).join('');
 else if(code==='B1') art=`<g class="bird"><path d="M27 43Q4 52 10 74Q24 66 33 51 M28 44Q14 56 18 73 M30 45Q23 59 25 71" fill="none" stroke="${green}" stroke-width="4"/><path d="M28 51Q48 55 46 34L40 23Q36 12 29 20Q24 25 33 30L28 39Q16 34 18 43Z" fill="${green}"/><path d="M24 42Q33 34 39 41Q37 51 24 42" fill="${ink}"/><circle cx="34" cy="22" r="2" fill="white"/><path d="M29 22L21 25L30 27 M34 16L31 10 M38 17L40 11" stroke="${red}" stroke-width="2" fill="${red}"/><path d="M37 52L39 64H46 M33 52L32 62H37" fill="none" stroke="${red}" stroke-width="2"/></g>`;
 else if(/^B[2-9]$/.test(code)) {
 const points=n===8?[[16,19],[44,19],[16,35],[44,35],[16,51],[44,51],[16,67],[44,67]]:positions[n];
 art=points.map(([x,y],i)=>bamboo(x,y,n===5&&i===2||n===7&&i===1||n===9&&i%3===1?red:green,n===8?(i%4===0||i%4===3?30:-30):0)).join('');
 } else if(code[0]==='C') art=text('一二三四五六七八九'[n-1],30,35,31,ink)+text('萬',30,72,34,red);
 else if(code==='DW') art=`<g class="white-dragon" fill="none" stroke="${ink}"><rect x="12" y="12" width="36" height="60" rx="2" stroke-width="3"/><rect x="17" y="17" width="26" height="50" stroke-width="1.5"/><path d="M12 24L17 29 M12 40L17 45 M12 56L17 61 M43 23L48 28 M43 39L48 44 M43 55L48 60 M22 12L27 17 M33 67L38 72" stroke-width="2"/></g>`;
 else if(code[0]==='F') art=text(tileLabel(code),12,21,17,n<=4?red:ink)+plant(n);
 else art=text(tileLabel(code),30,59,47,code==='DR'?red:code==='DG'?green:ink);
 return `<svg class="tile-face" viewBox="0 0 60 84" role="img" aria-label="${tileLabel(code)}" focusable="false"><title>${tileLabel(code)}</title>${art}</svg>`;
}
