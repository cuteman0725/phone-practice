# script.js - 腳本邏輯文件

## 檔案說明

此檔案包含 LINE Pay 練習網站的所有互動邏輯，包括步驟控制、事件處理、語音朗讀等功能。

## 系統架構圖

```mermaid
graph TD
    Main[主程式 IIFE] --> Utils[工具函數]
    Main --> Data[資料定義]
    Main --> Screens[畫面渲染]
    Main --> Logic[業務邏輯]
    Main --> Events[事件處理]
    
    Utils --> Dollar["$ 選擇器"]
    Utils --> Store["localStorage 封裝"]
    Utils --> Money[金額格式化]
    Utils --> QRGen[QR 碼生成]
    Utils --> Barcode[條碼生成]
    
    Data --> Menu[菜單資料]
    Data --> Scenarios[情境定義]
    Data --> State[狀態管理]
    Data --> Icons[SVG 圖示]
    
    Screens --> HomeScreen[手機主畫面]
    Screens --> LineScreens[LINE 相關畫面]
    Screens --> PayScreens[付款畫面]
    
    Logic --> Navigation[步驟導航]
    Logic --> Validation[操作驗證]
    Logic --> Speech[語音朗讀]
    Logic --> Toast[提示訊息]
    
    Events --> Click[點擊事件]
    Events --> Control[控制按鈕]
    Events --> Settings[設定切換]
```

## 類別結構圖

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
    }
    
    class Scenario {
        +string name
        +Step[] steps
    }
    
    class Step {
        +string screen
        +string target
        +string glow
        +function say
        +function check
        +function enter
        +number delay
        +boolean final
    }
    
    class Screen {
        +function home()
        +function lineHome()
        +function wallet()
        +function payHome()
        +function camera()
        +function menu()
        +function checkout()
        +function confirm()
        +function pin()
        +function amount()
        +function payCode()
        +function success()
    }
    
    class Actions {
        +function add()
        +function minus()
        +function pin()
        +function amt()
    }
    
    State --> Scenario
    Scenario --> Step
    Screen ..> State
    Actions ..> State
```

## 執行流程圖

```mermaid
flowchart TD
    Start[頁面載入] --> Init[初始化]
    Init --> LoadState[載入儲存狀態]
    LoadState --> BindEvents[綁定事件]
    BindEvents --> CheckHash[檢查 URL Hash]
    
    CheckHash -->|有情境| StartScenario[開始情境]
    CheckHash -->|無| ShowMenu[顯示選單]
    
    ShowMenu --> WaitUser[等待使用者選擇]
    WaitUser --> SelectScenario[選擇情境]
    SelectScenario --> StartScenario
    
    StartScenario --> InitScenario[初始化情境]
    InitScenario --> ShowStep[顯示步驟]
    ShowStep --> ApplyGlow[套用發光效果]
    ApplyGlow --> AutoSpeak{自動朗讀?}
    
    AutoSpeak -->|是| Speak[語音朗讀]
    AutoSpeak -->|否| WaitClick
    Speak --> WaitClick[等待點擊]
    
    WaitClick --> UserClick[使用者點擊]
    UserClick --> CheckTarget{檢查目標}
    
    CheckTarget -->|正確| Success[顯示成功]
    CheckTarget -->|錯誤| Wrong[顯示錯誤提示]
    
    Wrong --> WaitClick
    Success --> CheckFinal{最後一步?}
    
    CheckFinal -->|否| NextStep[下一步]
    CheckFinal -->|是| Complete[完成]
    
    NextStep --> ShowStep
    Complete --> ShowDone[顯示完成畫面]
    ShowDone --> WaitAction[等待再次操作]
    
    WaitAction -->|再練一次| StartScenario
    WaitAction -->|練習別的| ShowMenu
```

## 狀態管理圖

```mermaid
stateDiagram-v2
    [*] --> 初始化
    初始化 --> 選單頁: 載入完成
    
    state 選單頁 {
        [*] --> 等待選擇
        等待選擇 --> 情境A: 點擊情境A
        等待選擇 --> 情境B: 點擊情境B
        等待選擇 --> 情境C: 點擊情境C
    }
    
    選單頁 --> 練習中: 開始情境
    
    state 練習中 {
        [*] --> 顯示步驟
        顯示步驟 --> 等待操作
        等待操作 --> 驗證操作
        
        驗證操作 --> 正確: 操作正確
        驗證操作 --> 錯誤: 操作錯誤
        
        錯誤 --> 顯示提示
        顯示提示 --> 等待操作
        
        正確 --> 檢查進度
        檢查進度 --> 顯示步驟: 還有步驟
        檢查進度 --> 完成: 全部完成
    }
    
    練習中 --> 選單頁: 返回選單
    完成 --> 練習中: 再練一次
    完成 --> 選單頁: 練習別的
```

## 事件處理流程

```mermaid
sequenceDiagram
    participant U as 使用者
    participant D as DOM
    participant E as 事件處理器
    participant S as 狀態
    participant R as 渲染器
    
    U->>D: 點擊元素
    D->>E: 觸發 click 事件
    E->>E: 檢查點擊目標
    
    alt 特殊操作 (add/minus/pin/amt)
        E->>S: 更新狀態
        S->>R: 重新渲染
        R->>D: 更新 DOM
    else 目標按鈕
        E->>E: 驗證是否正確
        alt 正確
            E->>S: 設置 busy 狀態
            E->>D: 顯示成功提示
            Note over E: 延遲 250ms
            E->>S: 增加 idx
            S->>R: 渲染下一步
        else 錯誤
            E->>D: 顯示錯誤提示
            E->>D: 暫時發光
        end
    else 其他區域
        E->>D: 顯示通用提示
    end
    
    R->>D: 更新完成
    D->>U: 顯示新畫面
```

## 資料流向圖

```mermaid
graph LR
    LocalStorage[(localStorage)] -->|載入| State[狀態物件 S]
    State -->|hints| HintBtn[提示按鈕]
    State -->|autoSpeak| SpeakBtn[朗讀按鈕]
    State -->|cart| Menu[菜單顯示]
    State -->|pin| PinDots[密碼點點]
    State -->|amt| AmtDisplay[金額顯示]
    
    HintBtn -->|切換| State
    SpeakBtn -->|切換| State
    Menu -->|add/minus| State
    PinDots -->|輸入| State
    AmtDisplay -->|輸入| State
    
    State -->|儲存| LocalStorage
    
    style State fill:#e1f5e1
    style LocalStorage fill:#fce4ec
```

## 語音朗讀流程

```mermaid
flowchart TD
    Start[呼叫 speak] --> CheckSupport{支援語音?}
    
    CheckSupport -->|否| ShowError[顯示不支援訊息]
    CheckSupport -->|是| GetText[取得說明文字]
    
    GetText --> CleanText[清除 HTML 標籤]
    CleanText --> CreateUtterance[建立 SpeechSynthesisUtterance]
    
    CreateUtterance --> CheckVoice{有中文語音?}
    CheckVoice -->|是| SetVoice[設定中文語音]
    CheckVoice -->|否| UseDefault[使用預設語音]
    
    SetVoice --> SetParams[設定參數]
    UseDefault --> SetParams
    
    SetParams --> CancelPrev[取消先前朗讀]
    CancelPrev --> Speak[開始朗讀]
    
    Speak --> End[完成]
    ShowError --> End
```

## QR 碼生成演算法

```mermaid
flowchart TD
    Start[fakeQR 函數] --> InitParams[初始化參數<br/>N=25, seed]
    InitParams --> CreateRandom[建立偽隨機函數]
    CreateRandom --> GenFinder[生成定位圖案]
    
    GenFinder --> LoopStart{遍歷 25x25}
    LoopStart --> CheckPos{在定位圖案內?}
    
    CheckPos -->|是| Skip[跳過]
    CheckPos -->|否| RandCheck{random > 0.52?}
    
    RandCheck -->|是| AddRect[加入黑色方塊]
    RandCheck -->|否| Skip
    
    AddRect --> LoopStart
    Skip --> LoopStart
    
    LoopStart -->|完成| BuildSVG[組合 SVG]
    BuildSVG --> Return[返回 SVG 字串]
```

## 購物車邏輯

```mermaid
stateDiagram-v2
    [*] --> 空購物車
    
    空購物車 --> 有商品: add(商品)
    有商品 --> 有商品: add(商品)
    有商品 --> 有商品: minus(商品)
    有商品 --> 空購物車: minus(最後商品)
    
    state 有商品 {
        [*] --> 計算總數
        計算總數 --> 顯示總額
        顯示總額 --> 啟用結帳
    }
    
    state 空購物車 {
        [*] --> 總額為0
        總額為0 --> 停用結帳
    }
```

## PIN 碼輸入流程

```mermaid
sequenceDiagram
    participant U as 使用者
    participant K as 鍵盤
    participant S as 狀態
    participant D as 顯示
    participant N as 導航
    
    Note over S: pin = ""
    
    loop 輸入 PIN
        U->>K: 按數字鍵
        K->>S: pin += digit
        S->>D: 更新點點顯示
        D->>U: 顯示填充點點
    end
    
    S->>S: 檢查長度
    
    alt pin.length < 6
        Note over S: 繼續等待輸入
    else pin.length === 6
        S->>S: 設置 busy
        S->>D: 顯示成功提示
        Note over S: 延遲 700ms
        S->>N: 進入下一步
        N->>D: 顯示下個畫面
    end
```

## 錯誤處理機制

```mermaid
graph TD
    Error[使用者點擊錯誤] --> CheckWrong{有 data-wrong?}
    
    CheckWrong -->|是| ShowCustom[顯示自訂訊息]
    CheckWrong -->|否| ShowDefault[顯示預設訊息]
    
    ShowCustom --> CheckHints{提示開啟?}
    ShowDefault --> CheckHints
    
    CheckHints -->|是| Already[已顯示發光]
    CheckHints -->|否| TempGlow[暫時發光 4 秒]
    
    TempGlow --> Toast[顯示 Toast]
    Already --> Toast
    
    Toast --> Wait[等待 3.5 秒]
    Wait --> Hide[隱藏 Toast]
```

## 關鍵函數說明

### render()
渲染當前步驟，更新所有 UI 元素

```mermaid
graph LR
    render --> GetStep[取得當前步驟]
    GetStep --> UpdateScreen[更新畫面內容]
    UpdateScreen --> UpdateProgress[更新進度條]
    UpdateProgress --> UpdateInstr[更新說明文字]
    UpdateInstr --> ApplyGlow[套用發光效果]
```

### go(index)
導航到指定步驟

```mermaid
graph LR
    go --> ClampIndex[限制索引範圍]
    ClampIndex --> RunEnter[執行 enter 函數]
    RunEnter --> ClearBusy[清除忙碌狀態]
    ClearBusy --> Render[渲染畫面]
    Render --> CheckAutoSpeak{自動朗讀?}
    CheckAutoSpeak -->|是| Speak[朗讀]
    CheckAutoSpeak -->|否| End[完成]
```

### success()
處理正確操作

```mermaid
graph LR
    success --> CheckBusy{正在處理?}
    CheckBusy -->|是| Return[直接返回]
    CheckBusy -->|否| Validate[驗證條件]
    Validate --> CheckDelay{有延遲?}
    CheckDelay -->|是| ShowScanning[顯示掃描動畫]
    CheckDelay -->|否| ShowToast[顯示成功提示]
    ShowScanning --> Next[下一步]
    ShowToast --> Next
```

## 效能優化

- 使用事件委派 (Event Delegation)
- 最小化 DOM 操作
- 適當使用 debounce (localStorage)
- 避免記憶體洩漏 (取消語音)
