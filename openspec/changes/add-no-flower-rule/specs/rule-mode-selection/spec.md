## Purpose

讓使用者在台灣十六張起手牌練習中選擇有花或無花規則，確保牌組、補花、手牌張數與介面狀態一致，並以相同模式及 seed 重現牌局供比較與驗收。

## ADDED Requirements

### Requirement: Rule-specific wall composition
系統 SHALL 依模式建立牌牆；普通牌共 34 種、每種 4 張。有花模式另含八種花牌各一張；無花模式 SHALL 排除所有花牌。

#### Scenario: E1 Flowers wall
- **WHEN** 使用有花模式與 seed 42 建立牌牆
- **THEN** 共 144 張，普通牌每種 4 張，八種花牌各 1 張

#### Scenario: E2 No flowers wall
- **WHEN** 使用無花模式與 seed 42 建立牌牆
- **THEN** 共 136 張，普通牌每種 4 張，花牌為 0 張

### Requirement: Initial hands and replacement
系統 SHALL 在兩種模式均發給東家 17 張普通牌、其他三家各 16 張。有花模式 SHALL 保留既有逐家發牌及遇花立即由牌尾連續補到普通牌的簡化流程；只有抽到的花牌移入花牌區。無花模式 SHALL 不執行補花。

#### Scenario: E3 Flowers initial deal
- **WHEN** 使用有花模式與 seed 1 開局
- **THEN** 四家普通手牌張數依序為 17、16、16、16，花牌區至少有一張花牌，普通手牌沒有花牌
- **AND** 普通手牌總數＋花牌區總數＋剩餘牌牆張數等於 144

#### Scenario: E4 No flowers initial deal
- **WHEN** 使用無花模式與 seed 1 開局
- **THEN** 四家普通手牌張數依序為 17、16、16、16，全部花牌區為空，牌牆剩餘 71 張，牌局模式為無花

### Requirement: Reproducibility and compatibility
系統 SHALL 在相同模式與 seed 下產生相同完整牌局；省略模式時 SHALL 保持原有有花模式結果。

#### Scenario: E5 Repeated rounds
- **WHEN** 分別以兩種模式各重複使用 seed 1234 開局
- **THEN** 同模式的兩次完整牌局相同；不要求跨模式牌序相同

#### Scenario: E6 Default compatibility
- **WHEN** 使用 seed 20260915 且未指定模式開局
- **THEN** 結果與明確指定有花模式相同，並保留變更前相同 seed 的牌局結果

### Requirement: Accessible rule switch and consistent rendering
介面 SHALL 提供有可見標籤「使用花牌」的鍵盤可操作開關，預設開啟。有效 seed 下切換 SHALL 立即以輸入欄的 seed 重新開局；開始新牌局按鈕 SHALL 使用目前模式。規則名稱、說明、四家手牌、花牌區、剩餘牌牆、seed 與驗證狀態 SHALL 同步對應新牌局。無花模式 SHALL 明確顯示未使用花牌。

#### Scenario: E7 Initial page
- **WHEN** 首次載入頁面
- **THEN** 開關開啟，顯示有花規則與 seed 20260915 的有效牌局

#### Scenario: E8 Switch both directions
- **WHEN** 輸入 seed 1 並關閉開關
- **THEN** 不需另按按鈕即顯示無花牌局、71 張剩餘牌牆與四個空花牌區，說明不再描述正在補花
- **WHEN** 再次開啟開關
- **THEN** 顯示有花規則與 seed 1 的有花牌局，不殘留無花狀態

#### Scenario: E9 Submit selected mode
- **WHEN** 在無花模式輸入 seed 1234 並按開始新牌局
- **THEN** 顯示 seed 1234 的無花牌局，再次提交結果相同

#### Scenario: E10 Keyboard operation
- **WHEN** 使用 Tab 將焦點移到開關並按空白鍵
- **THEN** 焦點清楚可見，模式切換且牌局更新，輔助技術可取得標籤與開關狀態

### Requirement: Invalid seed does not desynchronize mode
空白、非有限數值、非整數或小於 1 的 seed SHALL 阻止重新開局並顯示錯誤；切換失敗 SHALL 將開關恢復到目前牌局模式，保留目前牌局資料。

#### Scenario: E11 Invalid seed on switch
- **WHEN** 已顯示有花牌局，輸入空白、0 或 1.5 後嘗試關閉開關
- **THEN** 顯示 seed 錯誤，開關仍開啟，原有花牌局與 seed 保留
- **WHEN** 改成 seed 1 再關閉開關
- **THEN** 成功建立無花牌局且清除錯誤
