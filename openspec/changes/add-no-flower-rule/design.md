## Context

動機見 proposal.md。規則目前只有 `RuleMode = "flowers"`，`buildWall(seed)` 一律加入八張花牌，`dealInitialHands(seed)` 逐家發足普通牌。UI 的規則文字固定為花牌；submit 才讀取 seed，且使用 parseInt。既有四個 Vitest 測試保護花牌 baseline。此變更橫跨規則與 UI，需明確決定模式傳遞及狀態更新方式。

## Goals / Non-Goals

**Goals:** 模式由 UI 傳入規則層，render 由 RoundState 決定；維持現有呼叫相容性，避免錯誤輸入導致開關與畫面不同步。

**Non-Goals:** 不更改洗牌演算法、逐家發牌次序或補花輪序；不持久化偏好，不增加 UI 框架或測試框架。

## Decisions

1. `RuleMode` 加入 `no-flowers`；`buildWall(seed, mode = "flowers")` 與 `dealInitialHands(seed, mode = "flowers")` 使用可選第二參數。比改成必填物件更能保留既有測試與呼叫者。只在有花模式加入花牌，無花發牌直接取普通牌，不呼叫補花流程。沿用 seed RNG，無花不要求與有花牌序相同。
2. `RoundState.ruleMode` 與 notes 回傳實際模式；`validateRound` 新增無花模式花牌區不得有牌的檢查。保留共用手牌張數檢查，不另造平行牌局型別。
3. `index.html` 在 seed 控制旁加入原生 checkbox、可見 label 與 switch 語意，CSS 限定開關樣式，避免現有 input 全寬規則干擾。原生控制項支援鍵盤與讀屏，無需自製點擊 div。
4. main.ts 保存目前 RoundState，共用重新開局入口處理 submit/change。預設使用有花；有效輸入切換立即重建整個牌局。render 全面依模式更新，無花保留花牌區並標示「此模式不使用花牌」，方便比對。替代方案是隱藏花牌區，但會減少對照線索。
5. 規劃預設：切換使用當前輸入 seed；無效輸入保留現有牌局並還原開關。使用完整數值與整數檢查，避免 parseInt 將 1.5 截斷。同步原生表單約束與程式驗證。這屬輸入一致性處理，不改動麻將規則。

## Rules / Examples / Questions and traceability

Scenario 名稱見 specs/rule-mode-selection/spec.md；下列測試名稱為預計新增或保留的驗收證據，尚未執行。

| Rule | Example / scenario | Vitest 或 Browser 證據 |
| --- | --- | --- |
| 依模式建牌牆 | E1 / E2：seed 42 得 144 / 136 張 | 既有「建立 144 張牌牆」；新增「無花牌牆只有 136 張普通牌」 |
| 手牌與補花守恆 | E3：seed 1 有花；E4：無花剩 71 張 | 保留起手張數與花牌移出測試；新增兩模式張數、總量守恆、無花 flowers 為空與 validator 拒絕花牌測試 |
| 可重現及相容 | E5 / E6 | 新增兩模式重現測試；實作前記錄固定 seed baseline，比對省略／明確有花結果與基準 |
| 切換完整刷新 | E7 / E8 / E9 | Browser：初始畫面、seed 1 往返切換、無花提交 seed 1234 及重複提交 |
| 可及性 | E10 | Browser：Tab、空白鍵、焦點、label 與 checked 語意；320px 寬度檢查 |
| 錯誤不破壞狀態 | E11 | Browser：空白、0、1.5 切換失敗與修正後恢復 |

Questions：本範圍沒有未決麻將規則；沿用現有簡化流程，不引入競技補花輪序。預設開啟、使用輸入 seed、無花區提示與錯誤恢復是本提案的 UI 設計選擇，供 review。

## Risks / Trade-offs

- [重構意外改變有花牌序] → 先固定代表性 seed 的完整 baseline，再保留既有測試，避免調整有花流程。
- [開關與舊牌局不一致] → 驗證成功才採用新狀態，失敗還原開關。
- [既有 seed 截斷行為被收緊] → 明確拒絕小數並驗收錯誤復原；正常正整數保持可用。
- [補花流程不是實體競技輪序] → 保持 starter 行為並在交付中說明限制。

## Migration Plan

純本機程式變更，無資料遷移或部署。依 tasks 先測試再實作，通過 test、build、Browser 與 diff review 後交付。需回復時還原本次應用程式變更；預設參數保護原有呼叫者。
