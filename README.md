# 手機練習（LINE 模擬畫面）

給長輩練習「用 Android 手機的 LINE Pay 付錢、分享位置」的網站。
**這是練習用模擬畫面，不會真的付款或傳送資料**：完全不連網路、不收集任何資料，密碼隨便按都可以。

## 有哪些練習

### 💳 付款練習
| 練習 | 步驟 |
|---|---|
| 🍜 在餐廳掃碼點餐（11 步） | 手機桌面 → 按 LINE → 錢包 → LINE Pay → 掃描 → 掃桌上 QR 碼 → 加入牛肉麵 → 去結帳 → 選 LINE Pay → 確認付款 → 輸入 6 位數密碼 → 付款完成 |
| 🧾 在櫃台付款（7 步） | 手機桌面 → LINE → 錢包 → LINE Pay → 付款 → 輸入密碼 → 出示付款碼（模擬店員掃描）→ 付款完成 |
| 📷 掃店家的 QR 碼付款（9 步） | 手機桌面 → LINE → 錢包 → LINE Pay → 掃描 → 掃櫃台 QR 碼 → 輸入金額 85 → 確認付款 → 輸入密碼 → 付款完成 |

### 📍 位置分享練習
| 練習 | 步驟 |
|---|---|
| 📍 傳送我現在的位置（8 步） | 手機桌面 → LINE → 聊天 → 打開家人群組 → 按 ＋ → 位置資訊 → 允許權限 → 分享/傳送 → 位置傳送完成 |
| 🗺️ 傳送一個地址（10 步） | 手機桌面 → LINE → 聊天 → 打開家人群組 → 按 ＋ → 位置資訊 → 搜尋地點 → 選臺北車站 → 分享/傳送 → 位置傳送完成 |

### 💬 用 LINE 聊天
| 練習 | 步驟 |
|---|---|
| ✍️ 在群組接龍留名字（13 步） | 手機桌面 → LINE → 聊天 → 社區團購群 → 長按最新接龍訊息 → 複製 → 按輸入框 → 長按輸入框 → 貼上 → 按換行鍵 → 輸入「11.」→ 輸入「小蓉」→ 傳送 → 接龍完成 |

每一步上方都有大字說明，要按的地方會**發亮**；按錯只會出現溫和的提示。
下方按鈕：「上一步」、「從頭再練一次」、「提示：開/關」（熟練後可以關掉提示自己試）、「唸給我聽」（用手機/電腦內建的中文語音唸出說明）。

小技巧：網址後面加 `#A`、`#B`、`#C`、`#D`、`#E`、`#F` 可以直接開啟某個練習，例如 `https://你的帳號.github.io/phone-practice/#A`。

## 檔案
- `index.html`、`style.css`、`script.js`：網站本體（不需要安裝、不需要編譯）
- `index.md`：index.html 的架構說明與 Mermaid 圖表
- `style.md`：style.css 的設計說明與 Mermaid 圖表
- `script.md`：script.js 的邏輯說明與 Mermaid 圖表
- `.nojekyll`：GitHub Pages 設定檔

## 用 GitHub Pages 發布成網站
1. 登入 <https://github.com>，右上角「+」→ **New repository**。
2. Repository name 填 `linepay-practice`，選 **Public**，按 **Create repository**。
3. 在新的 repo 頁面按 **uploading an existing file**（或 Add file → Upload files），把 `index.html`、`style.css`、`script.js`、`.nojekyll`、`README.md` 拖進去，按 **Commit changes**。（檔案要放在最外層，不要包在資料夾裡。）
4. 到 repo 的 **Settings → Pages**。
5. 「Build and deployment」的 Source 選 **Deploy from a branch**，Branch 選 **main**、資料夾選 **/ (root)**，按 **Save**。
6. 等 1～2 分鐘，重新整理該頁，上方會出現網址：`https://你的帳號.github.io/linepay-practice/`。
7. 把網址用 LINE 傳給媽媽，在手機上打開後可以「加到主畫面」，以後點一下就能練習。

## 在自己電腦上試
直接用瀏覽器打開 `index.html` 即可；或在資料夾裡執行 `python3 -m http.server`，再開 <http://localhost:8000>。

## 注意
- 畫面是「類似」LINE / LINE Pay 的簡化示意，圖示都是自己畫的，不是官方商標；真實 App 的按鈕位置、文字可能因版本更新而不同。
- 真實的餐廳掃碼點餐，有些店是用手機相機或 LINE 主畫面的掃描器開啟點餐網頁，最後再跳到 LINE Pay 付款；練習的重點是「掃碼 → 點菜 → 選 LINE Pay → 確認金額 → 輸入密碼」。
- 位置分享使用模擬的地圖和位置資料，不會真的取用裝置定位或傳送任何資訊到網路。
- 「唸給我聽」需要裝置有中文語音；部分瀏覽器沒有台灣中文語音時，會用其他中文語音或無法朗讀。
