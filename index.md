# index.html 說明文件

## 概述

這是手機練習網站的主要 HTML 文件，提供靜態單頁應用程式的結構框架。所有內容都在一個頁面中，透過 JavaScript 動態切換顯示。

## 頁面架構

```mermaid
graph TB
    HTML[index.html]
    
    HTML --> Head[head 區塊]
    HTML --> Body[body 區塊]
    
    Head --> Meta[meta 標籤]
    Head --> Title[title]
    Head --> CSS[style.css]
    
    Body --> TopBar[header.topbar]
    Body --> Start[main#start]
    Body --> Practice[main#practice]
    Body --> Toast[#toast]
    Body --> Script[script.js]
    
    Start --> Cards[情境卡片列表]
    Start --> Settings[設定區]
    
    Practice --> Guide[.guide 指引區]
    Practice --> Phone[.phone-wrap 手機模擬器]
    Practice --> Controls[.controls 控制按鈕]
    
    Phone --> Screen[#screen 畫面容器]
```

## DOM 結構

```mermaid
classDiagram
    class HTML {
        +lang: zh-Hant-TW
        +viewport: width=device-width
        +theme-color: #0b8f3e
    }
    
    class TopBar {
        +.topbar: flex header
        +.brand: 品牌名稱
        +.badge: 練習提示
        +#btnMenu: 回選單按鈕
    }
    
    class StartPage {
        +#start: 主選單
        +h1: 標題
        +.lead: 說明文字
        +.cards: 情境卡片容器
        +.settings: 設定區
    }
    
    class PracticePage {
        +#practice: 練習容器
        +.guide: 指引區
        +.phone-wrap: 手機外框
        +.controls: 控制按鈕
    }
    
    class PhoneSimulator {
        +.phone: 模擬手機
        +.statusbar: 狀態列
        +#screen: 畫面內容
        +.navbar: 導航列
    }
    
    HTML --> TopBar
    HTML --> StartPage
    HTML --> PracticePage
    PracticePage --> PhoneSimulator
```

## 頁面流程

```mermaid
stateDiagram-v2
    [*] --> 載入頁面
    
    載入頁面 --> 顯示選單: #start visible
    
    顯示選單 --> 選擇情境: 點擊卡片
    
    選擇情境 --> 開始練習: startScenario()
    
    state 開始練習 {
        [*] --> 隱藏選單: #start hidden
        隱藏選單 --> 顯示練習: #practice visible
        顯示練習 --> 第一步: go(0)
    }
    
    開始練習 --> 進行中: 使用者操作
    
    進行中 --> 下一步: success()
    下一步 --> 進行中
    
    進行中 --> 完成: final step
    
    完成 --> 顯示選單: 點擊「回選單」
    顯示選單 --> [*]
```

## 情境卡片結構

```mermaid
graph LR
    Section[section-title] --> Cards[.cards 容器]
    
    Cards --> CardA[情境 A 卡片]
    Cards --> CardB[情境 B 卡片]
    Cards --> CardC[情境 C 卡片]
    
    subgraph "卡片內容"
        Emoji[.card-emoji<br/>表情符號]
        Title[b 標題]
        Desc[small 描述]
    end
    
    CardA --> Emoji
    CardA --> Title
    CardA --> Desc
```

### 情境卡片範例

```html
<button class="card" data-scn="F">
  <span class="card-emoji" aria-hidden="true">✍️</span>
  <span class="card-txt">
    <b>在群組接龍留名字</b>
    <small>團購接龍時，複製最新訊息加上自己的名字</small>
  </span>
</button>
```

## 情境分組

```mermaid
graph TB
    Menu[選單頁面]
    
    Menu --> Pay[💰 LINE Pay 付款練習]
    Menu --> Location[📍 位置分享練習]
    Menu --> Chat[💬 用 LINE 聊天]
    
    Pay --> A[A: 餐廳掃碼點餐]
    Pay --> B[B: 櫃台付款]
    Pay --> C[C: 掃店家 QR 碼]
    
    Location --> D[D: 傳送我的位置]
    Location --> E[E: 傳送一個地址]
    
    Chat --> F[F: 群組接龍留名字]
```

## 設定區組件

```mermaid
classDiagram
    class Settings {
        +.settings: 設定容器
    }
    
    class ToggleHints {
        +.toggle: 開關按鈕
        +id: toggleHints
        +localStorage: hints
    }
    
    class ToggleSpeak {
        +.toggle: 開關按鈕
        +id: toggleSpeak
        +localStorage: autoSpeak
    }
    
    class SafetyNote {
        +.safety: 安全說明
        +p: 說明段落
    }
    
    Settings --> ToggleHints
    Settings --> ToggleSpeak
    Settings --> SafetyNote
```

### 設定區 HTML

```html
<div class="settings">
  <button class="toggle" id="toggleHints">
    <span>💡 提示（會發亮）</span>
    <span class="on-off">開啟中</span>
  </button>
  <button class="toggle" id="toggleSpeak">
    <span>🔊 自動唸給我聽</span>
    <span class="on-off">關閉</span>
  </button>
</div>
<div class="safety">
  <p><b>安全</b>：練習用模擬畫面...</p>
</div>
```

## 練習頁面結構

```mermaid
graph TB
    Practice[#practice 練習容器]
    
    Practice --> Guide[.guide 指引區]
    Practice --> PhoneWrap[.phone-wrap 手機外框]
    Practice --> Controls[.controls 控制區]
    
    Guide --> Progress[.prog-row 進度列]
    Guide --> Instr[#instr 指引文字]
    
    Progress --> Bar[#bar 進度條]
    Progress --> ScnName[#scnName 情境名稱]
    
    PhoneWrap --> Phone[.phone 手機]
    
    Phone --> StatusBar[.statusbar 狀態列]
    Phone --> Screen[#screen 畫面內容]
    Phone --> NavBar[.navbar 導航列]
    
    Controls --> Prev[#btnPrev 上一步]
    Controls --> Restart[從頭再練]
    Controls --> Hint[#btnHint 提示]
    Controls --> Speak[#btnSpeak 唸給我聽]
```

## 手機模擬器元素

```mermaid
classDiagram
    class PhoneSimulator {
        +.phone: 主容器
        +aspect-ratio: 9/19.5
        +border-radius: 24px
        +box-shadow: 深色陰影
    }
    
    class StatusBar {
        +.statusbar: 狀態列
        +height: 24px
        +display: flex
        +justify-content: space-between
    }
    
    class Screen {
        +#screen: 畫面容器
        +flex: 1
        +overflow: hidden
        +background: white
    }
    
    class NavBar {
        +.navbar: 導航列
        +height: 48px
        +text-align: center
    }
    
    PhoneSimulator --> StatusBar
    PhoneSimulator --> Screen
    PhoneSimulator --> NavBar
```

### 狀態列 HTML

```html
<div class="statusbar">
  <div class="status-left">
    <span class="status-icon">📶</span>
    <span class="status-icon">📱</span>
  </div>
  <div class="status-time">10:30</div>
  <div class="status-right">
    <span class="status-icon">🔋</span>
  </div>
</div>
```

## 控制按鈕

```mermaid
graph LR
    Controls[.controls 容器] --> Prev[上一步]
    Controls --> Restart[從頭再練一次]
    Controls --> Hint[提示]
    Controls --> Speak[唸給我聽]
    
    Prev --> Script1[go 向前]
    Restart --> Script2[go 0]
    Hint --> Script3[toggleHints]
    Speak --> Script4[speak]
```

### 控制按鈕 HTML

```html
<div class="controls">
  <button id="btnPrev">上一步</button>
  <button id="btnReset">從頭<br>再練一次</button>
  <button id="btnHint">💡<br>提示</button>
  <button id="btnSpeak">🔊<br>唸給我聽</button>
</div>
```

## 提示框系統

```mermaid
stateDiagram-v2
    [*] --> Hidden: 初始狀態
    
    Hidden --> ShowSuccess: 成功操作
    Hidden --> ShowError: 錯誤操作
    Hidden --> ShowInfo: 一般提示
    
    state ShowSuccess {
        [*] --> 設定內容
        設定內容 --> 添加good類別
        添加good類別 --> 顯示900ms
    }
    
    state ShowError {
        [*] --> 設定內容
        設定內容 --> 顯示3500ms
    }
    
    state ShowInfo {
        [*] --> 設定內容
        設定內容 --> 顯示3500ms
    }
    
    ShowSuccess --> Hidden
    ShowError --> Hidden
    ShowInfo --> Hidden
    Hidden --> [*]
```

### 提示框 HTML

```html
<div id="toast" class="toast" hidden></div>
```

提示框透過 JavaScript 動態設定內容和樣式：

```javascript
toast('👍 很好！', true);  // 成功 - 綠色 900ms
toast('😊 再試一次');      // 錯誤 - 深灰 3500ms
```

## 深連結支援

```mermaid
flowchart LR
    URL[網址] --> Hash{有 hash?}
    
    Hash -->|#A| LoadA[載入情境 A]
    Hash -->|#B| LoadB[載入情境 B]
    Hash -->|#C| LoadC[載入情境 C]
    Hash -->|#D| LoadD[載入情境 D]
    Hash -->|#E| LoadE[載入情境 E]
    Hash -->|#F| LoadF[載入情境 F]
    Hash -->|無| ShowMenu[顯示選單]
    
    LoadA --> Start[startScenario]
    LoadB --> Start
    LoadC --> Start
    LoadD --> Start
    LoadE --> Start
    LoadF --> Start
```

支援的深連結：
- `#A` - 餐廳掃碼點餐
- `#B` - 櫃台付款
- `#C` - 掃店家 QR 碼
- `#D` - 傳送我的位置
- `#E` - 傳送一個地址
- `#F` - 群組接龍留名字

## Meta 標籤

```mermaid
classDiagram
    class MetaTags {
        +charset: utf-8
        +viewport: width=device-width, initial-scale=1
        +theme-color: #0b8f3e
        +description: 練習說明
    }
    
    class ViewportSettings {
        +width: device-width
        +initial-scale: 1
        +viewport-fit: cover
    }
    
    class ThemeColor {
        +color: #0b8f3e
        +matches: LINE 綠色
    }
    
    MetaTags --> ViewportSettings
    MetaTags --> ThemeColor
```

### Meta 標籤 HTML

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0b8f3e">
<meta name="description" content="給長輩的手機練習...">
```

## 資料屬性系統

```mermaid
graph TB
    DataAttr[data-* 屬性]
    
    DataAttr --> ScnAttr[data-scn<br/>情境卡片標識]
    DataAttr --> TAttr[data-t<br/>正確目標]
    DataAttr --> WrongAttr[data-wrong<br/>錯誤訊息]
    DataAttr --> ActAttr[data-act<br/>操作類型]
    DataAttr --> NeutralAttr[data-neutral<br/>中立區域]
    
    ScnAttr --> Example1["data-scn='F'<br/>點擊啟動情境 F"]
    TAttr --> Example2["data-t='copy-text'<br/>正確點擊目標"]
    WrongAttr --> Example3["data-wrong='訊息'<br/>錯誤提示文字"]
    ActAttr --> Example4["data-act='type'<br/>執行 type 操作"]
    NeutralAttr --> Example5["data-neutral<br/>不觸發錯誤"]
```

### 資料屬性範例

```html
<!-- 情境卡片 -->
<button class="card" data-scn="F">...</button>

<!-- 正確目標 -->
<button data-t="copy-text">複製</button>

<!-- 錯誤提示 -->
<button data-wrong="這是轉傳。我們要按「複製」。">轉傳</button>

<!-- 操作按鈕 -->
<button data-act="type" data-v="小蓉">小蓉</button>

<!-- 中立區域（不觸發錯誤） -->
<div class="keyboard" data-neutral>...</div>
```

## 無障礙屬性

```mermaid
classDiagram
    class Accessibility {
        +aria-label: 描述性標籤
        +aria-hidden: 隱藏裝飾元素
        +role: 語義角色
        +lang: 語言設定
    }
    
    class Examples {
        +emoji: aria-hidden="true"
        +badge: role="note"
        +dots: aria-label="已輸入 X 個數字"
    }
    
    Accessibility --> Examples
```

### 無障礙範例

```html
<!-- 表情符號不需朗讀 -->
<span class="card-emoji" aria-hidden="true">✍️</span>

<!-- 提示訊息 -->
<div class="badge" role="note">練習用模擬畫面</div>

<!-- 密碼點點 -->
<div class="dots" aria-label="已輸入 3 個數字">...</div>
```

## 頁面載入流程

```mermaid
sequenceDiagram
    participant B as 瀏覽器
    participant H as HTML
    participant C as CSS
    participant J as JS
    
    B->>H: 請求 index.html
    H->>B: 返回 HTML
    B->>C: 載入 style.css
    C->>B: 套用樣式
    B->>H: 解析 DOM
    B->>J: 執行 script.js
    J->>J: 初始化狀態
    J->>J: 讀取 localStorage
    J->>J: 檢查 hash
    
    alt 有 hash (#A-F)
        J->>H: 隱藏 #start
        J->>H: 顯示 #practice
        J->>H: 載入情境
    else 無 hash
        J->>H: 顯示 #start
        J->>H: 隱藏 #practice
    end
    
    J->>B: 頁面準備完成
```

## 使用者互動流程

```mermaid
sequenceDiagram
    participant U as 使用者
    participant H as HTML
    participant J as JavaScript
    participant L as localStorage
    
    U->>H: 點擊情境卡片
    H->>J: 觸發 click 事件
    J->>J: startScenario(key)
    J->>L: 儲存狀態
    J->>H: 更新 DOM
    H->>U: 顯示練習頁面
    
    loop 練習過程
        U->>H: 點擊畫面元素
        H->>J: 檢查 data-t / data-wrong
        
        alt 正確操作
            J->>H: 顯示成功提示
            J->>J: next() 下一步
            J->>H: 更新畫面
        else 錯誤操作
            J->>H: 顯示錯誤提示
            J->>H: 發光提示正確目標
        end
    end
    
    U->>H: 完成或點擊「回選單」
    H->>J: 返回選單
    J->>H: 顯示 #start
```

## HTML 元素 ID 參考

```mermaid
graph TB
    IDs[重要 ID 元素]
    
    IDs --> start[#start<br/>選單容器]
    IDs --> practice[#practice<br/>練習容器]
    IDs --> screen[#screen<br/>畫面內容]
    IDs --> instr[#instr<br/>指引文字]
    IDs --> bar[#bar<br/>進度條]
    IDs --> scnName[#scnName<br/>情境名稱]
    IDs --> toast[#toast<br/>提示框]
    IDs --> done[#done<br/>完成按鈕區]
    
    IDs --> Controls[控制按鈕]
    Controls --> btnMenu[#btnMenu<br/>回選單]
    Controls --> btnPrev[#btnPrev<br/>上一步]
    Controls --> btnReset[#btnReset<br/>重新開始]
    Controls --> btnHint[#btnHint<br/>提示]
    Controls --> btnSpeak[#btnSpeak<br/>語音]
    
    IDs --> Settings[設定按鈕]
    Settings --> toggleHints[#toggleHints<br/>提示開關]
    Settings --> toggleSpeak[#toggleSpeak<br/>語音開關]
```

## 維護指南

### 新增情境步驟

1. **在 HTML 中新增卡片**

```html
<button class="card" data-scn="G">
  <span class="card-emoji" aria-hidden="true">🆕</span>
  <span class="card-txt">
    <b>新情境名稱</b>
    <small>簡短描述</small>
  </span>
</button>
```

2. **在 script.js 定義情境**

```javascript
SCENARIOS.G = {
  name: '新情境名稱',
  steps: [...]
};
```

3. **更新 README.md**

### 修改頁面標題或描述

修改 `<head>` 區塊：

```html
<title>你的標題</title>
<meta name="description" content="你的描述">
```

### 調整手機模擬器尺寸

修改 `.phone` 的 CSS：

```css
.phone {
  aspect-ratio: 9/19.5;  /* 調整這個比例 */
  max-height: 680px;     /* 調整最大高度 */
}
```

## 靜態部署

此 HTML 檔案為靜態單頁應用程式，可直接部署到：

- GitHub Pages
- Netlify
- Vercel
- 任何靜態主機

部署需求：
- 僅需 3 個檔案：`index.html`、`style.css`、`script.js`
- 無需 build 步驟
- 無需伺服器端處理
- 完全離線可用

## 總結

index.html 的設計理念：

1. **簡潔結構**：最小化 DOM 元素
2. **語義化標籤**：正確使用 HTML5 標籤
3. **無障礙友善**：適當的 ARIA 屬性
4. **響應式設計**：搭配 CSS 媒體查詢
5. **深連結支援**：方便直接進入特定練習
6. **離線友善**：無外部依賴
