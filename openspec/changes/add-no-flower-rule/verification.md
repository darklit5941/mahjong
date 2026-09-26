# 驗收紀錄

## 範圍與結果

2026-09-15 完成 add-no-flower-rule。沿用原有簡化發牌與補花輪序，沒有未決業務規則。未提交 Git、未同步主 specs、未 archive。

修改：index.html、src/mahjong/rules.ts、src/main.ts、src/styles.css、tests/rules.test.ts；新增 tests/__snapshots__/rules.test.ts.snap；更新本 change 的 tasks.md 及本紀錄。

## TDD 與建置

- preflight 通過；原有 4 個測試通過。
- 在修改規則前，保存 seed 20260915 的完整 RoundState snapshot，5 個測試通過。
- 加入模式測試後，13 個測試中 4 個預期失敗：無花牌牆仍為 144 張、mode 仍為 flowers、無花總量仍為 144、validator 未拒絕花牌。
- 實作後 npm test：13/13 通過，原有 4 個測試未放寬；snapshot 未重新生成。
- npm run build：TypeScript 與 Vite 通過。
- OpenSpec strict validate、git diff --check 通過。已閱讀程式 diff 與 baseline snapshot，沒有新增依賴或超出範圍的功能。

## 追溯

| Rule / Example | OpenSpec scenario | Automated test | Browser / visible acceptance |
| --- | --- | --- | --- |
| 144 張有花、136 張無花 | E1 / E2 | 既有牌牆組成；E2 無花牌牆只有 136 張普通牌 | 規則說明與顯示模式一致 |
| 起手張數、花牌移出與牌數守恆 | E3 / E4 | 既有起手與花牌測試；E4 無花起手；兩模式守恆；validator 負例 | 17/16/16/16、無花剩 71 張、四家花牌區為空 |
| 重現與相容 | E5 / E6 | 兩模式 seed 1234 重現；預設等同有花；seed 20260915 snapshot | 無花 seed 1234 重複提交相同手牌 |
| 預設與模式切換 | E7 / E8 / E9 | 規則結果由 Vitest 覆蓋 | 兩種寬度：初始有花；seed 1 雙向切換；seed 1234 重開 |
| 鍵盤控制 | E10 | 本次 Playwright Browser 驗收 | Tab 可達開關，Space 雙向操作，focus-visible outline 存在；角色、名稱及 checked 狀態可讀 |
| 無效 seed 不破壞牌局 | E11 | 本次 Playwright Browser 驗收 | 空白、0、1.5 均顯示錯誤並還原開關；手牌及本局 seed 不變；修正成 1 後成功且清除錯誤 |

## Browser 方法與限制

內建 CUA 工具因 sandbox-exec 啟動錯誤無法使用。取得環境授權後，改用既有 Playwright 套件啟動獨立 headless Chrome，驗收 http://127.0.0.1:5174/，未增加專案依賴。1280×900 與 320×900 視窗均完整執行 E7–E11，無水平溢位、無 pageerror。已目視檢查完整頁面截圖，控制項與牌張沒有遮擋。

暫存驗收程式：/tmp/mahjong-browser-check.cjs。暫存截圖：/tmp/mahjong-1280.png、/tmp/mahjong-320.png。這些是本次執行證據，不屬於持久化測試套件；未進行真實讀屏軟體或其他瀏覽器測試。

## 尚存限制

有花模式仍採逐家發足、遇花立即補到普通牌的 starter 流程，不模擬競技輪流補花。沒有計分、胡牌或摸打回合。可進行 Sync Specs／Archive review。
