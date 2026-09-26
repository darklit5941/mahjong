## Context

現有 rules.ts 只回傳排序後起手及剩餘張數，不保留可继续摸牌的牌牆；main.ts 直接渲染四家全部牌面。牌碼沒有單張身分，既有 13 個測試及 snapshot 可守住起手相容性。動機與已確認規則見 proposal.md。此次跨規則、排程與UI，需先鎖定契約才能有效平行。

## Goals / Non-Goals

**Goals:** 純函式引擎、單一仲裁者、對手資訊投影、可測試排程、獨立 worktree 檔案責任，完成一局到終點。

**Non-Goals:** 不重寫現有 RNG 或起手牌序，不導入伺服器／框架，不追求高強度 AI，不加入未確認的家規或計分。遇到會改變合法動作或勝負的未涵蓋規則須詢問使用者，不由子任務自行補定。

## Decisions

### 1. 先建立共用契約

整合者先提交 src/mahjong/game-types.ts 與 tests/fixtures/game-contract.ts，所有分支從同一契約 commit 分出。舊 RoundState API 保留；新 GameState 不使用只驗起手的 validateRound 判斷進行中手牌。

- TileInstance：唯一 id 加 TileCode，避免相同牌選擇與副露移動歧義。
- GameState：gameId、revision、mode、seed、phase、activeSeat、完整 wall、四家暗手／melds／flowers、棄牌、pendingWindow、result。
- phase：await-discard、await-responses、await-kong-responses、finished。普通摸牌在轉移下一人時完成；東家開局直接待出牌。
- Meld：chi/pong/exposed-kong/concealed-kong/added-kong、tileIds、來源座位。暗槓牌面只給持有人。
- Window：唯一 id、來源座位及牌、eligibleSeats、responses。宣告放棄也記錄；收齊後一次裁決，不依異步回覆先後。
- Action：gameId、expectedRevision、windowId（如適用）、seat、kind、tileIds。kind 為 discard/chi/pong/exposed-kong/concealed-kong/added-kong/win/pass；引擎產生完整候選，UI 不自行組合合法性。
- Result：win（winner、sourceSeat、winningTile、self-draw/discard/rob-kong）或 draw（reserve-exhausted）。
- PlayerView：自己暗手、其他暗手張數、公開棄牌／副露／花牌、phase、legalActions、結果及剩餘張數；不包含 wall 牌序或其他暗手牌碼。UI 與 AI 只收此投影。

預計 exports：createGame({seed, mode, gameId})、getLegalActions(state, seat)、applyAction(state, action) -> {ok, state, events, error?}、getPlayerView(state, seat)、isWinningHand(concealed, melds)。Bot 為 chooseBotAction(view, decisionSeed)；UI 為 renderTable(view, onAction)。簽章在第一個契約提交中以實際型別固定，後續不得私自改動；必要變更由整合者一次更新契約及消費端。

選擇純 TypeScript reducer，較於 UI 直接改陣列可集中驗證、重放與測試。相同牌張不得同時存在棄牌、副露或勝利牌區；事件紀錄可參照 id，但不當作額外實體牌。

### 2. 引擎與胡牌

新增 src/mahjong/game.ts、actions.ts、win.ts、view.ts。將既有初始發牌抽出可回傳剩餘牌牆的共用內部流程，舊 dealInitialHands 回傳形式與結果保持不變；不要為了新玩法重排舊洗牌。

以34種牌計數遞迴：枚舉將，再拆剩餘刻子與同花順子，所需組數為5減既有副露數；槓只算一組。字牌不遞增成順子，輸入牌數與每種最多四張先驗證。測試須涵蓋可多種拆法的牌形，不能用只取第一種的貪婪法。

棄牌先建應對窗口；無合法動作的座位自動略過，有候選者需 win/claim/pass。碰與槓在同一合法實體牌狀態不會由不同玩家同時具足牌數；多人胡以座位距離裁決。加槓在仲裁前不修改原碰，成功才移入第四張並補牌。每次首尾取牌都先檢查 wall.length > 16；補花遇保留線即流局。禁止終局後動作及舊 revision/window。

### 3. 電腦與排程

新增 src/game/bot.ts、controller.ts。Bot 使用 PlayerView 與獨立決策 seed，不消耗洗牌 RNG。第一版採固定優先策略：可胡先胡；其他從合法候選以穩定排序及基本保留成組牌的評估選擇，不宣稱最佳策略。

Controller 擁有唯一狀態，依序套用電腦回覆；真人有待回覆時停止，無真人選擇時繼續。排程可注入供 fake timers 測試，UI 動畫不控制仲裁。gameId 與 revision 防止重開後舊 callback 修改新局。預設短暫延遲供玩家閱讀動作，測試可以零延遲。計時器全部由 controller 管理，不散在 UI。

### 4. 畫面

UI worktree 擁有 src/ui/table.ts、src/styles.css、index.html；只用 PlayerView 和 callback。用原生 button 提供牌張與動作選擇，多組吃牌以明確三張牌標籤顯示。真人固定下方東家；其他暗手為牌背。手機以可換行區塊呈現，不強塞橫向桌面配置。用 state 顯示輪次／等待及結果；不加倒數自動放棄。重開及切換沿用目前立即重開行為，無效 seed 保留現局。整合者獨占 main.ts，串接 UI/controller/engine。

### 5. Worktree 分工與依賴

工作樹放在相鄰目錄，建立時遵守實際 filesystem 權限。下列是 apply 階段計畫，本次不建立。

| 角色／分支 | 工作樹建議名稱 | 獨占範圍 | 依賴與交付 |
| --- | --- | --- | --- |
| 整合：codex/playable-integration | mahjong-playable-integration | game-types、共享 fixtures、main.ts、專案文件、tasks、整合測試 | 先發布契約，最後串接與全套驗收 |
| 規則：codex/playable-engine | mahjong-playable-engine | game/actions/win/view、必要 rules.ts 內部抽取、tests/engine、tests/win | R/W scenarios；維持原有 snapshot |
| 電腦：codex/playable-bots | mahjong-playable-bots | src/game/、tests/bots、tests/controller | 以注入 engine adapter 與契約 fixtures 獨立測試，整合時接實體引擎 |
| 介面：codex/playable-ui | mahjong-playable-ui | src/ui/、styles.css、index.html、tests/ui | 以 PlayerView fixtures 驗證，不改 main.ts 或規則 |

依賴：planning review --> 契約與fixtures提交 --> engine / bots / UI平行 --> engine合入 --> bots合入 --> UI合入 --> main串接與整合验收。

只有整合者修改 tasks.md、package.json、lockfile 和共享型別。工作者回報測試、commit id、scenarios 與未決問題；不在彼此 worktree 操作，不共用 node_modules，不自動刪除工作樹。每棵樹各 npm ci；UI preview 使用獨立 port。整合者逐一 cherry-pick工作提交，衝突按契約處理，不用覆蓋方式吞掉他人變更。合併前保留乾淨 main 與已有 checkpoint。

### 6. Rule / Example / Question 與證據追溯

Story：真人能與三位電腦完成一局，並可重新開始。使用者已確認對戰形式、無計台、五組一對、宣告優先、搶加槓、不搶暗槓、16張保留線及固定東家。UI元件、Bot簡單策略及模組檔名屬工程選擇。没有待決且阻擋本提案的業務問題。

| Rule / Example | Scenario | Automated test（預計） | Browser / 人工 |
| --- | --- | --- | --- |
| 起手與摸打 | R1–R2 | engine/start-turn.test.ts；既有rules與snapshot | 東家出牌後電腦輪流 |
| 吃碰仲裁與多胡 | R3–R5 | engine/claims.test.ts，反轉回覆順序仍同結果 | 以fixture展示多吃法及放棄 |
| 三種槓、搶槓、補花 | R6–R8 | engine/kongs-flowers.test.ts | fixture操作槓及搶槓結果 |
| 保留線、非法動作與守恆 | R9–R11 | engine/invariants.test.ts；每步牌id唯一與總量 | 顯示流局，重複點擊不重送 |
| 胡牌與結果 | W1–W5 | win/standard.test.ts、engine/results.test.ts | 自摸／放槍／搶槓／流局結果 |
| Bot合法與資訊隔離 | B1–B2 | bots/policy.test.ts | 不以畫面證明隱藏邏輯 |
| 排程等待與取消 | B3–B4 | controller/scheduling.test.ts（fake timers） | 等真人應對、思考中重開 |
| 桌面與手機完整操作 | U1–U6 | ui投影檢查與整合Browser案例 | 320/1280px、鍵盤、牌背DOM、錯誤seed |

Scenario測試採可構造的合法固定牌局，先檢查fixtures符合牌數限制；罕見搶槓／補花邊界不能靠隨機seed碰運氣。最後增加兩模式固定seed自動完整對局，確認有限步內終局；測試步數上限只作死循環偵測，不替代真實流局規則。正式入口不得包含任意作弊fixture按鈕。

## Risks / Trade-offs

- [多份 worktree 同改契約導致無法整合] → 契約先行、單一owner、fixtures與編譯檢查；有變更通知所有工作者。
- [起手重構改變牌序] → 保留現有 snapshot，不更新成新輸出以掩蓋回歸。
- [非同步搶牌漏掉真人或高優先者] → 全窗口收齊後仲裁，測試回覆順序排列。
- [AI讀取隱藏資訊] → 僅接收投影，不傳完整 state；對手暗手也不放DOM屬性。
- [簡單電腦較弱] → 第一版保證合法且會胡，不承諾競技強度。
- [前一change尚未同步主spec] → 明列既有已完成change依賴；不自動archive，後續sync需檢查UI替代語意。

## Migration Plan

Apply開始先記錄並更新新階段文件，提交規劃及共用契約供工作樹共同引用。各分支通過自己的測試才交付，整合後跑npm test、npm run build、OpenSpec strict validate與Browser。保留main既有版本到整合驗收成功；需退回時還原整合提交，不抹除工作樹。此次不部署、不改遠端，Sync／Archive待使用者要求。

### 摸牌顯示修正（使用者要求）
Rule：新摸牌先獨立，出牌後才整理留下的手牌。Example：摸入二萬、打出九萬後，二萬才進入排序；直接打出二萬則不改舊手牌。Question：無待決規則。
PlayerView 新增 drawnTileId，僅在自己為 activeSeat、await-discard 且非 claim 時投影 lastDrawnTileId；包含莊家起手最後一張。引擎手牌集合維持原狀，UI 按實體 id 分離，避免相同牌碼混淆。

| Rule / Example | Scenario | Automated test | Browser / 人工 |
| --- | --- | --- | --- |
| 摸牌分離、留牌併入、直接打出 | U7 | tests/ui/drawn-tile.test.ts | 右側摸牌、點選出牌、桌面及手機 |
| 補花／槓補牌與吃碰／隱藏資訊 | U7–U8 | tests/engine/drawn-tile.test.ts | 自動測試驗證投影 |

### 傳統牌面設計
Rule：所有公開牌共用本機 SVG renderer；筒為圈、索為竹節（一索為鳥），萬為黑字紅萬，白板為藍框，花牌有植物圖案。Example：九筒有九圈、二索有兩竹、紅中與綠發不同色。Question：無業務規則變更。U9 → tests/ui/tile-face.test.ts；Browser 檢查全42種、桌面/手機及出牌。參考 https://www.unicode.org/L2/L2007/07171-n3171.pdf 。自行繪製 SVG，不依賴遠端圖片或麻將符號字型。
