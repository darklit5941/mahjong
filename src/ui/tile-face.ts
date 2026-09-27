import { flowerArt } from './flower-art';
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
function roundedBamboo(x:number,y:number,angle:number,color:string,half:number):string {
 return `<g class="bamboo" transform="translate(${x} ${y}) rotate(${angle})" stroke="${color}" fill="${color}"><path d="M-2.5 ${-half}V${half} M2.5 ${-half}V${half}" stroke-width="2.4"/>${[-half,0,half].map(node => `<ellipse cx="0" cy="${node}" rx="5" ry="2.2" stroke="none"/>`).join('')}</g>`;
}
function sevenBamboo():string {
 return [[30,15],[14,42],[30,42],[46,42],[14,69],[30,69],[46,69]]
  .map(([x,y],i)=>roundedBamboo(x,y,0,i===0?red:green,9)).join('');
}
// Upright outer stalks and central chevrons, following the supplied B8 reference.
function eightBamboo(): string {
 const stalks = [[12,23,0],[24,27,45],[36,27,-45],[48,23,0],
  [12,61,0],[24,57,-45],[36,57,45],[48,61,0]];
 return stalks.map(([x,y,angle]) => roundedBamboo(x,y,angle,green,angle===0?12:10)).join('');
}
/** Local vector artwork; flower credits are listed in artwork-credits.html. */
export function tileFace(code:TileCode):string {
 const n=Number(code.slice(1)); let art='';
 if(/^D[1-9]$/.test(code)) art=(n===7?[[14,11],[30,22],[46,33],[16,52],[44,52],[16,72],[44,72]]:positions[n]).map(([x,y],i)=>dot(x,y,n===1?20:n===7?5.5:n>=7?6:8,n===1?ink:n===5&&i===2?red:n===3?[ink,red,green][i]:n<=2?green:(n===7||n===9)&&i<3?red:ink)).join('');
 else if(code==='B1') art=`<g class="bird"><path d="M27 43Q4 52 10 74Q24 66 33 51 M28 44Q14 56 18 73 M30 45Q23 59 25 71" fill="none" stroke="${green}" stroke-width="4"/><path d="M28 51Q48 55 46 34L40 23Q36 12 29 20Q24 25 33 30L28 39Q16 34 18 43Z" fill="${green}"/><path d="M24 42Q33 34 39 41Q37 51 24 42" fill="${ink}"/><circle cx="34" cy="22" r="2" fill="white"/><path d="M29 22L21 25L30 27 M34 16L31 10 M38 17L40 11" stroke="${red}" stroke-width="2" fill="${red}"/><path d="M37 52L39 64H46 M33 52L32 62H37" fill="none" stroke="${red}" stroke-width="2"/></g>`;
 else if(code==='B7') art=sevenBamboo();
 else if(code==='B8') art=eightBamboo();
 else if(/^B[2-9]$/.test(code)) {
 const points=positions[n];
 art=points.map(([x,y],i)=>bamboo(x,y,n===5&&i===2||n===9&&i%3===1?red:green)).join('');
 } else if(code[0]==='C') art=text('一二三四五六七八九'[n-1],30,35,31,ink)+text('萬',30,72,34,red);
 else if(code==='DW') art=`<g class="white-dragon" fill="none" stroke="${ink}"><rect x="12" y="12" width="36" height="60" rx="2" stroke-width="3"/><rect x="17" y="17" width="26" height="50" stroke-width="1.5"/><path d="M12 24L17 29 M12 40L17 45 M12 56L17 61 M43 23L48 28 M43 39L48 44 M43 55L48 60 M22 12L27 17 M33 67L38 72" stroke-width="2"/></g>`;
 else if(code[0]==='F') art=flowerArt[code];
 else art=text(tileLabel(code),30,59,47,code==='DR'?red:code==='DG'?green:ink);
 return `<svg class="tile-face" viewBox="0 0 60 84" role="img" aria-label="${tileLabel(code)}" focusable="false"><title>${tileLabel(code)}</title>${art}</svg>`;
}
