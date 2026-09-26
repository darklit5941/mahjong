import { describe, expect, it } from "vitest";

import { buildWall, dealInitialHands, validateRound } from "../src/mahjong/rules";
import { FLOWER_TILE_CODES, NORMAL_TILE_CODES, isFlower } from "../src/mahjong/tiles";

describe("台灣麻將花牌規則 baseline", () => {
  it("建立 144 張牌牆", () => {
    const wall = buildWall(42);

    expect(wall).toHaveLength(144);
    expect(wall.filter(isFlower)).toHaveLength(8);
    for (const code of NORMAL_TILE_CODES) {
      expect(wall.filter((tile) => tile === code)).toHaveLength(4);
    }
    for (const code of FLOWER_TILE_CODES) {
      expect(wall.filter((tile) => tile === code)).toHaveLength(1);
    }
  });

  it("東家 17 張，其餘三家 16 張", () => {
    const round = dealInitialHands(20260915);

    expect(round.players.map((player) => player.tiles.length)).toEqual([17, 16, 16, 16]);
  });

  it("花牌移到花牌區，手牌只留下普通牌", () => {
    const round = dealInitialHands(1);

    expect(round.players.flatMap((player) => player.flowers).length).toBeGreaterThan(0);
    expect(round.players.flatMap((player) => player.tiles).some(isFlower)).toBe(false);
    expect(validateRound(round)).toEqual([]);
  });

  it("相同 seed 可以重現相同牌局", () => {
    expect(dealInitialHands(1234)).toEqual(dealInitialHands(1234));
  });
});

// E6: captured before implementing mode selection.
it("保留 seed 20260915 的完整有花 baseline", () => {
  expect(dealInitialHands(20260915)).toMatchSnapshot();
});


describe("規則模式選擇", () => {
  it("E2 無花牌牆只有 136 張普通牌", () => {
    const wall = buildWall(42, "no-flowers");
    expect(wall).toHaveLength(136);
    expect(wall.some(isFlower)).toBe(false);
    for (const code of NORMAL_TILE_CODES) {
      expect(wall.filter((tile) => tile === code)).toHaveLength(4);
    }
  });

  it("E4 無花起手牌不補花且剩 71 張", () => {
    const round = dealInitialHands(1, "no-flowers");
    expect(round.ruleMode).toBe("no-flowers");
    expect(round.players.map((player) => player.tiles.length)).toEqual([17, 16, 16, 16]);
    expect(round.players.flatMap((player) => player.flowers)).toEqual([]);
    expect(round.players.flatMap((player) => player.tiles).some(isFlower)).toBe(false);
    expect(round.wallRemaining).toBe(71);
    expect(validateRound(round)).toEqual([]);
  });

  for (const mode of ["flowers", "no-flowers"] as const) {
    it(`E3/E4 ${mode} 發牌前後總量守恆`, () => {
      const round = dealInitialHands(1, mode);
      const dealt = round.players.reduce((sum, player) => sum + player.tiles.length + player.flowers.length, 0);
      expect(dealt + round.wallRemaining).toBe(mode === "flowers" ? 144 : 136);
    });

    it(`E5 ${mode} 相同 seed 重現完整牌局`, () => {
      expect(dealInitialHands(1234, mode)).toEqual(dealInitialHands(1234, mode));
    });
  }

  it("E6 省略模式等同明確有花模式", () => {
    expect(buildWall(42)).toEqual(buildWall(42, "flowers"));
    expect(dealInitialHands(20260915)).toEqual(dealInitialHands(20260915, "flowers"));
  });

  it("拒絕無花模式花牌區出現花牌", () => {
    const round = dealInitialHands(1, "no-flowers");
    round.players[0].flowers.push("F1");
    expect(validateRound(round)).toContain("東家在無花牌規則下不得有花牌");
  });
});
