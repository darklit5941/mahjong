- [x] 1. 確認使用者要求並記錄 proposal、spec、design 與 Rule/Example/Question。
- [x] 2. 先失敗測試，再加入頁首入口及響應式樣式。
- [x] 3. npm ci、preflight、74 tests、build、git diff --check 與 diff review 完成。
- [ ] 4. Browser 目視檢查桌面／320px、鍵盤焦點與點擊另開表單。

F1 → tests/ui/issue-report.test.ts：先因缺少入口失敗，再驗證頁首連結、指定網址、麻將／v1.0 預填值、新分頁與 noopener noreferrer 通過。
Preview 已於 http://127.0.0.1:5173/ 啟動；CUA 兩次均因 trusted Node process exited unexpectedly 無法啟動，未宣稱 Browser 目視或外部表單載入驗收完成。無待決業務規則。
