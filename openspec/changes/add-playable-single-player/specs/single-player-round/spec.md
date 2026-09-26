## Purpose

提供一位真人與三位電腦共用的台灣十六張牌局流程，依已確認規則管理摸打、宣告、補牌與優先權，確保每次操作合法且牌張不會重複或遺失。

## ADDED Requirements

### Requirement: Start and turns
系統 SHALL 保留兩模式牌組與 seed 起手結果，東家為真人且先出牌，其餘各 16 張；無人認領棄牌時依東南西北輪流從牌頭摸一張再出牌。

#### Scenario: R1 Start
- **WHEN** 以 seed 1 分別啟動兩模式
- **THEN** 東家 17 張、其他各 16 張；無花牌牆剩 71 張，有花補牌遵循既有起手流程

#### Scenario: R2 Draw discard
- **WHEN** 東家打一萬，其他三家全部放棄
- **THEN** 南家從牌頭摸一張並取得出牌權，東家不得再次出牌

### Requirement: Claims and arbitration
系統 SHALL 僅允許下家吃同花色連續三張，持兩張同牌可碰、三張可明槓；有多組吃法須提供各組選擇。收齊可應對者的宣告或放棄後 SHALL 依胡＞碰／槓＞吃裁決；多家胡取從出牌者下家起最近者，不依回覆時間。吃碰後直接出牌不摸牌。

#### Scenario: R3 Chi choices
- **WHEN** 東家打三萬，南家持一二四五萬且沒有更高優先宣告
- **THEN** 南家可選一二三、二三四或三四五萬；西家不能吃，選定後移除所需兩張手牌並出牌

#### Scenario: R4 Claim priority
- **WHEN** 東家棄牌，南家宣告吃、西家宣告碰、北家宣告胡
- **THEN** 北家胡牌；若北家放棄則西家碰；先回覆吃不提前結算

#### Scenario: R5 Multiple wins
- **WHEN** 東家棄牌，西家與北家均宣告胡
- **THEN** 西家獲勝，只有一位贏家

### Requirement: Kongs and flowers
系統 SHALL 支援自己摸牌後的暗槓與加槓，明槓、暗槓及成功加槓後從牌尾補牌。加槓 SHALL 先開啟其他玩家搶胡窗口，全部放棄才由碰升為槓並補牌；暗槓不開搶胡窗口。有花模式抽到花牌 SHALL 移出並持續由牌尾補到普通牌；無花模式不補花。

#### Scenario: R6 Kong variants
- **WHEN** 玩家持四張同牌宣告暗槓，或持三張認領棄牌明槓
- **THEN** 形成四張牌的一組槓，再從尾端补一張普通牌後可出牌

#### Scenario: R7 Rob added kong
- **WHEN** 東家碰過三萬且摸到第四張後加槓，南家可用三萬胡並宣告
- **THEN** 南家搶槓胡，東家原碰保留、加槓牌歸勝利牌、不補牌；若全員放棄則完成加槓補牌

#### Scenario: R8 Repeated flowers
- **WHEN** 摸得春，尾端補得夏再補得五筒，且尚有足夠可用牌
- **THEN** 春夏進花牌區，五筒進手牌，總牌數守恆

### Requirement: Reserve and invalid actions
系統 SHALL 每次摸牌或補牌前檢查剩餘牌牆；剩餘 16 張時下一次取牌直接流局，不取保留牌。非法、過期、重複或非當事人動作 SHALL 拒絕且不改變狀態。所有區域實體牌總量 SHALL 守恆。

#### Scenario: R9 Reserve boundary
- **WHEN** 牌牆剩 17 張且摸到普通牌
- **THEN** 允許此次摸打及應對；下一次需取牌且剩 16 張時才流局

#### Scenario: R10 Replacement boundary
- **WHEN** 剩 17 張時抽到花，尚需補牌但僅剩 16 張
- **THEN** 花牌移出後流局，保留牌不被抽取

#### Scenario: R11 Invalid action
- **WHEN** 非當前玩家出牌或使用上一個應對窗口的宣告
- **THEN** 拒絕動作，牌牆、手牌、棄牌、副露及回合都不變
