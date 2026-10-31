# style.css - 樣式表文件

## 檔案說明

此檔案定義了 LINE Pay 練習網站的所有視覺樣式，包含響應式設計和動畫效果。

## CSS 架構圖

```mermaid
graph TD
    Root[":root 變數定義"] --> Base["基礎樣式 (*, html, body)"]
    Base --> Layout[版面配置]
    Base --> Components[組件樣式]
    Base --> Animations[動畫效果]
    
    Layout --> TopBar[頂部欄]
    Layout --> StartPage[開始頁面]
    Layout --> PracticeLayout[練習版面]
    
    Components --> Phone[手機模擬器]
    Components --> Controls[控制按鈕]
    Components --> Toast[提示訊息]
    
    Phone --> HomeScreen[主畫面]
    Phone --> LineHome[LINE 主頁]
    Phone --> Wallet[錢包]
    Phone --> PayScreens[付款畫面]
    
    Animations --> Glow[發光效果]
    Animations --> Pop[彈出效果]
    Animations --> Scan[掃描動畫]
```

## CSS 變數系統

```mermaid
classDiagram
    class CSSVariables {
        --green: #0b8f3e
        --green2: #12a150
        --green-l: #e6f6ec
        --ink: #1a1a1a
        --muted: #4a4a4a
        --bg: #f4f1ea
        --glow: #ff9800
        --font: "Noto Sans TC", ...
    }
    
    class ColorScheme {
        +主色調: 綠色系列
        +文字色: 深灰黑
        +背景色: 米白色
        +強調色: 橘色
    }
    
    class Typography {
        +中文字型堆疊
        +支援多平台
        +回退機制
    }
    
    CSSVariables --> ColorScheme
    CSSVariables --> Typography
```

## 響應式設計流程

```mermaid
flowchart LR
    Desktop["桌面版<br/>(>820px)"] --> Tablet["平板版<br/>(600-820px)"]
    Tablet --> Mobile["手機版<br/>(<600px)"]
    Mobile --> SmallMobile["小螢幕<br/>(高度<700px)"]
    
    Desktop -.->|Grid 2欄| Layout1[指引 + 手機模擬器]
    Tablet -.->|Grid 1欄| Layout2[垂直排列]
    Mobile -.->|全螢幕| Layout3[手機填滿畫面]
    SmallMobile -.->|縮小尺寸| Layout4[調整字體圖示]
```

## 組件樣式圖

```mermaid
classDiagram
    class TopBar {
        +display: flex
        +align-items: center
        +background: #fff
        +border-bottom: 2px solid
    }
    
    class Card {
        +display: flex
        +border: 3px solid var(--green)
        +border-radius: 20px
        +min-height: 96px
        +hover效果
        +active效果
    }
    
    class Phone {
        +aspect-ratio: 9/17.5
        +border-radius: 46px
        +background: #111
        +box-shadow 多層
        +偽元素前置鏡頭
    }
    
    class Toast {
        +position: absolute
        +animation: pop
        +border: 3px solid
        +pointer-events: none
    }
    
    TopBar --|> FlexContainer
    Card --|> FlexContainer
    Phone --|> FlexContainer
    Toast --|> PositionedElement
```

## 動畫時序圖

```mermaid
sequenceDiagram
    participant E as 元素
    participant A as 動畫
    participant U as 使用者
    
    Note over E: 初始狀態
    U->>E: 觸發操作
    E->>A: 啟動 glow 動畫
    
    loop 1.5秒循環
        A->>E: 外框發光
        A->>E: 陰影擴散 (0-18px)
        A->>E: 透明度變化 (0.85-0)
    end
    
    U->>E: 點擊正確
    E->>A: 停止 glow
    E->>A: 啟動 pop 動畫
    A->>E: 縮放 (0.9 → 1)
    A->>E: 淡入 (0 → 1)
    Note over E: 完成狀態
```

## 媒體查詢決策樹

```mermaid
graph TD
    Start[載入頁面] --> CheckWidth{螢幕寬度?}
    
    CheckWidth -->|> 820px| Desktop[桌面版樣式]
    CheckWidth -->|600-820px| Tablet[平板版樣式]
    CheckWidth -->|< 600px| Mobile[手機版樣式]
    
    Mobile --> CheckHeight{螢幕高度?}
    CheckHeight -->|< 700px| SmallScreen[小螢幕調整]
    CheckHeight -->|>= 700px| NormalMobile[標準手機]
    
    Desktop --> Apply[套用樣式]
    Tablet --> Apply
    NormalMobile --> Apply
    SmallScreen --> Apply
    
    Apply --> CheckMotion{偏好減少動畫?}
    CheckMotion -->|是| DisableAnim[停用動畫]
    CheckMotion -->|否| KeepAnim[保持動畫]
```

## 佈局系統

```mermaid
graph LR
    PracticeLayout[.practice<br/>Grid 容器]
    
    PracticeLayout --> Guide[.guide<br/>grid-area: guide]
    PracticeLayout --> Phone[.phone-wrap<br/>grid-area: phone]
    PracticeLayout --> Controls[.controls<br/>grid-area: controls]
    
    Guide --> GuideContent["進度條<br/>說明文字<br/>完成按鈕"]
    Phone --> PhoneContent["狀態列<br/>畫面<br/>導航列"]
    Controls --> ControlsContent["上一步<br/>重新開始<br/>提示<br/>朗讀"]
    
    style PracticeLayout fill:#e1f5e1
    style Guide fill:#fff3cd
    style Phone fill:#e3f2fd
    style Controls fill:#fce4ec
```

## 關鍵 CSS 技術

### 1. Grid 佈局
```mermaid
graph TB
    Grid["CSS Grid"] --> Areas["grid-template-areas"]
    Grid --> Columns["grid-template-columns"]
    Areas --> GuideArea["guide"]
    Areas --> PhoneArea["phone"]
    Areas --> ControlsArea["controls"]
```

### 2. Flexbox 應用
```mermaid
graph LR
    Flex["Flexbox"] --> Row["橫向排列"]
    Flex --> Col["縱向排列"]
    Row --> Header["頂部欄"]
    Row --> Cards["卡片內容"]
    Col --> Phone["手機結構"]
    Col --> Buttons["按鈕組"]
```

### 3. 動畫系統
```mermaid
stateDiagram-v2
    [*] --> 靜止
    靜止 --> 發光: 添加 .glow
    發光 --> 發光: 1.5s 循環
    發光 --> 靜止: 移除 .glow
    
    靜止 --> 彈出: 顯示 Toast
    彈出 --> 顯示: 0.25s
    顯示 --> 淡出: 3.5s 後
    淡出 --> [*]
```

## 顏色使用指南

```mermaid
pie title 主要顏色使用比例
    "綠色 (LINE Pay 主題)" : 35
    "白色 (背景/卡片)" : 30
    "深灰/黑 (文字)" : 20
    "米白 (頁面背景)" : 10
    "橘色 (強調/提示)" : 5
```

## 響應式斷點

| 斷點 | 說明 | 主要變化 |
|------|------|----------|
| > 820px | 桌面版 | 兩欄佈局，手機居中 |
| 600-820px | 平板版 | 單欄佈局，垂直排列 |
| < 600px | 手機版 | 手機填滿螢幕 |
| < 700px (高度) | 小螢幕 | 縮小圖示和按鈕 |

## 效能優化

- 使用 CSS 變數減少重複
- 適當使用 `will-change` (未使用過度)
- 簡化選擇器
- 避免過度巢狀
- 使用 `transform` 和 `opacity` 做動畫
