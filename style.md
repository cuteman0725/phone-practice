# style.css 說明文件

## 概述

這是手機練習網站的樣式表，負責所有視覺呈現和響應式布局。設計重點是確保在各種螢幕尺寸上都能完整顯示，不需要捲動頁面。

## 整體架構

```mermaid
graph TB
    CSS[style.css] --> Vars[CSS 變數]
    CSS --> Base[基礎樣式]
    CSS --> Layout[布局系統]
    CSS --> Components[組件樣式]
    CSS --> Screens[畫面樣式]
    CSS --> Responsive[響應式]
    
    Vars --> Colors[顏色主題]
    Vars --> Glow[發光效果]
    
    Layout --> Desktop[桌面布局]
    Layout --> Mobile[行動端布局]
    
    Components --> Buttons[按鈕]
    Components --> Toast[提示框]
    Components --> Cards[卡片]
    
    Screens --> Pay[付款相關]
    Screens --> Location[位置分享]
    Screens --> Chain[群組接龍]
    
    Responsive --> Media820[平板 ≤820px]
    Responsive --> Media600[手機 ≤600px]
    Responsive --> Media700[小螢幕 ≤700px]
```

## CSS 變數定義

```mermaid
classDiagram
    class CSSVariables {
        --green: #0b8f3e
        --glow: #ffeb3b
        --hover: #eee
        --toast-bg: #323232
        --transition: 0.2s
    }
    
    class ColorUsage {
        +Primary: --green
        +Highlight: --glow
        +Interactive: --hover
        +Feedback: --toast-bg
    }
    
    CSSVariables --> ColorUsage
```

## 布局系統架構

### 桌面版布局

```mermaid
graph TB
    Body[body<br/>display: block<br/>min-height: 100vh]
    
    Body --> TopBar[.topbar<br/>flex<br/>padding: 6px 16px]
    Body --> Main[main]
    
    Main --> Start[.start<br/>max-width: 600px<br/>margin: auto]
    Main --> Practice[.practice<br/>display: grid<br/>max-width: 480px<br/>gap: 16px]
    
    Practice --> Guide[.guide<br/>grid-row: 1]
    Practice --> PhoneWrap[.phone-wrap<br/>grid-row: 2]
    Practice --> Controls[.controls<br/>grid-row: 3]
    
    PhoneWrap --> Phone[.phone<br/>aspect-ratio: 9/19.5<br/>模擬手機外框]
```

### 行動版布局（≤600px）

```mermaid
graph TB
    Body[body<br/>flexbox column<br/>height: 100dvh<br/>overflow: hidden]
    
    Body --> TopBar[.topbar<br/>flex: 0 0 auto<br/>min-height: 32px]
    Body --> Container[.start 或 .practice<br/>flex: 1<br/>min-height: 0]
    
    Container --> Start[.start<br/>overflow-y: auto]
    Container --> Practice[.practice<br/>grid rows:<br/>auto / 1fr / auto]
    
    Practice --> Guide[.guide<br/>緊湊指引<br/>auto 高度]
    Practice --> PhoneWrap[.phone-wrap<br/>填滿剩餘空間<br/>flex: 1]
    Practice --> Controls[.controls<br/>4 按鈕橫排<br/>固定 48px]
```

## 響應式斷點

```mermaid
flowchart LR
    Wide[寬螢幕<br/>> 820px] --> Normal[正常顯示<br/>完整尺寸]
    
    Tablet[平板<br/>≤ 820px] --> Adjust1[調整卡片<br/>2 欄布局]
    
    Mobile[手機<br/>≤ 600px] --> Adjust2[行動端優化<br/>全螢幕布局<br/>隱藏裝飾元素]
    
    Short[矮螢幕<br/>≤ 700px<br/>且 ≤ 600px] --> Adjust3[壓縮時鐘<br/>縮小圖示]
```

## 關鍵 CSS 類別

### 畫面容器

```mermaid
classDiagram
    class Screen容器 {
        .scr: 基礎畫面容器
        .scroll: 可捲動內容區
        .appbar: 頂部導航列
    }
    
    class 特殊畫面 {
        .lhome: LINE 主頁
        .chat-room: 聊天室
        .lp-page: LINE Pay 頁面
        .loc-map: 地圖畫面
    }
    
    class 布局模式 {
        flex-column: 大部分畫面
        grid: menu, checkout
    }
    
    Screen容器 <|-- 特殊畫面
    特殊畫面 --> 布局模式
```

## 群組接龍相關樣式

### 聊天室組件

```mermaid
graph TB
    ChatRoom[.chat-room<br/>flex column]
    
    ChatRoom --> AppBar[.appbar<br/>固定頂部]
    ChatRoom --> Scroll[.scroll<br/>可捲動對話]
    ChatRoom --> InputBar[.chat-input-bar<br/>輸入區]
    
    Scroll --> MsgOther[.msg-other<br/>他人訊息-左對齊]
    Scroll --> MsgMe[.msg-me<br/>自己訊息-右對齊]
    
    MsgOther --> ChainMsg[.chain-msg<br/>接龍訊息<br/>monospace 字型<br/>pre-wrap]
```

### 複製選單

```mermaid
graph TB
    CopyMenu[.copy-menu<br/>relative 定位]
    
    CopyMenu --> Overlay[.menu-overlay<br/>半透明遮罩<br/>z-index: 5]
    CopyMenu --> Popup[.copy-popup<br/>白色彈窗<br/>z-index: 10<br/>居中顯示]
    
    Popup --> Items[.copy-menu-item<br/>複製/轉傳/回覆/收回<br/>padding: 14px 20px]
```

### 輸入框與鍵盤

```mermaid
graph TB
    InputBar[.chat-input-bar-expanded<br/>flex row<br/>align-items: flex-end]
    
    InputBar --> InputArea[.input-area<br/>flex: 1<br/>max-height: 120px<br/>overflow-y: auto<br/>pre-wrap]
    InputBar --> SendBtn[.input-send<br/>44×44px 圓形<br/>綠色背景]
    
    Keyboard[.keyboard<br/>灰色背景<br/>flex: 0 0 auto]
    
    Keyboard --> Row[.kb-row<br/>flex gap: 4px]
    Row --> Key[.kb-key<br/>白色按鈕<br/>flex: 1]
    Row --> Wide[.kb-key.wide<br/>flex: 2<br/>更寬按鈕]
    Row --> Paste[.kb-key.paste-key<br/>綠色貼上鍵]
    
    Keyboard --> Helper[.kb-helper<br/>提示文字]
```

## 動畫效果

```mermaid
graph LR
    Pulse[@keyframes pulse<br/>發光脈動<br/>0% → 50% → 100%] --> Glow[發光效果<br/>box-shadow]
    
    Pop[@keyframes pop<br/>彈出效果<br/>scale 0.8 → 1.05 → 1] --> Toast[提示框出現]
    
    Bounce[@keyframes bounce<br/>彈跳效果<br/>translate Y 移動] --> Pin[地圖釘子]
    
    Scan[.scanning<br/>掃描動畫<br/>淡入 + 掃描線] --> Delay[延遲操作]
```

## 發光提示機制

```mermaid
stateDiagram-v2
    [*] --> 無發光: 初始狀態
    
    無發光 --> 發光中: applyGlow(true)
    發光中 --> 無發光: applyGlow(false)
    
    發光中 --> 目標元素: [data-t] 添加 .glow
    
    state 發光中 {
        [*] --> 淡黃色陰影
        淡黃色陰影 --> 脈動動畫
        脈動動畫 --> 吸引注意
    }
```

### 發光樣式定義

```css
[data-t].glow {
  animation: pulse 1.5s ease-in-out infinite;
  position: relative;
  z-index: 5;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 var(--glow), 
                0 0 20px 5px #ffeb3b88;
  }
  50% {
    box-shadow: 0 0 0 8px #ffeb3b00, 
                0 0 30px 10px #ffeb3baa;
  }
}
```

## 行動端優化策略

### 尺寸調整原則

```mermaid
graph TB
    Optimize[行動端優化]
    
    Optimize --> Compact[緊湊布局]
    Optimize --> Hide[隱藏裝飾]
    Optimize --> Simplify[簡化操作]
    
    Compact --> TopBar[topbar: 32px → 6px padding]
    Compact --> Guide[guide: 縮小指引文字]
    Compact --> Controls[controls: 1 row 4 columns]
    
    Hide --> NoStatus[隱藏 .statusbar]
    Hide --> NoNav[隱藏 .navbar]
    Hide --> NoBorder[移除 .phone 邊框]
    
    Simplify --> BigBtn[大按鈕 min-height: 48px]
    Simplify --> BigText[大字體 19-20px]
```

### 無捲軸保證

```mermaid
flowchart TD
    Container[容器設定] --> Body[body: 100dvh overflow hidden]
    Body --> Flex[flexbox column]
    
    Flex --> TopBar[topbar: flex 0 0 auto]
    Flex --> Main[main: flex 1 min-height 0]
    
    Main --> Practice[practice: grid auto/1fr/auto]
    
    Practice --> Guide[guide: auto 高度<br/>緊湊文字]
    Practice --> Phone[phone-wrap: flex 1<br/>填滿剩餘空間]
    Practice --> Controls[controls: 48px 固定]
    
    Phone --> Screen[screen 內部可捲動<br/>.scroll overflow-y auto]
    
    Result[結果: 總高度 = 100dvh<br/>無外部捲軸]
```

## 特殊元件樣式

### 聊天泡泡

```mermaid
classDiagram
    class MessageBubble {
        .msg: flex container
        .msg-bubble: 圓角背景
        .msg-time: 小字時間
    }
    
    class OtherMessage {
        .msg-other: 左對齊
        .avatar: 圓形頭像
        background: white
    }
    
    class MyMessage {
        .msg-me: 右對齊
        background: #dcf8c6 淺綠
        justify-content: flex-end
    }
    
    class ChainMessage {
        .chain-msg: 接龍訊息
        monospace 等寬字型
        pre-wrap 保留換行
        max-width: 85%
    }
    
    MessageBubble <|-- OtherMessage
    MessageBubble <|-- MyMessage
    OtherMessage <|-- ChainMessage
```

### 地圖畫面

```mermaid
graph TB
    LocMap[.loc-map]
    
    LocMap --> MapView[.map-view<br/>flex center<br/>gradient background]
    LocMap --> LocInfo[.loc-info<br/>地點資訊<br/>白底]
    LocMap --> SendBtn[.loc-send-btn<br/>綠色大按鈕]
    
    MapView --> MapBG[.map-bg<br/>漸層 + 網格]
    MapView --> MapPin[.map-pin<br/>bounce 動畫]
    MapView --> MapSearch[.map-search<br/>搜尋框]
```

### 鍵盤樣式

```mermaid
classDiagram
    class Keyboard {
        .keyboard: 灰底容器
        padding: 8px
        background: #e3e3e3
    }
    
    class KeyRow {
        .kb-row: flex row
        gap: 4px
        margin-bottom: 4px
    }
    
    class Key {
        .kb-key: 白色按鈕
        flex: 1
        min-height: 48px
        border-radius: 8px
    }
    
    class WideKey {
        .kb-key.wide: 加寬按鈕
        flex: 2
    }
    
    class PasteKey {
        .kb-key.paste-key: 貼上鍵
        background: #4caf50 綠色
        color: white
    }
    
    class Helper {
        .kb-helper: 提示文字
        text-align: center
        color: #666
    }
    
    Keyboard --> KeyRow
    KeyRow --> Key
    Key <|-- WideKey
    Key <|-- PasteKey
    Keyboard --> Helper
```

## 提示框系統

```mermaid
stateDiagram-v2
    [*] --> Hidden: toast.hidden = true
    
    Hidden --> Showing: toast(msg)
    
    state Showing {
        [*] --> SetContent: 設定訊息內容
        SetContent --> AddClass: 添加 .at-top 或 .good
        AddClass --> Display: hidden = false
        Display --> Animate: pop 動畫
    }
    
    Showing --> AutoHide: setTimeout
    
    state AutoHide {
        [*] --> WaitGood: good? 900ms
        [*] --> WaitNormal: normal? 3500ms
    }
    
    AutoHide --> Hidden: hidden = true
    Hidden --> [*]
```

### 提示框樣式

```css
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--toast-bg);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 20px;
  z-index: 1000;
  animation: pop 0.3s ease-out;
}

.toast.at-top {
  bottom: auto;
  top: 44px;
}

.toast.good {
  background: #4caf50;
}
```

## 顏色系統

```mermaid
graph LR
    Primary[主色調] --> Green[--green: #0b8f3e<br/>LINE 綠色]
    
    Accent[強調色] --> Glow[--glow: #ffeb3b<br/>黃色發光]
    
    Interactive[互動色] --> Hover[--hover: #eee<br/>懸停灰色]
    
    Feedback[反饋色] --> Toast[--toast-bg: #323232<br/>深灰提示]
    Feedback --> Success[#4caf50<br/>成功綠色]
    Feedback --> Wrong[維持 toast-bg<br/>錯誤使用 emoji]
```

## 維護指南

### 新增畫面樣式步驟

1. 在 `script.js` 的 `SCREENS` 定義畫面結構
2. 在 `style.css` 添加對應的 `.畫面名稱` 類別
3. 確保在桌面和行動端都測試
4. 驗證無垂直捲軸（360×640 最小尺寸）

### 修改顏色主題

只需修改 CSS 變數：

```css
:root {
  --green: #你的顏色;
  --glow: #你的顏色;
}
```

### 調整行動端尺寸

在 `@media (max-width:600px)` 區塊中調整：

```css
@media (max-width:600px) {
  .topbar { min-height: 你的高度px; }
  .controls button { min-height: 你的高度px; }
  /* 確保總高度 ≤ 100dvh */
}
```

### 行動端除錯檢查清單

- [ ] body overflow: hidden
- [ ] body height: 100dvh
- [ ] topbar flex: 0 0 auto
- [ ] practice flex: 1, min-height: 0
- [ ] guide 內容緊湊
- [ ] controls 固定高度
- [ ] phone-wrap flex: 1
- [ ] 內部 .scroll overflow-y: auto
- [ ] 測試 360×640 最小尺寸

## 效能優化

```mermaid
graph TB
    Optimize[CSS 效能優化]
    
    Optimize --> Minimal[最小化選擇器]
    Optimize --> Hardware[硬體加速]
    Optimize --> Repaint[減少重繪]
    
    Minimal --> Simple[簡單類別選擇器<br/>.class]
    Minimal --> NoDeep[避免深層巢狀<br/>≤ 3 層]
    
    Hardware --> Transform[使用 transform<br/>而非 top/left]
    Hardware --> Opacity[使用 opacity<br/>而非 visibility]
    
    Repaint --> Will[will-change: transform<br/>for animations]
    Repaint --> Contain[contain: layout<br/>for fixed areas]
```

## 無障礙設計

雖然目標使用者是長輩，但仍保持基本無障礙：

- 大按鈕：最小 48×48px
- 高對比：深色文字配淺色背景
- 大字體：行動端 18-20px
- 清晰反饋：提示框、發光效果
- 語音支援：配合 `speak()` 功能

## 總結

style.css 的核心設計理念：

1. **行動端優先**：確保小螢幕完美顯示
2. **無捲軸保證**：100dvh flexbox 布局
3. **清晰視覺**：大按鈕、大字體、高對比
4. **即時反饋**：發光、提示框、動畫
5. **簡潔程式碼**：避免過度複雜的選擇器
