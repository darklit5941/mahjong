# Design
在 index.html head 加入使用者提供的 async gtag.js 與初始化程式，Vite build 保留標籤。
Rule：每次載入 HTML 初始化一次指定 measurement ID。
Example：開啟頁面後 dataLayer 依序含 js 與 config G-7ENQ4BFR7C。
Question：無。沿用 darklit5941/mahjong 的 main/docs 發佈。
追溯：A1 → tests/analytics.test.ts（初始化執行）與 Browser Preview（畫面載入）。正式收件需部署後以 GA 即時報表確認。
