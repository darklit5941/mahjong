# Worktree 開發與驗收紀錄

## 恢復點

2026-09-16 從前日用量中斷恢復。main checkpoint 為 5f5df71；共用契約與計畫提交 a54161e。恢復時整合分支只有 tests/integration 未提交；engine 留有 start-turn/standard 測試，bots 留有 policy/scheduling 測試，UI 尚無變更。沒有遺失提交或需要覆寫的使用者修改。

## 分工

| Owner | 分支 | 工作樹 |
| --- | --- | --- |
| 整合者 | codex/playable-integration | 原專案目錄 |
| engine | codex/playable-engine | /private/tmp/mahjong-playable-engine |
| bots | codex/playable-bots | /private/tmp/mahjong-playable-bots |
| ui | codex/playable-ui | /private/tmp/mahjong-playable-ui |

實際使用可寫入的 /private/tmp 取代建議相鄰目錄；隔離方式與分工不變。三者從 a54161e 開始，獨占範圍依 design.md；整合者獨占 main.ts、共享契約與本紀錄。

## TDD 起點

- 原始13個測試及build在2026-09-15通過。
- 共用fixture新增1個測試，合計14個；型別檢查修正 ViewMeld.count 後build通過。
- 整合 full-game.test.ts 先建立完整對局與controller案例；初次執行因 game 模組未實作而失敗，未開始前不能產生可玩牌局。

## 驗收狀態

2026-09-17 實作與整合驗收完成，21/21 tasks 完成。


## 最終提交與驗證

- engine worktree ea610bb → 整合 0ca57f9：37個分支測試與build通過。
- bots worktree 7e2030b → 整合 d9de350：23個分支測試與build通過。
- ui worktree 407f739 → 整合 5ce3a42：17個分支測試與build通過。
- 三棵worktree依序cherry-pick，無衝突；原main仍保留5f5df71。原專案目錄目前使用codex/playable-integration。
- 最終npm test：9個檔案、58個測試全部通過；包含8次兩模式固定seed完整對局，每一步檢查實體牌數、id唯一及每種牌數，均正常終局。
- npm run build：TypeScript、Vite通過。原有13個規則測試及snapshot未修改。
- npm run preflight、OpenSpec strict validate、git diff --check通過；已閱讀引擎、胡牌、controller、UI、main及測試diff。
- UI整合發現狀態列仍顯示準備中：先新增Browser斷言並確認失敗，再修正main狀態映射，重驗通過。

## 實際驗收追溯

| Rule / Example | Scenario | Automated test | Browser / 目視結果 |
| --- | --- | --- | --- |
| 起手相容與摸打 | R1–R2 | rules、snapshot、engine/start-turn、integration/full-game | 真人選牌出牌、三電腦推進，可完成一局 |
| 多吃法與仲裁 | R3–R5 | engine/claims-kongs | 3組吃牌選项可見且只送出一次，吃後取得出牌權 |
| 三種槓與補花 | R6–R8 | engine/claims-kongs | 明槓、暗槓按鈕操作後副露顯示；加槓→搶槓胡畫面正確 |
| 保留線及不合法動作 | R9–R11 | engine/claims-kongs、integration守恆 | 花牌補牌碰16張保留線顯示流局，終局無摸打按鈕 |
| 五組一對與結果 | W1–W5 | win/standard、engine/claims-kongs | 自摸、放槍（含來源）、搶槓胡、流局結果及再玩可用 |
| 合法可重現Bot | B1–B2 | bots/policy、integration/full-game | 對手暗手DOM只有牌背，無牌面；Bot資訊隔離由測試驗證 |
| 等真人與排程取消 | B3–B4 | controller/scheduling、integration/full-game | 思考中重開後舊callback不改新局 |
| 可操作桌面 | U1–U6 | ui/table、integration/full-game | 1280/320px全套通過，無水平溢位；鍵盤Space選牌、出牌、放棄；無效seed保留牌局；結果重開 |

## Browser 證據

使用已安裝Playwright與本機headless Chrome，驗證http://127.0.0.1:5174/。正式頁面沒有測試fixture入口；特殊牌局驗收在測試瀏覽器透過既有測試fixture與公開模組建立隔離畫面，依真實引擎動作轉移，再檢查DOM。

- /tmp/playable-browser.cjs：1280/320px，U1/U3/U4/U6與狀態列。
- /tmp/playable-scenarios.cjs：兩寬度多吃法、明暗槓、搶槓、自摸、放槍、補花流局、終局重開。
- /tmp/playable-full-browser.cjs：使用瀏覽器模擬時鐘加速電腦延遲、以實際DOM按鈕進行兩模式完整對局。有花19次真人操作循環後西家胡北家三筒；無花16次後西家胡南家四萬。兩局均可重開。
- 沒有pageerror；目視檢查/tmp/playable-1280.png及/tmp/playable-320.png，牌桌和控制項沒有遮擋。特殊結果截圖/tmp/playable-result-1280.png、/tmp/playable-result-320.png。
- 暫存Browser程式及圖片非持久測試套件；Vitest測試已保存在repository。未測其他瀏覽器與真實讀屏軟體。

## 檔案與限制

新增src/mahjong/game-types.ts、game.ts、win.ts；src/game/bot.ts、controller.ts；src/ui/table.ts；tests/contract、fixtures、engine、win、bots、controller、ui、integration。修改index.html、src/main.ts、src/styles.css、AGENTS.md、COURSE_TASK.md；本change規劃及驗收紀錄一併保存。

仍採已確認的單機規則：簡化起手補花、五組一對、單一最近贏家、固定東家、16張保留牌，不計台分。電腦為基本策略，非高強度對手。沒有未決且阻擋交付的業務規則。未部署、未合回main、未sync/ archive；可進行後續review與歸檔。worktree保留。

## 摸牌獨立顯示修正（2026-09-26）

- U7 → tests/ui/drawn-tile.test.ts：按實體 id 分離新牌、直接打出新牌、打出舊牌後保留新牌並撤除摸牌區。
- U7/U8 → tests/engine/drawn-tile.test.ts：槓後連續補花的最終補牌、自己／對手投影、吃碰來源及非出牌階段不顯示摸牌。
- Red：新增4個測試失敗，既有58個通過；Green：62個全部通過。
- npm ci、npm run preflight、npm run build、OpenSpec strict validate、git diff --check 皆通過；已 review diff。
- npm run dev 在授權後啟動於 http://127.0.0.1:5173/。Browser 控制工具兩次回報 trusted Node process exited unexpectedly，故未完成實際桌面／320px手機操作與視覺驗收，6.2保持未完成。需檢查右侧摸牌間距、手機換行、選擇摸牌／舊牌並確認出牌、下一輪新摸牌。
- 無待決業務規則；尚存風險為未經 Browser 驗證的排版與點擊呈現。未 sync／archive。
