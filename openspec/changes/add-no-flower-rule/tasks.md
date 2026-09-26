## 1. Baseline 與失敗測試

- [x] 1.1 依 workshop-bdd-tdd 檢查本 change 的 Rule／Example／Question 與 E1–E11 追溯，確認 review 後的範圍；交付驗收對照並執行 npm run preflight。
- [x] 1.2 執行原有 npm test 並記錄 seed 20260915 的完整花牌 baseline，建立固定回歸斷言；確認四個既有測試與 baseline 通過。
- [x] 1.3 在 tests/rules.test.ts 加入 E2、E4、E5、E6 的模式、組成、手牌張數、無花剩 71 張及預設相容測試，補上總量守恆與無花 validator 拒絕花牌測試；執行 npm test 並記錄因模式未實作而失敗的證據。

## 2. 規則最小實作

- [x] 2.1 擴充 rules.ts 的 RuleMode、buildWall 與 dealInitialHands 可選模式參數，無花排除花牌並直接發普通牌；執行測試確認 E1–E6、總量守恆及原有花牌 baseline 通過。
- [x] 2.2 回傳正確 ruleMode／notes，讓 validateRound 拒絕無花花牌區非空資料；執行對應正反例測試確認驗證與模式一致。

## 3. 開關與介面

- [x] 3.1 在 index.html 加入有 label 的原生使用花牌開關，於 styles.css 加入適當尺寸與焦點樣式，更新只支援花牌的過時文案；Browser 確認 E7、E10 與 320px 寬度可操作且無水平溢位。
- [x] 3.2 main.ts 共用模式／seed 開局流程並由 RoundState 渲染狀態、說明與花牌區；Browser 依 E8、E9 往返切換及重複提交，確認所有資訊同步刷新。
- [x] 3.3 統一 seed 正整數驗證，失敗時保留牌局並恢復開關；Browser 依 E11 驗證空白、0、1.5 與修正後恢復，確認不再默默截斷小數。

## 4. 整合驗收與交付

- [x] 4.1 執行 npm test 與 npm run build，確認全數通過並記錄結果，不刪除或放寬既有測試。
- [x] 4.2 啟動或使用 npm run dev 的 Browser Preview，完整驗收 E7–E11；記錄實際觀察、鍵盤操作與窄螢幕結果，無法完成的人工驗收明確標示待驗。
- [x] 4.3 執行 OpenSpec strict validate、git diff --check 與 Git diff review，確認範圍只含規劃和所需程式／測試變更；交付檔案清單、測試、E1–E11 證據追溯、test/build 結果、Browser 結果及簡化補花限制。
