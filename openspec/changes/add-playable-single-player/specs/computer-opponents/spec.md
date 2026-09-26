## Purpose

讓南西北三個座位由電腦自動選擇合法操作，僅依自己的手牌及公開資訊決策，能與真人交替進行完整牌局，同時保留可重現性以利測試與問題追查。

## ADDED Requirements

### Requirement: Legal deterministic policy
電腦 SHALL 僅使用自己的私有資訊及公開資訊，從合法動作中選擇；相同觀察及決策 seed SHALL 得相同選擇。可胡時選胡，其餘策略可簡單但不讀其他暗手或未摸牌序。

#### Scenario: B1 Legal choice
- **WHEN** 電腦取得合法動作集合且包含胡牌
- **THEN** 選擇胡；不包含胡時選集合內動作，相同輸入重跑結果相同

#### Scenario: B2 Hidden information
- **WHEN** 只變更電腦看不到的其他暗手與牌序，其可見資訊和合法動作不變
- **THEN** 電腦選擇不變

### Requirement: Automatic progression
系統 SHALL 自動處理電腦回合及應對，不需真人代按；真人有待選動作時 SHALL 等待真人，不跳過宣告機會。新局或終局 SHALL 取消舊排程。

#### Scenario: B3 Wait for human
- **WHEN** 電腦棄牌讓東家可碰
- **THEN** 保留應對窗口直到真人選碰或放棄，之後再續行

#### Scenario: B4 Stale timer
- **WHEN** 電腦動作排程後使用者重新開局
- **THEN** 舊排程不得改動新牌局，無重複出牌
