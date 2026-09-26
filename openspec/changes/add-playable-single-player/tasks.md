## 1. 整合者：共用契約與工作樹

- [x] 1.1 確認本提案及R/W/B/U規則追溯，更新AGENTS.md、COURSE_TASK.md的新階段範圍，執行npm test與npm run build確認13個baseline測試通過，保存review結果。
- [x] 1.2 在整合分支建立game-types與合法共享fixtures，明確固定engine adapter、PlayerView、Action與事件契約；以型別檢查及fixture牌数／id唯一性測試驗證後提交共用基準。
- [x] 1.3 從共同契約commit建立engine、bots、ui三棵worktree，指派三個平行工作者與獨占範圍；以git worktree list、各分支HEAD及npm ci確認隔離環境，記錄owner和交付方式。

## 2. Engine worktree：規則與胡牌（依賴1.2）

- [x] 2.1 先寫R1–R2起手及摸打失敗測試，再實作保留wall的共用發牌與回合；驗證原rules snapshot完全不變。
- [x] 2.2 先寫W1–W3完整／副露／槓／字牌／多重拆法正反例，再實作胡牌判定；驗證錯誤牌數和第五張同牌不能胡。
- [x] 2.3 先寫R3–R5吃組選擇、碰、多人宣告優先與回覆排列測試，再實作窗口仲裁；確認吃碰後不多摸牌。
- [x] 2.4 先寫R6–R8明槓、暗槓、加槓被搶／未被搶及連續補花測試，再實作補牌；驗證暗槓不開搶胡窗口。
- [x] 2.5 先寫R9–R11保留線、重複／過期動作、牌張守恆測試，再完成拒絕及流局；驗證每種牌總量與id不重複。
- [x] 2.6 先寫W4–W5終局與view隱藏資訊測試，再完成勝利牌來源、終局封鎖及投影；跑engine/win與baseline全測試後回報commit與證據。

## 3. Bots worktree：電腦與控制器（依賴1.2，可與2及4平行）

- [x] 3.1 先寫B1–B2合法選擇、優先胡、重現與隱藏資訊不影響結果的測試，再實作chooseBotAction；使用契約fixtures確認不依赖完整GameState。
- [x] 3.2 先用注入engine adapter及fake timers建立B3–B4等待真人、連續電腦回合、重開與終局取消測試，再實作controller；確認排程不重複、不忙迴圈。
- [x] 3.3 以契約測試驗證controller輸出PlayerView與回呼生命週期，執行bots/controller測試和build；回報commit、介面相容結果與整合需求。

## 4. UI worktree：互動桌面（依賴1.2，可與2及3平行）

- [x] 4.1 先以U1/U2 fixtures建立手牌選擇、動作候選與對手牌背驗收，再實作table UI；檢查DOM無暗手牌碼或暗槓牌面。
- [x] 4.2 依U3–U5建立模式切換、錯誤seed、結果及再玩控制，透過callback接入契約；fixture驗證一次操作只送一個動作且清除舊選擇。
- [x] 4.3 完成U6響應式及鍵盤操作，Browser於320/1280px檢查選牌、吃組、放棄與重開；記錄截圖與結果並回報commit，不修改main.ts。

## 5. 整合者：合併與完整牌局（依賴2、3、4交付）

- [x] 5.1 依engine、bots、UI順序逐一合入整合分支，各次跑相關測試與型別檢查；若契約衝突先協調owner，記錄合入commit而不覆蓋他人程式。
- [x] 5.2 在main.ts串接引擎、controller及UI，先寫整合失敗案例再接線；驗證東家出牌→電腦推進→真人應對→續行，以及思考中重新開局。
- [x] 5.3 對兩種模式執行固定seed完整對局及fixture自摸／放槍／搶槓／流局測試；每步檢查守恆並確認在合理測試步數上限內真正終局。
- [x] 5.4 執行npm test、npm run build、OpenSpec strict validate、git diff --check與人工diff review；確認原baseline不退步，無fixture作弊入口或後端功能。
- [x] 5.5 Browser於320/1280px完整驗收U1–U6及罕見R/W情境，記錄控制方式、結果、console錯誤與截圖；不得以單元測試冒充畫面驗收。
- [x] 5.6 更新tasks及verification交付檔案、Red/Green、scenario追溯、worktree提交紀錄和剩餘限制；確認整合分支可供review，不自動archive、部署或刪除worktree。

## 6. 摸牌顯示修正

- [x] 6.1 U7/U8 失敗測試、投影與 UI 分離摸牌，出牌後併入。
- [ ] 6.2 全套測試、build、桌面／手機 Browser Preview 與 diff review。

## 7. 傳統牌面
- [x] 7.1 U9 先失敗測試，實作共用 SVG 牌面與無障礙牌名。
- [ ] 7.2 全測試、build、Browser 與 diff review。

7.2 驗證紀錄：新增 tests/ui/tile-face.test.ts 先因 renderer 未存在失敗，再實作後全套 64 tests 通過；build 與 diff --check 通過。Preview 已啟動並開啟；CUA 因 sandbox-exec TIOCSTI 啟動失敗，桌面/手機全42種牌及鍵盤操作仍待人工目視驗收，未標示完成。
