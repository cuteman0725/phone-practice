/* 手機付款練習 — 練習用模擬畫面，不會真的付款。
   全部在瀏覽器裡執行，沒有任何網路連線、沒有收集任何資料。 */
(function () {
  'use strict';

  // ---------- 小工具 ----------
  const $ = (s, r = document) => r.querySelector(s);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('lpp_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('lpp_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const money = n => 'NT$ ' + Number(n).toLocaleString('zh-TW');

  // 假的 QR 碼圖案（只是圖案，掃了也沒有內容）
  function fakeQR(seed) {
    const N = 25; let s = seed || 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    let r = '';
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#000"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#000"/>`;
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (!inFinder(x, y) && rnd() > 0.52) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
    return `<svg viewBox="-1 -1 ${N + 2} ${N + 2}" shape-rendering="crispEdges" aria-label="QR 碼圖案"><rect x="-1" y="-1" width="${N + 2}" height="${N + 2}" fill="#fff"/><g fill="#000">${r}</g>${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</svg>`;
  }
  function fakeBarcode() {
    let x = 0, r = '', s = 3;
    while (x < 200) { s = (s * 7 + 3) % 11; const w = 1 + (s % 3); r += `<rect x="${x}" y="0" width="${w}" height="60"/>`; x += w + 1 + (s % 2) * 2; }
    return `<svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-label="條碼圖案"><g fill="#000">${r}</g></svg>`;
  }

  // ---------- 圖示（自己畫的通用圖示，不是官方商標） ----------
  const I = {
    chat: '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="18" rx="15" ry="12" fill="#fff"/><path d="M12 27 L10 35 L19 29Z" fill="#fff"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1z"/></svg>',
    msg: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M9 4h6l2 2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3z"/><circle cx="12" cy="13" r="4" fill="#e65100"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="#fff"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M5 18l5-6 3 4 2-2 4 4z" fill="#c2185b"/><circle cx="16" cy="8" r="2" fill="#c2185b"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff"/><path d="M12 7v5l3 3" stroke="#37474f" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 5.2v-2.4l-2.4-.5a7 7 0 0 0-.7-1.7l1.4-2-1.7-1.7-2 1.4a7 7 0 0 0-1.7-.7L13.2 3h-2.4l-.5 2.4a7 7 0 0 0-1.7.7l-2-1.4-1.7 1.7 1.4 2a7 7 0 0 0-.7 1.7L3 10.8v2.4l2.4.5c.2.6.4 1.2.7 1.7l-1.4 2 1.7 1.7 2-1.4c.5.3 1.1.5 1.7.7l.5 2.4h2.4l.5-2.4c.6-.2 1.2-.4 1.7-.7l2 1.4 1.7-1.7-1.4-2c.3-.5.5-1.1.7-1.7z"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" fill="#fff"/><rect x="3" y="5" width="18" height="5" fill="#ffcdd2"/><text x="12" y="19" font-size="8" text-anchor="middle" fill="#c62828" font-weight="700">31</text></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    calc: '<svg viewBox="0 0 24 24" fill="#fff"><rect x="5" y="3" width="14" height="18" rx="2"/><rect x="7" y="5" width="10" height="4" fill="#455a64"/><g fill="#455a64"><rect x="7" y="11" width="2.5" height="2.5"/><rect x="11" y="11" width="2.5" height="2.5"/><rect x="15" y="11" width="2" height="2.5"/><rect x="7" y="15" width="2.5" height="2.5"/><rect x="11" y="15" width="2.5" height="2.5"/><rect x="15" y="15" width="2" height="2.5"/></g></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="5" fill="#ffeb3b"/><ellipse cx="14" cy="16" rx="7" ry="4" fill="#fff"/></svg>',
    t_home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>',
    t_chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/></svg>',
    t_post: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/><rect x="7" y="8" width="10" height="2" fill="#fafafa"/><rect x="7" y="12" width="7" height="2" fill="#fafafa"/></svg>',
    t_news: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h13v14H6a2 2 0 0 1-2-2zM18 8h2v9a2 2 0 0 1-2 2z"/></svg>',
    t_wallet: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h13v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="17" cy="14" r="1.6" fill="#fafafa"/></svg>',
    p_pay: '<svg viewBox="0 0 48 48" fill="currentColor"><rect x="4" y="10" width="3" height="28"/><rect x="10" y="10" width="2" height="28"/><rect x="15" y="10" width="4" height="28"/><rect x="22" y="10" width="2" height="28"/><rect x="27" y="10" width="3" height="28"/><rect x="33" y="10" width="2" height="28"/><rect x="38" y="10" width="5" height="28"/></svg>',
    p_scan: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M6 16V8h8M34 8h8v8M42 32v8h-8M14 40H6v-8M10 24h28"/></svg>',
    p_send: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M8 18h30l-8-8M40 30H10l8 8"/></svg>',
    p_add: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><circle cx="24" cy="24" r="17"/><path d="M24 15v18M15 24h18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  // ---------- 資料 ----------
  const MENU = [
    { id: 'beef', name: '牛肉麵', price: 180, pic: '🍜' },
    { id: 'pork', name: '滷肉飯', price: 60, pic: '🍚' },
    { id: 'veg', name: '燙青菜', price: 50, pic: '🥬' },
    { id: 'tea', name: '紅茶', price: 30, pic: '🧋' }
  ];
  const REST = '幸福小館', REST_TABLE = '第 5 桌';
  const SHOP_B = '好味便當', AMOUNT_B = 120;
  const SHOP_C = '巷口豆漿店', AMOUNT_C = 85;

  const S = { scn: null, idx: 0, hints: store.get('hints', true), autoSpeak: store.get('autoSpeak', false), cart: {}, pin: '', amt: '', busy: false };

  const cartTotal = () => MENU.reduce((t, m) => t + (S.cart[m.id] || 0) * m.price, 0);
  const cartCount = () => MENU.reduce((t, m) => t + (S.cart[m.id] || 0), 0);
  const payAmount = () => S.scn === 'A' ? cartTotal() : S.scn === 'B' ? AMOUNT_B : Number(S.amt || 0);
  const payStore = () => S.scn === 'A' ? REST : S.scn === 'B' ? SHOP_B : SHOP_C;

  // ---------- 畫面 ----------
  const app = (name, bg, icon, extra = '') =>
    `<button class="app" ${extra || `data-wrong="這是「${name}」，不是 LINE 喔。請找<b>綠色</b>的 LINE。"`}><span class="ico" style="background:${bg}">${icon}</span><span class="lbl">${name}</span></button>`;

  const SCREENS = {
    home: () => `<div class="scr home">
      <div class="clock"><div class="t" data-clock>10:30</div><div class="d" data-date>10月31日 星期六</div></div>
      <div class="searchbar" data-wrong="這是搜尋列。我們要找<b>綠色</b>的 LINE 圖示喔。">🔍 搜尋</div>
      <div class="grid">
        ${app('日曆', '#e53935', I.cal)}${app('天氣', '#29b6f6', I.sun)}${app('時鐘', '#37474f', I.clock)}${app('計算機', '#607d8b', I.calc)}
        ${app('相簿', '#d81b60', I.photo)}${app('相機', '#ef6c00', I.cam)}${app('設定', '#757575', I.gear)}
        ${app('LINE', '#12a150', I.chat, 'data-t="line"')}
      </div>
      <div class="dock">${app('電話', '#43a047', I.phone)}${app('簡訊', '#1e88e5', I.msg)}${app('瀏覽器', '#5c6bc0', I.globe)}${app('相機', '#ef6c00', I.cam)}</div>
    </div>`,

    lineHome: () => {
      const tab = (k, n, ic) => `<button class="tab${k === 'home' ? ' on' : ''}" ${k === 'wallet' ? 'data-t="wallet"' : `data-wrong="這是「${n}」。請按<b>最右邊</b>的「錢包」。"`}>${ic}<span>${n}</span></button>`;
      const fr = (n, s, c) => `<button class="friend" data-wrong="這是朋友的名字。我們要按<b>右下角</b>的「錢包」喔。"><span class="avatar" style="background:${c}">${n[0]}</span><span>${n}<small>${s}</small></span></button>`;
      return `<div class="scr lhome">
        <div class="appbar"><span class="avatar" style="background:#8d6e63">我</span><span>主頁</span></div>
        <div class="scroll">
          <div class="search-in" data-wrong="這是搜尋。請按<b>右下角</b>的「錢包」。">🔍 搜尋</div>
          <div class="sec-t">好友</div>
          ${fr('女兒 小美', '媽，記得吃飯喔！', '#ec407a')}${fr('兒子 建錩', '週末回家', '#42a5f5')}${fr('家族群組', '(12 人)', '#ffa726')}${fr('里長', '本週活動通知', '#7e57c2')}
        </div>
        <div class="tabs">${tab('home', '主頁', I.t_home)}${tab('chat', '聊天', I.t_chat)}${tab('post', '貼文串', I.t_post)}${tab('news', '新聞', I.t_news)}${tab('wallet', '錢包', I.t_wallet)}</div>
      </div>`;
    },

    wallet: () => `<div class="scr wallet">
      <div class="appbar"><span>錢包</span></div>
      <div class="scroll">
        <button class="pay-card" data-t="linepay"><div class="pc-t">LINE Pay</div><div class="pc-s">付款、掃描、轉帳都在這裡 ›</div></button>
        <button class="w-item" data-wrong="這是點數。請按上面綠色的「LINE Pay」。"><span class="dot" style="background:#fff3cd">⭐</span>我的點數</button>
        <button class="w-item" data-wrong="這是優惠券。請按上面綠色的「LINE Pay」。"><span class="dot" style="background:#fde2e4">🎟️</span>優惠券</button>
        <button class="w-item" data-wrong="這是會員卡。請按上面綠色的「LINE Pay」。"><span class="dot" style="background:#e3f2fd">💳</span>會員卡</button>
      </div>
    </div>`,

    payHome: () => {
      const pb = (k, n, ic) => {
        const st = step();
        const attr = st.target === k ? `data-t="${k}"` : `data-wrong="這是「${n}」。這一步請按「${st.target === 'pay' ? '付款' : '掃描'}」。"`;
        return `<button class="pbtn" ${attr}>${ic}<span>${n}</span></button>`;
      };
      return `<div class="scr payhome">
        <div class="appbar green"><span class="back">‹</span><span>LINE Pay</span></div>
        <div class="scroll">
          <div class="bal"><div class="k">餘額（練習用）</div><div class="v">NT$ 2,000</div></div>
          <div class="pbtns">${pb('pay', '付款', I.p_pay)}${pb('scan', '掃描', I.p_scan)}${pb('send', '轉帳', I.p_send)}${pb('topup', '儲值', I.p_add)}</div>
          <div class="promo">🔒 小提醒：密碼不要告訴別人。</div>
        </div>
      </div>`;
    },

    cameraTable: () => `<div class="scr camera">
      <div class="appbar"><span class="back">‹</span><span>掃描</span></div>
      <div class="cam-view" data-wrong="請按<b>中間</b>白色卡片上的 QR 碼（黑白小方格）。">
        <div class="tent"><div class="tt">掃碼點餐</div><div class="ts">${REST}・${REST_TABLE}</div>
          <button class="qr" data-t="qr">${fakeQR(11)}</button></div>
        <div class="finder"></div>
      </div>
      <div class="cam-tip">把 QR 碼放進白色框框裡</div>
    </div>`,

    cameraStore: () => `<div class="scr camera">
      <div class="appbar"><span class="back">‹</span><span>掃描</span></div>
      <div class="cam-view" data-wrong="請按<b>中間</b>白色牌子上的 QR 碼（黑白小方格）。">
        <div class="tent" style="transform:rotate(2deg)"><div class="tt" style="color:#0b8f3e">掃碼付款</div><div class="ts">${SHOP_C}</div>
          <button class="qr" data-t="qr">${fakeQR(29)}</button></div>
        <div class="finder"></div>
      </div>
      <div class="cam-tip">把 QR 碼放進白色框框裡</div>
    </div>`,

    menu: () => {
      const st = step();
      const rows = MENU.map(m => {
        const q = S.cart[m.id] || 0;
        const tAttr = st.target === 'add-' + m.id ? ` data-t="add-${m.id}"` : '';
        return `<div class="dish"><span class="pic" aria-hidden="true">${m.pic}</span>
          <span class="info"><div class="nm">${m.name}</div><div class="pr">${money(m.price)}</div></span>
          <span class="qty">${q ? `<button class="minus" data-act="minus" data-id="${m.id}" aria-label="少一份">−</button><span class="qn">${q}</span>` : ''}
          <button class="add" data-act="add" data-id="${m.id}"${tAttr}>加入</button></span></div>`;
      }).join('');
      const n = cartCount();
      return `<div class="scr menu">
        <div class="appbar"><span>${REST}</span><small>${REST_TABLE}・掃碼點餐</small></div>
        <div class="scroll">${rows}</div>
        <div class="cartbar"><div class="sum">${n ? `已點 ${n} 份<br><b>${money(cartTotal())}</b>` : '還沒點菜'}</div>
          <button class="go${n ? '' : ' off'}" data-t="checkout">去結帳</button></div>
      </div>`;
    },

    checkout: () => {
      const items = MENU.filter(m => S.cart[m.id]).map(m => `<div class="row"><span>${m.name} × ${S.cart[m.id]}</span><span>${money(m.price * S.cart[m.id])}</span></div>`).join('');
      return `<div class="scr co menu">
        <div class="appbar"><span>確認訂單</span><small>${REST}・${REST_TABLE}</small></div>
        <div class="scroll">
          <div class="box">${items}<div class="row total"><span>總共</span><span>${money(cartTotal())}</span></div></div>
          <div class="sec-t" style="padding:0 2px 8px;font-size:20px">選擇付款方式</div>
          <button class="pm" data-wrong="今天我們練習用 LINE Pay 付錢，請按<b>綠色</b>的「LINE Pay」。"><span class="dot" style="background:#8d6e63">$</span>現金（到櫃台付）</button>
          <button class="pm" data-wrong="今天我們練習用 LINE Pay 付錢，請按<b>綠色</b>的「LINE Pay」。"><span class="dot" style="background:#5c6bc0">卡</span>信用卡</button>
          <button class="pm lp" data-t="pm-linepay"><span class="dot" style="background:#12a150">Pay</span>LINE Pay</button>
        </div>
      </div>`;
    },

    confirm: () => `<div class="scr lp-page">
      <div class="appbar green"><span>LINE Pay 付款</span></div>
      <div class="scroll">
        <div class="paybox"><div class="to">付款給</div><div class="store">${payStore()}</div>
          <div class="amt">${money(payAmount())}</div><div class="via">付款方式：LINE Pay 餘額（練習用）</div></div>
        <button class="cta" data-t="confirm">確認付款</button>
        <button class="cta grey" data-wrong="先不要取消喔。金額對的話，請按<b>綠色</b>的「確認付款」。">取消</button>
      </div>
    </div>`,

    pin: () => {
      const dots = Array.from({ length: 6 }, (_, i) => `<i class="${i < S.pin.length ? 'f' : ''}"></i>`).join('');
      return `<div class="scr lp-page">
        <div class="appbar green"><span>輸入密碼</span></div>
        <div class="pin-t">請輸入 LINE Pay 密碼</div>
        <div class="dots" aria-label="已輸入 ${S.pin.length} 個數字">${dots}</div>
        <div class="pin-note">練習用：隨便按 6 個數字就可以。<br>真的密碼不要給別人看！</div>
        ${keypad('pin')}
      </div>`;
    },

    amount: () => `<div class="scr lp-page">
      <div class="appbar green"><span>付款給 ${SHOP_C}</span></div>
      <div class="pin-t" style="font-size:21px">請輸入要付的金額</div>
      <div class="amt-disp"><span class="cur">NT$</span>${S.amt || '0'}</div>
      <div style="padding:4px 8px"><button class="cta" data-t="amount-ok" style="margin:0">下一步</button></div>
      ${keypad('amt')}
    </div>`,

    payCode: () => `<div class="scr lp-page">
      <div class="appbar green"><span class="back">‹</span><span>付款碼</span></div>
      <div class="scroll">
        <div class="code-card" data-wrong="這個畫面是要給店員看的。請按下面藍色的「模擬：店員掃描」。">
          <div class="barcode">${fakeBarcode()}</div>
          <div class="code-num">0000 1234 5678 練習</div>
          <div class="qr">${fakeQR(5)}</div>
          <div class="code-note">把這個畫面給店員掃描<br>（練習用假條碼，不能真的付款）</div>
        </div>
        <button class="cashier" data-t="cashier">👩‍💼 模擬：店員掃描</button>
      </div>
    </div>`,

    success: () => {
      const d = new Date();
      const t = `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return `<div class="scr ok-page">
        <div class="appbar green"><span>LINE Pay</span></div>
        <div class="scroll" data-neutral>
          <div class="check">${I.check}</div>
          <div class="ok-t">付款完成</div>
          <div class="ok-amt">${money(payAmount())}</div>
          <div class="ok-meta">付款給：${payStore()}<br>時間：${t}</div>
          <div class="ok-practice">這是練習，沒有真的扣錢 😊</div>
        </div>
      </div>`;
    }
  };

  function keypad(kind) {
    const k = d => `<button class="key" data-act="${kind}" data-d="${d}">${d}</button>`;
    return `<div class="keypad" data-neutral data-glow>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k).join('')}<span class="key blank"></span>${k(0)}<button class="key" data-act="${kind}" data-d="del" aria-label="刪除">⌫</button></div>`;
  }

  // ---------- 練習流程 ----------
  const COMMON = [
    { screen: 'home', target: 'line', say: '這是手機的桌面。請按<span class="em">綠色的「LINE」</span>圖示。' },
    { screen: 'lineHome', target: 'wallet', say: '打開 LINE 了！請按<span class="em">右下角的「錢包」</span>。' },
    { screen: 'wallet', target: 'linepay', say: '請按上面<span class="em">綠色的「LINE Pay」</span>。' }
  ];
  const PIN_STEP = { screen: 'pin', target: null, glow: '[data-glow]', enter() { S.pin = ''; },
    say: '請輸入<span class="em">6 個數字</span>的密碼。（練習用，隨便按 6 個數字）' };

  const SCENARIOS = {
    A: { name: '在餐廳掃碼點餐', steps: [...COMMON,
      { screen: 'payHome', target: 'scan', say: '坐好後，桌上會有 QR 碼。請按<span class="em">「掃描」</span>。' },
      { screen: 'cameraTable', target: 'qr', say: '把手機對準桌上的 QR 碼。請按畫面中間的<span class="em">QR 碼</span>。' },
      { screen: 'menu', target: 'add-beef', say: '這是點菜的畫面。請按「牛肉麵」旁邊的<span class="em">「加入」</span>。' },
      { screen: 'menu', target: 'checkout', check: () => cartCount() > 0 || '還沒有點菜喔，請先按一道菜的「加入」。',
        say: '想吃別的，可以再按「加入」。點好了，請按右下角的<span class="em">「去結帳」</span>。' },
      { screen: 'checkout', target: 'pm-linepay', say: '看一下點的菜。付款方式請按<span class="em">「LINE Pay」</span>。' },
      { screen: 'confirm', target: 'confirm', say: () => `看一下金額是 ${payAmount()} 元，沒問題請按<span class="em">「確認付款」</span>。` },
      PIN_STEP,
      { screen: 'success', final: true, say: '🎉 太棒了！付款完成了！餐點等一下就會送來。' }
    ] },
    B: { name: '在櫃台付款', steps: [...COMMON,
      { screen: 'payHome', target: 'pay', say: `要結帳了（${AMOUNT_B} 元）。請按<span class="em">「付款」</span>。` },
      { ...PIN_STEP, say: '要先輸入密碼，才會出現付款碼。請按<span class="em">6 個數字</span>。（練習用，隨便按）' },
      { screen: 'payCode', target: 'cashier', delay: 1500, say: '把這個畫面拿給店員看，店員會用機器掃。請按<span class="em">「模擬：店員掃描」</span>。' },
      { screen: 'success', final: true, say: '🎉 太棒了！店員掃好了，付款完成！' }
    ] },
    C: { name: '掃店家的 QR 碼付款', steps: [...COMMON,
      { screen: 'payHome', target: 'scan', say: '櫃台貼著店家的 QR 碼。請按<span class="em">「掃描」</span>。' },
      { screen: 'cameraStore', target: 'qr', say: '對準櫃台的 QR 碼。請按畫面中間的<span class="em">QR 碼</span>。' },
      { screen: 'amount', target: 'amount-ok', glow: '[data-glow]', enter() { S.amt = ''; },
        check: () => Number(S.amt) > 0 || `請先輸入金額：按「8」再按「5」。`,
        say: `老闆說要 ${AMOUNT_C} 元。請按<span class="em">「8」和「5」</span>，再按<span class="em">「下一步」</span>。` },
      { screen: 'confirm', target: 'confirm', say: () => `看一下金額是 ${payAmount()} 元，店名也對，請按<span class="em">「確認付款」</span>。` },
      PIN_STEP,
      { screen: 'success', final: true, say: '🎉 太棒了！你自己掃碼付款成功了！' }
    ] }
  };

  const steps = () => SCENARIOS[S.scn].steps;
  const step = () => steps()[S.idx];
  const sayText = st => (typeof st.say === 'function' ? st.say() : st.say);
  const plain = html => html.replace(/<[^>]+>/g, '').replace(/[（）()「」🎉😊👍]/g, ' ');

  const el = {
    start: $('#start'), practice: $('#practice'), screen: $('#screen'), phone: $('#phone'), instr: $('#instr'),
    progress: $('#progress'), bar: $('#bar'), scnName: $('#scnName'), toast: $('#toast'), done: $('#done'),
    menuBtn: $('#btnMenu'), hintBtn: $('#btnHint'), speakBtn: $('#btnSpeak'), prevBtn: $('#btnPrev')
  };

  function render(keepScroll) {
    const st = step();
    const sc = el.screen.querySelector('.scroll');
    const top = keepScroll && sc ? sc.scrollTop : 0;
    el.screen.innerHTML = SCREENS[st.screen]();
    const sc2 = el.screen.querySelector('.scroll');
    if (sc2) sc2.scrollTop = top;
    const total = steps().length;
    el.progress.textContent = `第 ${S.idx + 1} 步 / 共 ${total} 步`;
    el.bar.style.width = ((S.idx + 1) / total * 100) + '%';
    el.scnName.textContent = SCENARIOS[S.scn].name;
    el.instr.innerHTML = sayText(st);
    el.done.hidden = !st.final;
    el.prevBtn.disabled = S.idx === 0;
    applyGlow(S.hints);
    if (!keepScroll) {
      const g = glowTarget();
      if (g && g.scrollIntoView) g.scrollIntoView({ block: 'nearest' });
    }
    updateClock();
  }

  function glowTarget() {
    const st = step();
    if (st.final) return null;
    if (st.glow) return el.screen.querySelector(st.glow);
    return st.target ? el.screen.querySelector(`[data-t="${st.target}"]`) : null;
  }
  function applyGlow(on) {
    el.screen.querySelectorAll('.glow').forEach(e => e.classList.remove('glow'));
    if (!on) return;
    const st = step();
    const g = glowTarget();
    if (g) g.classList.add('glow');
    // 輸入金額那一步：輸入後讓「下一步」也發亮
    if (st.screen === 'amount' && Number(S.amt) > 0) { const b = el.screen.querySelector('[data-t="amount-ok"]'); if (b) b.classList.add('glow'); }
  }

  let toastTimer, glowTimer;
  function toast(html, good) {
    el.toast.innerHTML = html;
    // 提示框不要蓋住要按的地方：要按的在下半部，提示就放上面
    const g = S.scn ? glowTarget() : null;
    let top = !!good;
    if (g && !good) { const pr = el.phone.getBoundingClientRect(), r = g.getBoundingClientRect(); top = (r.top + r.height / 2) > (pr.top + pr.height / 2); }
    el.toast.className = 'toast' + (good ? ' good' : '') + (top ? ' at-top' : '');
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.toast.hidden = true; }, good ? 900 : 3500);
  }

  function go(i) {
    S.idx = Math.max(0, Math.min(i, steps().length - 1));
    const st = step();
    if (st.enter) st.enter();
    S.busy = false;
    render(false);
    if (S.autoSpeak) speak();
  }
  function next() { go(S.idx + 1); }

  function success() {
    const st = step();
    if (S.busy) return;
    if (st.check) { const r = st.check(); if (r !== true) { toast('💡 ' + r); applyGlow(true); return; } }
    S.busy = true;
    if (st.delay) {
      const ov = document.createElement('div');
      ov.className = 'scanning';
      ov.innerHTML = '<div class="scanline"></div><div>店員正在掃描…</div>';
      el.screen.appendChild(ov);
      setTimeout(next, st.delay);
      return;
    }
    toast('👍 很好！', true);
    setTimeout(next, 250);
  }

  function wrong(target) {
    const w = target && target.closest('[data-wrong]');
    const msg = w ? w.dataset.wrong : '沒關係，再試一次。';
    toast('😊 ' + msg + (S.hints ? '<br>會<b>發亮</b>的地方就是要按的。' : ''));
    // 提示關閉時，按錯也暫時發亮幫忙一下
    if (!S.hints) { applyGlow(true); clearTimeout(glowTimer); glowTimer = setTimeout(() => { if (!S.hints) applyGlow(false); }, 4000); }
  }

  const ACTIONS = {
    add(b) {
      const id = b.dataset.id;
      S.cart[id] = (S.cart[id] || 0) + 1;
      if (step().target === 'add-' + id) { success(); return; }
      render(true);
    },
    minus(b) {
      const id = b.dataset.id;
      S.cart[id] = Math.max(0, (S.cart[id] || 0) - 1);
      render(true);
    },
    pin(b) {
      if (S.busy) return;
      const d = b.dataset.d;
      if (d === 'del') S.pin = S.pin.slice(0, -1); else if (S.pin.length < 6) S.pin += d;
      render(true);
      if (S.pin.length === 6) { S.busy = true; toast('👍 密碼輸入好了！', true); setTimeout(next, 700); }
    },
    amt(b) {
      const d = b.dataset.d;
      if (d === 'del') S.amt = S.amt.slice(0, -1);
      else if (S.amt.length < 5 && !(S.amt === '' && d === '0')) S.amt += d;
      render(true);
    }
  };

  el.phone.addEventListener('click', e => {
    if (!S.scn) return;
    const st = step();
    const act = e.target.closest('[data-act]');
    if (act && el.screen.contains(act)) { ACTIONS[act.dataset.act](act); return; }
    const t = e.target.closest('[data-t]');
    if (t && st.target && t.dataset.t === st.target) { success(); return; }
    if (st.final || S.busy) return;
    const explicitWrong = e.target.closest('[data-wrong]');
    if (!explicitWrong && e.target.closest('[data-neutral]')) return;
    wrong(e.target);
  });

  // ---------- 朗讀 ----------
  const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let voice = null;
  function pickVoice() {
    if (!canSpeak) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /zh[-_]TW/i.test(v.lang)) || vs.find(v => /zh[-_](Hant|HK)/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
  }
  if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text) {
    if (!canSpeak) { toast('這台裝置不支援朗讀，請看上面的字。'); return; }
    const u = new SpeechSynthesisUtterance(plain(text || sayText(step())));
    u.lang = 'zh-TW'; if (voice) u.voice = voice; u.rate = 0.85;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  if (!canSpeak) { el.speakBtn.disabled = true; el.speakBtn.innerHTML = '🔇<br>不支援朗讀'; }

  // ---------- 按鈕 ----------
  function setHints(v) {
    S.hints = v; store.set('hints', v);
    el.hintBtn.setAttribute('aria-pressed', v); el.hintBtn.innerHTML = `💡<br>提示：${v ? '開' : '關'}`;
    const o = $('#optHint'); o.setAttribute('aria-pressed', v); o.textContent = `💡 提示：${v ? '開' : '關'}`;
    if (S.scn) applyGlow(v);
  }
  function setAutoSpeak(v) {
    S.autoSpeak = v; store.set('autoSpeak', v);
    const o = $('#optSpeak'); o.setAttribute('aria-pressed', v); o.textContent = `🔊 自動唸出說明：${v ? '開' : '關'}`;
  }
  function startScenario(k) {
    S.scn = k; S.cart = {}; S.pin = ''; S.amt = '';
    el.start.hidden = true; el.practice.hidden = false; el.menuBtn.hidden = false;
    try { history.replaceState(null, '', '#' + k); } catch (e) { /* file:// */ }
    window.scrollTo(0, 0);
    go(0);
  }
  function showMenu() {
    S.scn = null; if (canSpeak) speechSynthesis.cancel();
    el.practice.hidden = true; el.start.hidden = false; el.menuBtn.hidden = true;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
  }

  document.querySelectorAll('[data-scn]').forEach(b => b.addEventListener('click', () => startScenario(b.dataset.scn)));
  $('#btnPrev').addEventListener('click', () => { if (S.idx > 0) go(S.idx - 1); });
  $('#btnRestart').addEventListener('click', () => startScenario(S.scn));
  $('#btnAgain').addEventListener('click', () => startScenario(S.scn));
  $('#btnOther').addEventListener('click', showMenu);
  el.menuBtn.addEventListener('click', showMenu);
  el.hintBtn.addEventListener('click', () => setHints(!S.hints));
  $('#optHint').addEventListener('click', () => setHints(!S.hints));
  $('#optSpeak').addEventListener('click', () => setAutoSpeak(!S.autoSpeak));
  el.speakBtn.addEventListener('click', () => speak());

  function updateClock() {
    const d = new Date(), hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    $('#sbTime').textContent = hm;
    const c = el.screen.querySelector('[data-clock]'); if (c) c.textContent = hm;
    const dd = el.screen.querySelector('[data-date]');
    if (dd) dd.textContent = `${d.getMonth() + 1}月${d.getDate()}日 星期${'日一二三四五六'[d.getDay()]}`;
  }
  setInterval(updateClock, 30000);

  setHints(S.hints); setAutoSpeak(S.autoSpeak);
  const h = location.hash.replace('#', '');
  if (SCENARIOS[h]) startScenario(h);

  // 給測試用（不影響使用）
  window.__lpp = { S, step: () => step(), SCENARIOS };
})();
