## Why

目前介面只展示四家起手牌，無法實際完成一局。將已確認的單機台灣十六張規則做成可互動遊戲，並以獨立 worktree 分工縮短開發等待時間。

## What Changes

- 一位真人固定東家，三位電腦；有花／無花、seed 與重新開局保留。
- 加入摸打、吃碰、明槓／暗槓／加槓、搶加槓胡、自摸／放槍與流局。
- 胡牌為五組順子／刻子／槓加一對將；不計台分、不做特殊花胡。
- 胡優先於碰／槓，碰／槓優先於吃；多人胡取放槍者下家起最近者。吃限上家，不搶暗槓。
- 牌牆保留最後 16 張；下一次普通摸牌或補牌將動用保留牌時流局。每局固定東家，不做連莊或圈風。
- **BREAKING（畫面）**：主畫面由四家明牌展示改為玩家手牌可操作、電腦暗手遮蔽的遊戲桌；既有規則 API 與 baseline 保留。
- 先固定共用契約，再以規則、電腦、UI 三個 worktree 平行開發，由整合者驗收合併。

## Capabilities

### New Capabilities

- `single-player-round`: 完整牌局狀態、合法動作、補牌與仲裁。
- `standard-hand-win`: 五組一對的胡牌檢查與終局結果。
- `computer-opponents`: 三位電腦的合法、自動且可重現決策。
- `playable-table`: 真人操作、隱藏資訊、狀態提示及重開。

### Modified Capabilities

無。主 specs 目前為空，前一個 add-no-flower-rule 已完成但未同步；本 change 以其已提交實作為基礎，不重寫其 delta。新 playable-table 明確取代主畫面的全明牌展示，保留模式、seed、牌組與起手相容性。

## Impact

擴充 src/mahjong/；新增 src/game/ 與 src/ui/；更新 src/main.ts、src/styles.css、index.html 和 tests/。保留 Vite、TypeScript、Vitest，不加入後端、帳號、金流、儲存、多人連線或部署。使用者本次授權擴大原工作坊 non-goals 至上述單機遊戲範圍；實作時須在 AGENTS.md 與 COURSE_TASK.md 說明新階段邊界。worktree 建立、程式實作及合併均屬下一次 apply，不在此次規劃執行。

### 傳統牌面視覺修正
依使用者要求將文字牌面改為傳統萬、筒、索、字與花牌圖案，保留牌名及既有操作。
