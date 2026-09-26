## Why

目前只能建立有花牌的起手牌，使用者無法比較無花牌玩法。加入明確開關，讓同一個練習介面支援兩種規則並能重現結果。

## What Changes

- 新增「使用花牌」開關，預設開啟；關閉使用 136 張普通牌，開啟使用 144 張牌。
- 切換後以有效 seed 立即重新開局，同步更新規則名稱、手牌、花牌區、牌牆剩餘與說明。
- 保留東家 17 張、其他三家 16 張，以及現有簡化補花流程。
- 保留既有省略模式參數的呼叫行為，相同模式與 seed 可重現結果。

## Capabilities

### New Capabilities

- `rule-mode-selection`: 有花／無花牌組、起手牌與可重現性，以及 UI 開關和狀態一致性。

### Modified Capabilities

無；目前主 specs 尚無既有能力規格。

## Impact

- 規則：`src/mahjong/rules.ts`；沿用 `tiles.ts` 與 `random.ts`。
- 介面：`src/main.ts`、`src/styles.css`、`index.html` 的控制項與說明。
- 驗證：`tests/rules.test.ts` 新增模式測試，Browser 驗收開關與錯誤輸入。
- 不增加依賴；不納入計分、胡牌、吃碰槓、摸打、連線、儲存或實體牌桌輪流補花的重作。
