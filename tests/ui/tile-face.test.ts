import { expect, it } from 'vitest';
import { tileFace } from '../../src/ui/tile-face';
import { NORMAL_TILE_CODES, FLOWER_TILE_CODES, tileLabel } from '../../src/mahjong/tiles';
it('U9 renders all 42 faces with accessible names and scalable artwork', () => {
 for (const code of [...NORMAL_TILE_CODES, ...FLOWER_TILE_CODES]) {
  expect(tileFace(code)).toContain(`aria-label="${tileLabel(code)}"`);
  expect(tileFace(code)).toContain('viewBox="0 0 60 84"');
 }
});
it('U9 uses countable dots and bamboo, a bird for one bamboo, and framed white dragon', () => {
 for (let n=1;n<=9;n++) expect(tileFace(`D${n}`).match(/class="pip"/g)).toHaveLength(n);
 for (let n=2;n<=9;n++) expect(tileFace(`B${n}`).match(/class="bamboo"/g)).toHaveLength(n);
 expect(tileFace('B1')).toContain('class="bird"');
 expect(tileFace('DW')).toContain('class="white-dragon"');
 expect(tileFace('C3')).toContain('萬');
});
it('U10 seven dots has three diagonal red pips above a blue square', () => {
 const pips = [...tileFace('D7').matchAll(/class="pip" fill="none" stroke="([^"]+)"><circle cx="([^"]+)" cy="([^"]+)"/g)]
  .map(([,color,x,y]) => ({color,x:Number(x),y:Number(y)}));
 expect(pips).toHaveLength(7);
 expect(pips.slice(0,3).every(p => p.color === '#b32c32')).toBe(true);
 expect(pips[0].x).toBeLessThan(pips[1].x);
 expect(pips[1].x).toBeLessThan(pips[2].x);
 expect(pips[0].y).toBeLessThan(pips[1].y);
 expect(pips[1].y).toBeLessThan(pips[2].y);
 const square = pips.slice(3);
 expect(square.every(p => p.color === '#172f49' && p.y > pips[2].y)).toBe(true);
 expect(new Set(square.map(p=>p.x)).size).toBe(2);
 expect(new Set(square.map(p=>p.y)).size).toBe(2);
});

it('U10 seven dots keeps visible space between pip outlines', () => {
 const circles = [...tileFace('D7').matchAll(/<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)" stroke-width="2.6"/g)]
  .map(([,x,y,r]) => ({x:Number(x),y:Number(y),r:Number(r)}));
 expect(circles).toHaveLength(7);
 for (let i=0;i<circles.length;i++) for(let j=i+1;j<circles.length;j++) {
  const a=circles[i], b=circles[j];
  expect(Math.hypot(a.x-b.x,a.y-b.y)-a.r-b.r-2.6).toBeGreaterThanOrEqual(5);
 }
});
it('U11 eight dots uses consistent blue ink for all eight pips', () => {
 const colors = [...tileFace('D8').matchAll(/class="pip" fill="none" stroke="([^"]+)"/g)].map(([,color])=>color);
 expect(colors).toEqual(Array(8).fill('#172f49'));
});
it('U12 reference eight bamboo has upright outer stalks and inward chevrons', () => {
 const stalks=[...tileFace('B8').matchAll(/class="bamboo" transform="translate\((\d+) (\d+)\) rotate\((-?\d+)\)" stroke="([^"]+)"/g)]
  .map(([,x,y,angle,color])=>({x:Number(x),y:Number(y),angle:Number(angle),color}));
 expect(stalks).toHaveLength(8);
 expect(stalks.every(s=>s.color==='#176143')).toBe(true);
 const top=stalks.slice(0,4), bottom=stalks.slice(4);
 expect(top[0].y).toBe(top[3].y);
 expect(top[1].y).toBe(top[2].y);
 expect(bottom[0].y).toBe(bottom[3].y);
 expect(bottom[1].y).toBe(bottom[2].y);
 expect(top[0].y).toBeLessThan(bottom[0].y);
 expect(top.map(s=>s.angle)).toEqual([0,45,-45,0]);
 expect(bottom.map(s=>s.angle)).toEqual([0,-45,45,0]);
 for(const row of [top,bottom]) for(let i=1;i<row.length;i++) expect(row[i].x).toBeGreaterThan(row[i-1].x);
});
it('U13 seven bamboo matches reference: one centered red stalk above two rows of three green stalks', () => {
 const stalks=[...tileFace('B7').matchAll(/class="bamboo" transform="translate\((\d+) (\d+)\) rotate\((-?\d+)\)" stroke="([^"]+)"/g)]
  .map(([,x,y,angle,color])=>({x:Number(x),y:Number(y),angle:Number(angle),color}));
 expect(stalks).toHaveLength(7);
 expect(stalks[0]).toMatchObject({x:30,angle:0,color:'#b32c32'});
 const rows=[stalks.slice(1,4),stalks.slice(4)];
 expect(stalks.slice(1).every(s=>s.color==='#176143' && s.angle===0)).toBe(true);
 for(const row of rows) {
  expect(row.map(s=>s.x)).toEqual([14,30,46]);
  expect(new Set(row.map(s=>s.y)).size).toBe(1);
 }
 expect(stalks[0].y).toBeLessThan(rows[0][0].y);
 expect(rows[0][0].y).toBeLessThan(rows[1][0].y);
});
it('U14 uses the eight named reference artworks with no remote resources or duplicate IDs', () => {
 const names=['spring','summer','autumn','winter','plum','orchid','bamboo','chrysanthemum'];
 for(let i=0;i<names.length;i++) {
  const face=tileFace(`F${i+1}`);
  expect(face).toContain(`data-flower="${names[i]}"`);
  expect(face).toContain('viewBox="0 0 139.764 200"');
  expect(face).not.toMatch(/<script|\bid=|\bhref=|<text/);
  expect(face).toContain('<path');
 }
});
