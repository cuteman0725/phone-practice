# index.html - 網頁結構文件

## 檔案說明

此檔案是 LINE Pay 練習網站的主要 HTML 結構文件。

## 流程圖

```mermaid
flowchart TD
    Start[使用者開啟網頁] --> LoadPage[載入 index.html]
    LoadPage --> DisplayMenu[顯示選單畫面]
    DisplayMenu --> SelectScenario{選擇練習情境}
    
    SelectScenario -->|情境 A| ScenarioA[餐廳掃碼點餐]
    SelectScenario -->|情境 B| ScenarioB[櫃台付款]
    SelectScenario -->|情境 C| ScenarioC[掃店家 QR 碼]
    
    ScenarioA --> ShowPhone[顯示模擬手機]
    ScenarioB --> ShowPhone
    ScenarioC --> ShowPhone
    
    ShowPhone --> StepByStep[逐步引導]
    StepByStep --> CheckAction{使用者操作}
    
    CheckAction -->|正確| NextStep[下一步]
    CheckAction -->|錯誤| ShowHint[顯示提示]
    ShowHint --> CheckAction
    
    NextStep --> MoreSteps{還有步驟?}
    MoreSteps -->|是| StepByStep
    MoreSteps -->|否| Complete[完成練習]
    
    Complete --> Again{再練一次?}
    Again -->|是| ShowPhone
    Again -->|否| DisplayMenu
```

## 使用案例圖

```mermaid
graph LR
    User[長輩使用者] -->|選擇練習| System[練習系統]
    User -->|點擊按鈕| System
    User -->|開關提示| System
    User -->|語音朗讀| System
    
    System -->|顯示步驟| User
    System -->|發亮提示| User
    System -->|錯誤回饋| User
    System -->|完成訊息| User
```

## 組件結構圖

```mermaid
classDiagram
    class MainPage {
        +header.topbar
        +main#start
        +main#practice
        +script
    }
    
    class TopBar {
        +div.brand
        +div.badge
        +button#btnMenu
    }
    
    class StartScreen {
        +h1
        +p.lead
        +div.cards
        +div.settings
        +div.safety
    }
    
    class PracticeScreen {
        +section.guide
        +section.phone-wrap
        +nav.controls
    }
    
    class PhoneSimulator {
        +div.statusbar
        +div.screen
        +div.toast
        +div.navbar
    }
    
    class Controls {
        +button#btnPrev
        +button#btnRestart
        +button#btnHint
        +button#btnSpeak
    }
    
    MainPage --> TopBar
    MainPage --> StartScreen
    MainPage --> PracticeScreen
    PracticeScreen --> PhoneSimulator
    PracticeScreen --> Controls
```

## 資料流程圖

```mermaid
sequenceDiagram
    participant U as 使用者
    participant P as 頁面
    participant S as Script
    participant D as DOM
    
    U->>P: 載入網頁
    P->>S: 執行 script.js
    S->>D: 初始化 DOM 元素
    D->>U: 顯示選單
    
    U->>D: 點擊練習卡片
    D->>S: 觸發 data-scn 事件
    S->>S: startScenario()
    S->>D: 渲染練習畫面
    D->>U: 顯示第一步指引
    
    loop 每一步驟
        U->>D: 點擊手機上的元素
        D->>S: 觸發 click 事件
        S->>S: 驗證操作
        alt 正確操作
            S->>D: 更新為下一步
            D->>U: 顯示成功提示
        else 錯誤操作
            S->>D: 顯示錯誤訊息
            D->>U: 提示正確位置
        end
    end
    
    S->>D: 顯示完成畫面
    D->>U: 恭喜完成!
```

## 頁面狀態圖

```mermaid
stateDiagram-v2
    [*] --> 選單頁面
    選單頁面 --> 練習中: 選擇情境
    
    state 練習中 {
        [*] --> 步驟1
        步驟1 --> 步驟2: 正確操作
        步驟2 --> 步驟3: 正確操作
        步驟3 --> ...: 正確操作
        ... --> 完成: 最後一步
        
        步驟1 --> 步驟1: 錯誤操作(顯示提示)
        步驟2 --> 步驟2: 錯誤操作(顯示提示)
    }
    
    練習中 --> 選單頁面: 按返回選單
    完成 --> 練習中: 再練一次
    完成 --> 選單頁面: 練習別的
```

## HTML 結構特點

### 語義化標籤
- 使用 `<header>`, `<main>`, `<section>`, `<nav>` 等語義化標籤
- 提升可訪問性和 SEO

### 無障礙設計
- 適當使用 `aria-*` 屬性
- 提供 `role` 屬性
- 支援鍵盤導航

### 響應式設計
- `viewport` meta 設定
- `viewport-fit=cover` 支援全屏設備
- CSS 媒體查詢配合

### 效能優化
- 外部 CSS 和 JS 檔案
- 最小化內聯樣式
- 結構清晰易於維護
