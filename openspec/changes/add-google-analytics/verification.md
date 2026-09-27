# Verification
- 修改 index.html，新增 tests/analytics.test.ts 與本 change 規劃文件。
- A1 測試先因缺少 Google tag 失敗，加入後通過；驗證 async script 與 js/config 初始化順序。
- npm run preflight 通過；npm test：13 files、65 tests 通過；npm run build 通過。
- git diff --check 與 index.html diff review 通過；dist/index.html 保留指定 GA ID。
- Browser Preview 未完成：CUA 啟動發生 sandbox-exec TIOCSTI 錯誤；本機 dev server 因 EPERM 無法啟動，提權請求被使用者拒絕。
- 使用者指定 GitHub MCP / GitHub Pages，已確認遠端 darklit5941/mahjong 的既有 docs 發佈；此次提交更新 docs/index.html，部署結果另行確認。
- GA 正式收件／即時報表尚未驗證。
