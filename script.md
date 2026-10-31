# script.js 說明文件

## 概述

這是手機練習網站的核心邏輯檔案，負責處理所有使用者互動、狀態管理和畫面渲染。

## 情境流程圖

```mermaid
flowchart TD
    Start[開始頁面] --> SelectScenario{選擇情境}
    
    SelectScenario -->|A| ScenA[情境 A: 餐廳掃碼點餐]
    SelectScenario -->|B| ScenB[情境 B: 櫃台付款]
    SelectScenario -->|C| ScenC[情境 C: 掃店家 QR 碼]
    SelectScenario -->|D| ScenD[情境 D: 傳送我的位置]
    SelectScenario -->|E| ScenE[情境 E: 傳送一個地址]
    SelectScenario -->|F| ScenF[情境 F: 群組接龍留名字]
    
    ScenA --> PayFlow[付款流程]
    ScenB --> PayFlow
    ScenC --> PayFlow
    
    ScenD --> LocationFlow[位置分享流程]
    ScenE --> LocationFlow
    
    ScenF --> ChainFlow[接龍流程]
    
    PayFlow --> Success[成功畫面]
    LocationFlow --> Success
    ChainFlow --> Success
    
    Success --> Restart{再次練習?}
    Restart -->|是| SelectScenario
    Restart -->|否| Start
```

## 情境 F 詳細流程（13 步驟，含獨立換行步驟）

```mermaid
sequenceDiagram
    participant U as 使用者
    participant S as 系統
    participant G as 群組聊天
    
    U->>S: 開啟情境 F
    S->>U: 顯示手機桌面
    
    U->>S: 點擊 LINE 圖示
    S->>U: 顯示 LINE 主頁
    
    U->>S: 點擊「聊天」標籤
    S->>U: 顯示聊天列表
    
    U->>S: 點擊「社區團購群」
    S->>G: 進入群組聊天室
    G->>U: 顯示忙碌對話與接龍訊息
    
    U->>G: 長按最新接龍訊息
    G->>U: 顯示複製選單
    
    U->>G: 點擊「複製」
    G->>S: 儲存接龍文字到 chainCopied
    S->>U: 回到聊天室，顯示輸入框
    
    U->>S: 點擊輸入框
    S->>U: 展開輸入框並顯示鍵盤
    
    U->>S: 長按輸入框
    S->>U: 顯示貼上按鈕（綠色）
    
    U->>S: 點擊「貼上」
    S->>U: 接龍文字出現，游標閃爍在結尾
    Note over U,S: 游標視覺化：綠色 | 閃爍
    
    U->>S: 點擊「換行 ↵」按鈕（藍色）
    S->>U: 游標跳到新行
    Note over U,S: 新增獨立步驟：按換行鍵
    
    U->>S: 點擊「11.」按鈕
    S->>U: 新增「11. 」到輸入框
    Note over U,S: 分步輸入：先輸序號
    
    U->>S: 點擊「小蓉」按鈕
    S->>U: 新增「小蓉」到輸入框
    Note over U,S: 分步輸入：再輸名字
    
    U->>S: 點擊傳送按鈕
    S->>G: 新訊息加入群組
    G->>U: 顯示包含「11. 小蓉」的新接龍訊息
    
    S->>U: 顯示成功畫面 🎉
```

## 狀態管理

```mermaid
classDiagram
    class State {
        +string scn
        +number idx
        +boolean hints
        +boolean autoSpeak
        +object cart
        +string pin
        +string amt
        +boolean busy
        +boolean locationSent
        +string locAddr
        +string searchText
        +string chainCopied
        +boolean chainSent
    }
    
    class Scenario {
        +string name
        +Array~Step~ steps
    }
    
    class Step {
        +string screen
        +string target
        +string say
        +function check()
        +function enter()
        +number delay
        +boolean final
    }
    
    State "1" --> "0..1" Scenario : 當前情境
    Scenario "1" --> "*" Step : 包含步驟
    State --> Step : 當前步驟 idx
```

## 畫面組件架構

```mermaid
graph TB
    subgraph "核心畫面"
        Home[home: 手機桌面]
        LineHome[lineHome: LINE 主頁]
        LineChat[lineChat: 聊天列表]
        PayHome[payHome: LINE Pay 主頁]
    end
    
    subgraph "付款相關"
        Menu[menu: 點菜畫面]
        Checkout[checkout: 結帳確認]
        Camera[camera*: 掃描畫面]
        Confirm[confirm: 付款確認]
        Pin[pin: 輸入密碼]
        Amount[amount: 輸入金額]
        PayCode[payCode: 付款碼]
        Success[success: 成功畫面]
    end
    
    subgraph "位置分享"
        ChatRoom[chatRoom: 一般聊天室]
        ChatMenu[chatMenu: 選單彈窗]
        LocPerm[locationPermission: 權限請求]
        LocMap[locationMap: 地圖畫面]
        LocSearch[locationSearch: 地點搜尋]
    end
    
    subgraph "群組接龍 (新增)"
        GroupChat[groupChat: 群組聊天室]
        CopyMenu[copyMenu: 複製選單]
        GroupInput[groupChatInput: 輸入框+鍵盤]
    end
    
    Home --> LineHome
    LineHome --> LineChat
    LineHome --> PayHome
    LineChat --> ChatRoom
    LineChat --> GroupChat
    
    PayHome --> Camera
    Menu --> Checkout
    Checkout --> Confirm
    Confirm --> Pin
    Pin --> Success
    
    ChatRoom --> ChatMenu
    ChatMenu --> LocPerm
    LocPerm --> LocMap
    LocMap --> LocSearch
    LocMap --> ChatRoom
    
    GroupChat --> CopyMenu
    CopyMenu --> GroupInput
    GroupInput --> GroupChat
```

## 事件處理流程

```mermaid
flowchart TD
    Click[使用者點擊] --> CheckScenario{有情境?}
    CheckScenario -->|否| Ignore[忽略]
    CheckScenario -->|是| CheckAction{是操作?}
    
    CheckAction -->|是| Action[執行 ACTIONS]
    CheckAction -->|否| CheckTarget{是目標?}
    
    Action --> Render[重新渲染]
    
    CheckTarget -->|是| CheckBusy{忙碌中?}
    CheckTarget -->|否| CheckWrong{有錯誤訊息?}
    
    CheckBusy -->|是| Ignore
    CheckBusy -->|否| Success[成功處理]
    
    Success --> CheckDelay{有延遲?}
    CheckDelay -->|是| ShowScanning[顯示掃描動畫]
    CheckDelay -->|否| ShowToast[顯示提示]
    
    ShowScanning --> NextStep[下一步]
    ShowToast --> NextStep
    
    CheckWrong -->|是| Wrong[顯示錯誤提示]
    CheckWrong -->|否| CheckNeutral{中立區域?}
    
    CheckNeutral -->|是| Ignore
    CheckNeutral -->|否| Wrong
    
    Wrong --> ApplyGlow{提示開啟?}
    ApplyGlow -->|否| TempGlow[暫時發光 4 秒]
    ApplyGlow -->|是| Ignore
```

## 資料結構

### 配置常數

```javascript
// LINE Pay 付款情境
const MENU = [餐點列表]
const REST = '幸福小館'
const SHOP_B = '好味便當'
const SHOP_C = '巷口豆漿店'

// 接龍情境配置（可修改）
const CHAIN_USER_NAME = '小蓉'
const CHAIN_INITIAL = '【團購】臺南愛文芒果 要的請接龍\n1. 美玲\n2. 阿芳\n...'
```

### 情境定義

每個情境包含：
- `name`: 情境名稱
- `steps`: 步驟陣列

每個步驟包含：
- `screen`: 要顯示的畫面名稱
- `target`: 正確的點擊目標 (data-t 屬性)
- `say`: 指引文字（可以是函數）
- `check`: 檢查函數（可選）
- `enter`: 進入步驟時執行（可選）
- `delay`: 延遲時間（可選）
- `final`: 是否為最後一步（可選）

## 核心函數

```mermaid
classDiagram
    class RenderSystem {
        +render(keepScroll)
        +applyGlow(on)
    }
    
    class NavigationSystem {
        +go(index)
        +next()
        +success()
        +wrong(target)
    }
    
    class ActionSystem {
        +add(button)
        +minus(button)
        +pin(button)
        +amt(button)
        +type(button)
    }
    
    class UISystem {
        +toast(msg, good)
        +speak()
    }
    
    class ScenarioSystem {
        +startScenario(key)
        +step()
        +steps()
    }
    
    RenderSystem --> ScenarioSystem
    NavigationSystem --> RenderSystem
    NavigationSystem --> UISystem
    ActionSystem --> RenderSystem
```

## 群組接龍特殊邏輯

### 複製貼上換行機制（含獨立換行步驟）

```mermaid
stateDiagram-v2
    [*] --> 群組聊天: 進入群組
    
    群組聊天 --> 長按訊息: 長按最新接龍
    長按訊息 --> 複製選單: 顯示選單
    複製選單 --> 已複製: 點擊「複製」
    
    已複製 --> 輸入框: chainCopied = CHAIN_INITIAL
    輸入框 --> 長按輸入框: 展開鍵盤
    長按輸入框 --> 貼上: 顯示貼上按鈕（綠色）
    
    貼上 --> 顯示游標: 文字出現，游標閃爍
    note right of 顯示游標
        游標在文字結尾
        綠色 | 閃爍動畫
    end note
    
    顯示游標 --> 按換行: 點擊「換行 ↵」（藍色）
    note right of 按換行
        獨立步驟
        使用者難點
    end note
    
    按換行 --> 新行游標: chainCopied += "\n"
    新行游標 --> 輸入序號: 點擊「11.」
    輸入序號 --> 序號完成: chainCopied += "11. "
    
    序號完成 --> 輸入名字: 點擊「小蓉」
    輸入名字 --> 完成輸入: chainCopied += "小蓉"
    
    完成輸入 --> 傳送: 點擊傳送
    傳送 --> 群組聊天: chainSent = true
    群組聊天 --> 成功: 顯示新訊息
    成功 --> [*]
```

### 動態鍵盤顯示邏輯

```mermaid
stateDiagram-v2
    [*] --> 初始鍵盤: 進入輸入畫面
    
    state 初始鍵盤 {
        [*] --> 注音鍵盤
        注音鍵盤 --> 綠色貼上鍵: 下排左側
        綠色貼上鍵 --> 灰色換行鍵: 下排右側（未啟用）
    }
    
    初始鍵盤 --> 換行鍵盤: 貼上後
    
    state 換行鍵盤 {
        [*] --> 注音鍵盤2
        注音鍵盤2 --> 灰色空白鍵: 下排左側
        灰色空白鍵 --> 藍色換行鍵: 下排右側（高亮）
        note right of 藍色換行鍵
            「換行 ↵」
            清晰可見
        end note
    }
    
    換行鍵盤 --> 序號鍵盤: 按換行後
    
    state 序號鍵盤 {
        [*] --> 11點按鈕: 大按鈕
        11點按鈕 --> 小蓉按鈕: 灰色（未啟用）
    }
    
    序號鍵盤 --> 名字鍵盤: 按「11.」後
    
    state 名字鍵盤 {
        [*] --> 11點按鈕灰: 灰色（已完成）
        11點按鈕灰 --> 小蓉按鈕高亮: 大按鈕（高亮）
    }
    
    名字鍵盤 --> 完成鍵盤: 按「小蓉」後
    
    state 完成鍵盤 {
        [*] --> 簡化顯示: 「完成輸入」
    }
    
    完成鍵盤 --> [*]: 傳送
```

## 響應式設計

### 行動端適配

```mermaid
graph LR
    Desktop[桌面版<br/>max-width > 600px] -->|顯示| Full[完整模擬手機<br/>含狀態列/導航列<br/>圓角邊框]
    Mobile[行動版<br/>max-width ≤ 600px] -->|隱藏| Mini[全螢幕顯示<br/>移除狀態列/導航列<br/>無圓角]
    
    Full --> Layout1[固定尺寸<br/>aspect-ratio 9/19.5]
    Mini --> Layout2[100dvh flexbox<br/>topbar + practice flex]
```

### 布局結構

```mermaid
graph TB
    Body[body: flex column 100dvh]
    Body --> TopBar[.topbar: flex 0 0 auto 32px]
    Body --> Start[.start: flex 1 auto]
    Body --> Practice[.practice: flex 1 auto]
    
    Practice --> Guide[.guide: flex 0 0 auto]
    Practice --> PhoneWrap[.phone-wrap: flex 1 minmax 0]
    Practice --> Controls[.controls: flex 0 0 auto 48px]
    
    PhoneWrap --> Phone[.phone 100% 高度]
    Phone --> Screen[.screen 畫面內容]
    
    Screen --> Scroll[.scroll 可捲動區域]
```

## 修改指南

### 如何新增情境

1. 在 `SCENARIOS` 物件中新增情境定義
2. 定義 `steps` 陣列，每步包含 `screen`、`target`、`say`
3. 在 `SCREENS` 物件中實作需要的畫面函數
4. 在 `index.html` 中新增情境卡片
5. 更新 `README.md` 文件

### 如何修改使用者名稱

只需修改一個常數：

```javascript
const CHAIN_USER_NAME = '您的名字';
```

### 如何新增類似的換行步驟

參考情境 F 的實作方式：

1. **在步驟定義中拆分動作**：
```javascript
{ screen: 'input', target: 'paste-btn', say: '按貼上' },
{ screen: 'input', target: 'newline-btn', say: '按換行鍵' },  // 獨立步驟
{ screen: 'input', target: 'type-text', say: '輸入文字' }
```

2. **根據 target 顯示不同鍵盤**：
```javascript
if (st.target === 'newline-btn') {
  keyboard = `<button class="enter-key" data-t="newline-btn">換行 ↵</button>`;
}
```

3. **顯示游標提示**：
```javascript
const showCursor = st.target === 'newline-btn';
const displayText = text + (showCursor ? '<span class="cursor">|</span>' : '');
```

### 如何調整接龍初始內容

修改 `CHAIN_INITIAL` 常數：

```javascript
const CHAIN_INITIAL = [
  '【團購】您的商品名稱',
  '1. 名字一',
  '2. 名字二',
  // ... 更多名字
].join('\n');
```

## 維護注意事項

1. **無捲軸保證**：確保所有步驟在 360×640、390×700、412×760、1280×800 視窗都能完整顯示
2. **提示機制**：所有可點擊元素都要有 `data-t`（正確）或 `data-wrong`（錯誤）屬性
3. **語音朗讀**：`say` 文字要避免 HTML 標籤，使用 `plain()` 函數清理
4. **狀態重置**：新增情境時記得在 `startScenario()` 中重置相關狀態
5. **行動端優先**：先確保行動端正確，再考慮桌面版顯示
