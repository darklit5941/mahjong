## Purpose

提供本專案已確認的一般五組一對胡牌判定，支援副露和槓的組數計算，並清楚區分自摸、放槍、搶槓及流局結果，讓完整遊戲具有可驗證的終點。

## ADDED Requirements

### Requirement: Five melds and a pair
系統 SHALL 僅以五組順子／刻子／槓加一對將判定胡牌，字牌不得組順子；已完成副露每組算一組，槓算一組，花牌不參與。不得以特殊花胡或未達五組的牌型獲勝。

#### Scenario: W1 Closed win
- **WHEN** 手牌為123萬、456萬、789筒、111條、東東東、中中
- **THEN** 判定可胡；改掉一張中且不能重組時不可胡

#### Scenario: W2 Open kong win
- **WHEN** 已副露一組槓，其餘為123萬、456萬、789筒、111條、中中
- **THEN** 判定可胡，不將槓當成兩組或要求暗手仍有17張

#### Scenario: W3 Honors and invalid counts
- **WHEN** 候選牌型含東南西作為順子，或普通牌不足以完成五組一對
- **THEN** 拒絕胡牌

### Requirement: Terminal results
系統 SHALL 在合法自摸、棄牌胡、搶加槓胡後停止牌局並顯示贏家、來源及勝利牌；流局 SHALL 顯示無贏家。不計台分，終局不能再摸打；可開新局且真人固定東家。

#### Scenario: W4 Self draw and discard win
- **WHEN** 玩家取得合法胡牌機會並選擇胡
- **THEN** 自摸標示自己摸得，放槍標示出牌者，搶槓標示加槓者；結束後拒絕出牌

#### Scenario: W5 Draw result
- **WHEN** 取牌會動用最後16張保留牌
- **THEN** 結果為流局，沒有贏家或分數；重新開局回到東家
