## Decisions
頁首右側放外框連結按鈕，使用原生 a、target="_blank" 與 rel="noopener noreferrer"，提供另開分頁的可讀提示；窄螢幕允許頁首換行。

## Rule / Example / Question
Rule：點問題回報另開指定表單。Example：入口保留 entry.869162498=麻將 與 entry.357280224=v1.0，原頁面不導向。Question：無待決業務規則。

## Traceability
F1 → tests/ui/issue-report.test.ts 驗證網址、預填參數及新分頁設定；Browser 驗證頁首入口、焦點與窄螢幕排版。
