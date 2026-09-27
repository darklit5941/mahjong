import { expect, it } from 'vitest';
import { createRoundSeedGenerator } from '../../src/game/round-seed';

it('U4 automatically generates positive uint32 seeds without repeating, even on random collisions', () => {
  const next = createRoundSeedGenerator(() => 0);
  const seeds = Array.from({ length: 1000 }, next);
  expect(new Set(seeds).size).toBe(1000);
  expect(seeds.every(seed => Number.isInteger(seed) && seed > 0 && seed <= 0xffffffff)).toBe(true);
});

it('U4 wraps collision resolution without producing zero or reusing an earlier seed', () => {
  const next = createRoundSeedGenerator(() => 0xffffffff);
  expect([next(), next(), next()]).toEqual([0xffffffff, 1, 2]);
});
