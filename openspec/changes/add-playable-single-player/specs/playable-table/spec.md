## Purpose

將起手展示轉為可操作單機牌桌，讓真人看見自己的牌和公共資訊並選擇合法動作，清楚理解目前輪次、應對窗口與終局結果，同時維持手機及鍵盤可用。

## ADDED Requirements

### Requirement: Private table and actions
介面 SHALL 顯示真人手牌、各家棄牌與公開副露、花牌、當前座位、規則及剩餘牌數。對手暗手 SHALL 僅顯示牌背與張數，不在 DOM 文字或屬性洩漏牌面；暗槓對非持有人只顯示暗槓標記。只允許真人合法動作，提供出牌、吃組選擇、碰、槓、胡與放棄。

#### Scenario: U1 Hidden table
- **WHEN** 啟動兩種模式的新局
- **THEN** 真人可選自己牌出牌；三家暗手不顯牌面，無花區提示不使用花牌

#### Scenario: U2 Response controls
- **WHEN** 真人有兩組合法吃法且尚未決定
- **THEN** 提供兩組牌面選項與放棄，選定後只送出一次宣告；其他不合法動作不可用

### Requirement: Restart and feedback
介面 SHALL 保留唯讀 Seed 顯示與有花開關；每次開局自動產生正整數 uint32 Seed，同一頁面遊玩期間不得重複。切換立即重開，取消舊互動。終局 SHALL 明確顯示結果與再玩一局入口。

#### Scenario: U3 Restart
- **WHEN** 電腦思考或真人應對時切換有效模式
- **THEN** 清除舊選牌與排程，以新模式及 seed 開局，東家先出牌

#### Scenario: U4 Automatic seed
- **WHEN** 首次載入、開始新牌局、切換模式或終局再玩
- **THEN** 自動產生新的 Seed 並僅顯示於狀態列，不提供輸入；即使亂數碰撞也不得重用同頁面已用 Seed

#### Scenario: U5 Result screen
- **WHEN** 一局自摸、放槍、搶槓胡或流局
- **THEN** 顯示對應結果與再玩入口，不再顯示可進行的摸打按鈕

### Requirement: Accessible interaction
介面 SHALL 在320px和桌面寬度可操作，無水平溢位；牌與動作控制可由Tab及Enter或Space操作，具可讀名稱與焦點。

#### Scenario: U6 Keyboard and mobile
- **WHEN** 以320px及1280px視窗使用鍵盤選牌、出牌、放棄和重開
- **THEN** 控制項可達、焦點可見，牌面不遮擋，狀態更新可讀

### Requirement: Separate drawn tile
摸牌後待出牌時，介面 SHALL 將本次摸入的實體牌獨立顯示於排序手牌右側；出牌後才將留下的牌併回手牌。補花與槓後補牌適用相同行為；吃碰後不得誤標摸牌。

#### Scenario: U7 Draw and keep or discard
- **WHEN** 真人摸入一張牌（含補花或槓後補牌）
- **THEN** 該牌獨立顯示且可出牌；打出舊牌後，保留的新牌併入排序；直接打出新牌則舊手牌不變

#### Scenario: U8 No false draw or private information
- **WHEN** 吃碰後待出牌、應對窗口、終局或查看對手
- **THEN** 不顯示獨立摸牌；對手摸牌身分不包含在投影中

### Requirement: Traditional tile artwork
公開牌面 SHALL 使用傳統花色圖案並保留可讀牌名，所有尺寸共用一致圖案。

#### Scenario: U9 Recognizable artwork
- **WHEN** 顯示手牌、副露、棄牌、待應對牌或花牌
- **THEN** 筒以對應數量圓圈、索以竹節且一索以鳥、萬以數字加紅萬、字牌以風字/紅中/綠發/藍框白板呈現，花牌具有植物圖案；隱藏牌仍為牌背，鍵盤出牌維持可用

#### Scenario: U10 Seven dots layout
- **WHEN** 顯示七筒 D7
- **THEN** 上方三顆紅筒由左上至右下斜排，下方四顆藍筒呈方形排列，七索不受影響

#### Scenario: U11 Eight dots colors
- **WHEN** 顯示八筒 D8
- **THEN** 八顆圓筒均為深藍色，兩欄四列排列維持不變

#### Scenario: U12 Eight bamboo layout
- **WHEN** 顯示八條 B8
- **THEN** 八根綠色竹節分上下兩組，各四根，每組左右外側直立，中間兩根斜接：上組 ∧、下組 ∨

#### Scenario: U13 Seven bamboo reference layout
- **WHEN** 顯示七條 B7
- **THEN** 上方中央一根紅色直立竹節，下方兩排各三根綠色直立竹節，形成 1＋3＋3 排列

#### Scenario: U14 Reference flower artwork
- **WHEN** 顯示春夏秋冬梅蘭竹菊
- **THEN** 使用指定參考 SVG 的配色、植物圖案與書法字，等比例顯示；F7 為竹、F8 為菊，素材隨程式本機打包，保留可讀牌名並提供來源授權資訊
