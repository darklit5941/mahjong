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
