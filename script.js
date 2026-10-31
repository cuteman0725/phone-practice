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
  function gboardZhuyin(mode) {
    const canEnter = mode === 'pasted';
    const kb = (k, t) => `<button class="gb-key" ${t ? `data-t="${t}"` : 'data-wrong="這個鍵現在不用按。請看指示。"'}>${k}</button>`;
    const enter = canEnter ? `<button class="gb-key gb-enter" data-t="enter-key">換行<br>↵</button>` : `<button class="gb-key gb-enter" data-wrong="還沒貼上喔。">換行<br>↵</button>`;
    const sw123 = mode === 'newline' ? `<button class="gb-key gb-sw" data-t="switch-123">符號<br>123</button>` : `<button class="gb-key gb-sw" data-wrong="還不用切換。">符號<br>123</button>`;
    return `<div class="gboard">
      <div class="gb-row">${kb('ㄅ')}${kb('ㄆ')}${kb('ㄇ')}${kb('ㄈ')}${kb('ㄉ')}${kb('ㄊ')}${kb('ㄋ')}${kb('ㄌ')}${kb('ㄍ')}${kb('ㄎ')}</div>
      <div class="gb-row">${kb('ㄏ')}${kb('ㄐ')}${kb('ㄑ')}${kb('ㄒ')}${kb('ㄓ')}${kb('ㄔ')}${kb('ㄕ')}${kb('ㄖ')}${kb('ㄗ')}${kb('ㄘ')}</div>
      <div class="gb-row">${kb('ㄙ')}${kb('ㄧ')}${kb('ㄨ')}${kb('ㄩ')}${kb('ㄚ')}${kb('ㄛ')}${kb('ㄜ')}${kb('ㄝ')}${kb('ㄞ')}${kb('ㄟ')}</div>
      <div class="gb-row">${sw123}${kb('ㄠ')}${kb('ㄡ')}${kb('ㄢ')}${kb('ㄣ')}${kb('ㄤ')}${kb('ㄥ')}${kb('ㄦ')}${kb('ˊ')}${kb('ˇ')}${kb('ˋ')}<button class="gb-key gb-del" data-wrong="還不用刪除。">⌫</button></div>
      <div class="gb-row"><button class="gb-key gb-space" data-wrong="還不用空白。">空白鍵</button>${enter}</div>
    </div>`;
  }
  function gboardNum() {
    const kb = (k, act) => `<button class="gb-key" data-act="${act}" data-v="${k}">${k}</button>`;
    const numKeys = '1234567890'.split('').map(n => kb(n, 'input')).join('');
    return `<div class="gboard">
      <div class="gb-row">${numKeys}</div>
      <div class="gb-row">${kb('.', 'input')}${kb(',', 'input')}${kb('?', 'input')}${kb('!', 'input')}</div>
      <div class="gb-row"><button class="gb-key gb-sw" data-act="switch-zh">中文</button><button class="gb-key gb-space">空白鍵</button><button class="gb-key gb-del">⌫</button></div>
    </div>`;
  }
  function gboardZhuyinWithCand(which, cand) {
    const keys = which === 'xiao' ? CHAIN_USER_NAME_ZHUYIN[0].keys : CHAIN_USER_NAME_ZHUYIN[1].keys;
    const target = which === 'xiao' ? 'type-xiao' : 'type-rong';
    const char = which === 'xiao' ? '小' : '蓉';
    const kb = (k, isTarget) => `<button class="gb-key" ${isTarget ? `data-act="zhuyin" data-v="${k}"` : 'data-wrong="請按指示的注音鍵。"'}>${k}</button>`;
    const candBtn = (c, isTarget) => `<button class="gb-cand" ${isTarget ? `data-t="${target}" data-v="${c}"` : 'data-wrong="請選正確的字。"'}>${c}</button>`;
    const zhuyinKeys = 'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦˊˇˋ'.split('');
    const row1 = zhuyinKeys.slice(0,10).map(k => kb(k, keys.includes(k))).join('');
    const row2 = zhuyinKeys.slice(10,20).map(k => kb(k, keys.includes(k))).join('');
    const row3 = zhuyinKeys.slice(20,30).map(k => kb(k, keys.includes(k))).join('');
    const row4 = `<button class="gb-key gb-sw">符號</button>${zhuyinKeys.slice(30,38).map(k => kb(k, keys.includes(k))).join('')}${zhuyinKeys.slice(38).map(k => kb(k, keys.includes(k))).join('')}<button class="gb-key gb-del">⌫</button>`;
    return `<div class="gboard">
      ${cand.length ? `<div class="gb-cand-bar">${cand.map(c => candBtn(c, c === char)).join('')}</div>` : ''}
      <div class="gb-row">${row1}</div>
      <div class="gb-row">${row2}</div>
      <div class="gb-row">${row3}</div>
      <div class="gb-row">${row4}</div>
      <div class="gb-row"><button class="gb-key gb-space">空白鍵</button><button class="gb-key gb-enter">換行 ↵</button></div>
    </div>`;
  }

  const I = {
    reply: '<svg viewBox="0 0 24 24"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
    forward: '<svg viewBox="0 0 24 24"><path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z"/></svg>',
    keep: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
    screenshot: '<svg viewBox="0 0 24 24"><path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM17 19H7V5h10v14z"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
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
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="11"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>',
    location: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="#e53935"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="10" cy="10" r="7"/><path d="M15 15l6 6"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>'
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
  
  // 接龍配置（可輕鬆修改）
  const CHAIN_USER_NAME = '小蓉';
  const CHAIN_USER_NAME_ZHUYIN = [
    { keys: ['ㄒ', 'ㄧ', 'ㄠ', 'ˇ'], char: '小' },
    { keys: ['ㄖ', 'ㄨ', 'ㄥ', 'ˊ'], char: '蓉' }
  ];
  const CHAIN_INITIAL = [
    '【團購】臺南愛文芒果 要的請接龍',
    '1. 美玲',
    '2. 阿芳',
    '3. 建國',
    '4. 秀英',
    '5. 志明',
    '6. 淑芬',
    '7. 雅文',
    '8. 俊傑',
    '9. 麗華',
    '10. 家豪'
  ].join('\n');

  const S = { scn: null, idx: 0, hints: store.get('hints', true), autoSpeak: store.get('autoSpeak', false), cart: {}, pin: '', amt: '', busy: false, locationSent: false, locAddr: '', searchText: '', chainInput: '', zhuyinBuf: '', pasteMenuExpanded: false };

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
      const st = step();
      const isChat = st && (st.target === 'chat-tab' || st.screen === 'lineChat');
      const tab = (k, n, ic) => {
        let attr = '';
        if (k === 'wallet') attr = 'data-t="wallet"';
        else if (k === 'chat' && st && st.target === 'chat-tab') attr = 'data-t="chat-tab"';
        else if (k === 'wallet' || (k === 'chat' && isChat)) attr = `data-wrong="這是「${n}」。請按${isChat ? '<b>「聊天」</b>' : '<b>右下角的「錢包」</b>'}。"`;
        else attr = `data-wrong="這是「${n}」。請按${isChat ? '<b>左邊的「聊天」</b>' : '<b>右下角的「錢包」</b>'}。"`;
        return `<button class="tab${k === 'home' ? ' on' : ''}" ${attr}>${ic}<span>${n}</span></button>`;
      };
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

    lineChat: () => {
      const st = step();
      const isGroup = S.scn === 'F';
      const target = isGroup ? 'open-group' : 'open-chat';
      const targetName = isGroup ? '社區團購群' : '家人群組';
      const ch = (n, msg, t, c, isTarget) => `<button class="chat-item" ${isTarget ? `data-t="${target}"` : `data-wrong="這不是我們要開的聊天。請按「${targetName}」。"`}><span class="avatar" style="background:${c}">${n[0]}</span><div class="chat-info"><div class="chat-name">${n}</div><div class="chat-msg">${msg}</div></div><div class="chat-time">${t}</div></button>`;
      return `<div class="scr lhome">
        <div class="appbar"><span>聊天</span></div>
        <div class="scroll">
          <div class="search-in" data-wrong="這是搜尋。請按下面的「${targetName}」。">🔍 搜尋</div>
          ${isGroup ? ch('社區團購群 (48)', '家豪：【團購】臺南愛文芒果...', '09:35', '#ff9800', true) : ''}
          ${ch('家人群組', '兒子 建錩：週末回家', '10:15', '#ffa726', !isGroup)}
          ${ch('女兒 小美', '媽，記得吃飯喔！', '昨天', '#ec407a', false)}
          ${ch('同學會', '(5 人)', '週三', '#7e57c2', false)}
        </div>
        <div class="tabs"><button class="tab" data-wrong="這是「主頁」。">${I.t_home}<span>主頁</span></button><button class="tab on">${I.t_chat}<span>聊天</span></button><button class="tab" data-wrong="這是「貼文串」。">${I.t_post}<span>貼文串</span></button><button class="tab" data-wrong="這是「新聞」。">${I.t_news}<span>新聞</span></button><button class="tab" data-wrong="這是「錢包」。">${I.t_wallet}<span>錢包</span></button></div>
      </div>`;
    },

    groupChat: () => {
      const msg = (txt, isMe, time) => `<div class="msg ${isMe ? 'msg-me' : 'msg-other'}"><div class="msg-bubble">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      const chainMsg = (txt, time, canPress) => `<div class="msg msg-other" ${canPress ? 'data-t="long-press-msg"' : 'data-wrong="這是舊的接龍。請長按<b>最下面最新的</b>。"'}><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll">
          ${msg('大家好，這週有愛文芒果團購', false, '09:15')}
          ${chainMsg(CHAIN_INITIAL.split('\n').slice(0, 6).join('\n'), '09:16', false)}
          ${msg('我要一箱！', false, '09:20')}
          ${chainMsg(CHAIN_INITIAL.split('\n').slice(0, 9).join('\n'), '09:25', false)}
          ${msg('還有名額嗎？', false, '09:30')}
          ${chainMsg(CHAIN_INITIAL, '09:35', true)}
        </div>
        <div class="chat-input-bar">
          <button class="chat-plus" data-wrong="不用 ＋。請<b>長按</b>最下面的接龍訊息。">${I.plus}</button>
          <div class="chat-input" data-wrong="先長按上面的接龍訊息。">輸入訊息</div>
          <button class="chat-send" data-wrong="還沒輸入。請先長按上面的接龍訊息。">${I.send}</button>
        </div>
      </div>`;
    },

    lineLongPress: () => `<div class="scr line-menu">
      <div class="menu-overlay" data-wrong="請按下面選單的「複製」。"></div>
      <div class="line-menu-popup">
        <button class="line-menu-item" data-wrong="這是「回覆」。我們要按「複製」。">${I.reply}<span>回覆</span></button>
        <button class="line-menu-item" data-t="copy-item">${I.copy}<span>複製</span></button>
        <button class="line-menu-item" data-wrong="這是「轉傳」。我們要按「複製」。">${I.forward}<span>轉傳</span></button>
        <button class="line-menu-item" data-wrong="這是「Keep」。我們要按「複製」。">${I.keep}<span>Keep</span></button>
        <button class="line-menu-item" data-wrong="這是「截圖」。我們要按「複製」。">${I.screenshot}<span>截圖</span></button>
        <button class="line-menu-item" data-wrong="這是「刪除」。我們要按「複製」。">${I.trash}<span>刪除</span></button>
      </div>
    </div>`,

    groupChatCopied: () => {
      const msg = (txt, time) => `<div class="msg msg-other"><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll">${msg(CHAIN_INITIAL, '09:35')}</div>
        <div class="chat-input-bar">
          <button class="chat-plus" data-wrong="不用 ＋。請按下面的輸入框。">${I.plus}</button>
          <div class="chat-input" data-t="input-box">輸入訊息</div>
          <button class="chat-send" data-wrong="還沒輸入。請先按輸入框。">${I.send}</button>
        </div>
        <div class="toast-copied">已複製</div>
      </div>`;
    },

    groupChatKeyboard: () => {
      const msg = (txt, time) => `<div class="msg msg-other"><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll scroll-kb">${msg(CHAIN_INITIAL, '09:35')}</div>
        <div class="chat-input-bar-expanded">
          <div class="input-box-focus" data-t="long-press-input"><span class="cursor-blink">|</span></div>
          <button class="input-send-btn" data-wrong="還沒輸入。">${I.send}</button>
        </div>
        ${gboardZhuyin('initial')}
      </div>`;
    },

    androidPaste: () => {
      const msg = (txt, time) => `<div class="msg msg-other"><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      const expanded = S.pasteMenuExpanded;
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll scroll-kb">${msg(CHAIN_INITIAL, '09:35')}</div>
        <div class="chat-input-bar-expanded">
          <div class="input-box-focus"><span class="cursor-blink">|</span></div>
          <button class="input-send-btn" data-wrong="還沒貼上。">${I.send}</button>
        </div>
        <div class="paste-toolbar ${expanded ? 'expanded' : ''}">
          ${expanded ? '<button class="paste-tool-btn" data-act="paste-back">←</button>' : ''}
          <button class="paste-tool-btn" data-t="paste-popup">貼上</button>
          ${expanded ? '<button class="paste-tool-btn" data-wrong="我們只需要「貼上」。請按「貼上」。">全選</button><button class="paste-tool-btn" data-wrong="我們只需要「貼上」。請按「貼上」。">朗讀</button>' : '<button class="paste-tool-btn" data-act="paste-more">⋮</button>'}
        </div>
        ${gboardZhuyin('initial')}
      </div>`;
    },

    groupChatPasted: () => {
      const msg = (txt, time) => `<div class="msg msg-other"><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      const lines = CHAIN_INITIAL.split('\n');
      const lastFew = lines.slice(-5).join('\n');
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll scroll-kb">${msg(CHAIN_INITIAL, '09:35')}</div>
        <div class="chat-input-bar-expanded">
          <div class="input-box-text scrolled-bottom">${lastFew.replace(/\n/g, '<br>')}<span class="cursor-blink">|</span></div>
          <button class="input-send-btn" data-wrong="還沒輸入完。">${I.send}</button>
        </div>
        ${gboardZhuyin('pasted')}
      </div>`;
    },

    groupChatNewline: () => {
      const msg = (txt, time) => `<div class="msg msg-other"><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      const lines = CHAIN_INITIAL.split('\n');
      const lastFew = lines.slice(-4).join('\n') + '\n';
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll scroll-kb">${msg(CHAIN_INITIAL, '09:35')}</div>
        <div class="chat-input-bar-expanded">
          <div class="input-box-text scrolled-bottom">${lastFew.replace(/\n/g, '<br>')}<span class="cursor-blink">|</span></div>
          <button class="input-send-btn" data-wrong="還沒輸入完。">${I.send}</button>
        </div>
        ${gboardZhuyin('newline')}
      </div>`;
    },

    groupChatNum: () => {
      const msg = (txt, time) => `<div class="msg msg-other"><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      const lines = CHAIN_INITIAL.split('\n');
      const lastFew = lines.slice(-3).join('\n') + '\n' + S.chainInput;
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll scroll-kb">${msg(CHAIN_INITIAL, '09:35')}</div>
        <div class="chat-input-bar-expanded">
          <div class="input-box-text scrolled-bottom">${lastFew.replace(/\n/g, '<br>')}<span class="cursor-blink">|</span></div>
          <button class="input-send-btn" data-wrong="還沒輸入完。">${I.send}</button>
        </div>
        ${gboardNum()}
      </div>`;
    },

    groupChatZhuyin1: () => {
      const msg = (txt, time) => `<div class="msg msg-other"><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      const lines = CHAIN_INITIAL.split('\n');
      const lastFew = lines.slice(-3).join('\n') + '\n' + S.chainInput + S.zhuyinBuf;
      const cand = S.zhuyinBuf ? ['小', '笑', '曉'] : [];
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll scroll-kb">${msg(CHAIN_INITIAL, '09:35')}</div>
        <div class="chat-input-bar-expanded">
          <div class="input-box-text scrolled-bottom">${lastFew.replace(/\n/g, '<br>')}<span class="cursor-blink">|</span></div>
          <button class="input-send-btn" data-wrong="還沒輸入完。">${I.send}</button>
        </div>
        ${gboardZhuyinWithCand('xiao', cand)}
      </div>`;
    },

    groupChatZhuyin2: () => {
      const msg = (txt, time) => `<div class="msg msg-other"><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      const lines = CHAIN_INITIAL.split('\n');
      const lastFew = lines.slice(-3).join('\n') + '\n' + S.chainInput + S.zhuyinBuf;
      const cand = S.zhuyinBuf ? ['蓉', '榮', '容'] : [];
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll scroll-kb">${msg(CHAIN_INITIAL, '09:35')}</div>
        <div class="chat-input-bar-expanded">
          <div class="input-box-text scrolled-bottom">${lastFew.replace(/\n/g, '<br>')}<span class="cursor-blink">|</span></div>
          <button class="input-send-btn" data-wrong="還沒輸入完。">${I.send}</button>
        </div>
        ${gboardZhuyinWithCand('rong', cand)}
      </div>`;
    },

    groupChatComplete: () => {
      const msg = (txt, time) => `<div class="msg msg-other"><div class="msg-bubble chain-msg">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      const lines = CHAIN_INITIAL.split('\n');
      const lastFew = lines.slice(-3).join('\n') + '\n' + S.chainInput;
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll scroll-kb">${msg(CHAIN_INITIAL, '09:35')}</div>
        <div class="chat-input-bar-expanded">
          <div class="input-box-text scrolled-bottom">${lastFew.replace(/\n/g, '<br>')}</div>
          <button class="input-send-btn" data-t="send-btn">${I.send}</button>
        </div>
        ${gboardZhuyin('complete')}
      </div>`;
    },

    groupChatSent: () => {
      const msg = (txt, isMe, time) => `<div class="msg ${isMe ? 'msg-me' : 'msg-other'}"><div class="msg-bubble${isMe ? '' : ' chain-msg'}">${txt.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
      const newChain = CHAIN_INITIAL + '\n11. ' + CHAIN_USER_NAME;
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll">
          ${msg(CHAIN_INITIAL, false, '09:35')}
          ${msg(newChain, true, '現在')}
        </div>
        <div class="chat-input-bar">
          <button class="chat-plus">${I.plus}</button>
          <div class="chat-input">輸入訊息</div>
          <button class="chat-send">${I.send}</button>
        </div>
      </div>`;
    },

    chatRoom: () => {
      const msg = (txt, isMe, time) => `<div class="msg ${isMe ? 'msg-me' : 'msg-other'}"><div class="msg-bubble">${txt}</div><div class="msg-time">${time}</div></div>`;
      const locationMsg = S.locationSent ? `<div class="msg msg-me"><div class="msg-bubble loc-bubble"><div class="loc-icon">${I.pin}</div><div class="loc-txt">${S.locAddr || '我的位置'}</div></div><div class="msg-time">現在</div></div>` : '';
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ffa726">家</span><span>家人群組 (3)</span></div>
        <div class="scroll">
          ${msg('大家這週末回來嗎？', false, '週四')}
          ${msg('我跟爸爸都會回去', false, '週四')}
          ${msg('好啊，我也回去', true, '週四')}
          ${msg('週末回家', false, '10:15')}
          ${locationMsg}
        </div>
        <div class="chat-input-bar">
          <button class="chat-plus" data-t="chat-plus">${I.plus}</button>
          <div class="chat-input" data-wrong="這是輸入框。請按<b>左邊的 ＋ 按鈕</b>。">輸入訊息</div>
          <button class="chat-send" data-wrong="這是傳送按鈕。請按<b>左邊的 ＋ 按鈕</b>。">${I.send}</button>
        </div>
      </div>`;
    },

    chatMenu: () => `<div class="scr chat-menu">
      <div class="menu-overlay" data-wrong="請按下面選單中的「位置資訊」。"></div>
      <div class="menu-popup">
        <button class="menu-item" data-wrong="這是「相簿」。我們要按「位置資訊」。"><span class="menu-icon" style="background:#9c27b0">${I.photo}</span><span>相簿</span></button>
        <button class="menu-item" data-wrong="這是「相機」。我們要按「位置資訊」。"><span class="menu-icon" style="background:#ef6c00">${I.cam}</span><span>相機</span></button>
        <button class="menu-item" data-t="location-menu"><span class="menu-icon" style="background:#4caf50">${I.location}</span><span>位置資訊</span></button>
        <button class="menu-item" data-wrong="這是「檔案」。我們要按「位置資訊」。"><span class="menu-icon" style="background:#607d8b">${I.t_post}</span><span>檔案</span></button>
      </div>
    </div>`,

    locationPermission: () => `<div class="scr permission">
      <div class="perm-overlay"></div>
      <div class="perm-dialog">
        <div class="perm-title">允許「LINE」取用你的位置嗎？</div>
        <div class="perm-text">此 App 需要使用你的位置資訊來分享所在地點。</div>
        <div class="perm-btns">
          <button class="perm-btn" data-wrong="先不要拒絕喔。請按下面的<b>「允許」</b>。">拒絕</button>
          <button class="perm-btn primary" data-t="allow-location">允許</button>
        </div>
      </div>
    </div>`,

    locationMap: () => {
      const hasSearch = S.scn === 'E' && step().screen === 'locationMap';
      const addr = S.locAddr || '目前位置';
      return `<div class="scr loc-map">
        <div class="appbar"><span class="back">‹</span><span>選擇位置</span></div>
        <div class="map-view" data-wrong="請按${hasSearch ? '上面的搜尋框，輸入地址' : '右下角的「分享」或「傳送」按鈕'}。">
          <div class="map-bg"></div>
          <div class="map-pin">${I.pin}</div>
          ${hasSearch ? `<div class="map-search"><button class="search-box" data-t="search-box">${I.search} 搜尋地點或地址</button></div>` : ''}
        </div>
        <div class="loc-info">
          <div class="loc-name">${addr}</div>
          <div class="loc-addr-detail">${addr === '目前位置' ? '練習用模擬位置' : '臺北市中正區北平西路3號'}</div>
        </div>
        <button class="loc-send-btn" data-t="send-location">分享 / 傳送</button>
      </div>`;
    },

    locationSearch: () => {
      const places = ['臺北車站', '台北101', '西門町', '中正紀念堂', '士林夜市'];
      const pl = (name, addr) => `<button class="place-item" data-t="place-${name}"><div class="place-icon">${I.location}</div><div class="place-info"><div class="place-name">${name}</div><div class="place-addr">${addr}</div></div></button>`;
      return `<div class="scr loc-search">
        <div class="appbar">
          <button class="back" data-t="back-from-search">‹</button>
          <div class="search-input-box">
            <span class="search-icon">${I.search}</span>
            <input class="search-input" placeholder="搜尋地點或地址" data-neutral value="${S.searchText || ''}" />
          </div>
        </div>
        <div class="scroll">
          <div class="sec-t">建議地點</div>
          ${pl('臺北車站', '臺北市中正區北平西路3號')}
          ${pl('台北101', '臺北市信義區信義路五段7號')}
          ${pl('西門町', '臺北市萬華區成都路')}
          <div class="sec-t">最近使用</div>
          ${pl('中正紀念堂', '臺北市中正區中山南路21號')}
        </div>
      </div>`;
    },

    groupChatInput: () => {
      const st = step();
      const inputText = S.chainCopied || '';
      
      // 顯示游標（在文字結尾）
      const showCursor = inputText && (st.target === 'newline-btn' || st.target === 'type-number' || st.target === 'type-name' || st.target === 'send-chain');
      const displayText = inputText ? inputText.replace(/\n/g, '<br>') + (showCursor ? '<span class="cursor">|</span>' : '') : '<span class="placeholder">輸入訊息</span>';
      
      // 判斷要顯示哪種鍵盤
      let keyboard = '';
      
      if (st.target === 'newline-btn') {
        // 貼上後，顯示有換行鍵的鍵盤
        keyboard = `<div class="keyboard" data-neutral>
          <div class="kb-row">
            <button class="kb-key">ㄅ</button>
            <button class="kb-key">ㄆ</button>
            <button class="kb-key">ㄇ</button>
            <button class="kb-key">ㄈ</button>
            <button class="kb-key">ㄉ</button>
          </div>
          <div class="kb-row">
            <button class="kb-key wide" data-wrong="還沒換行喔。請按右邊的<b>「換行」</b>鍵。">空白鍵</button>
            <button class="kb-key wide enter-key" data-t="newline-btn">換行 ↵</button>
          </div>
          <div class="kb-helper">提示：按鍵盤右下角的「換行」鍵</div>
        </div>`;
      } else if (st.target === 'type-number') {
        // 換行後，顯示「11.」按鈕
        keyboard = `<div class="keyboard" data-neutral>
          <div class="kb-row">
            <button class="kb-key wide" data-t="type-number">11.</button>
            <button class="kb-key" data-wrong="先按「11.」序號。">${CHAIN_USER_NAME}</button>
          </div>
          <div class="kb-helper">提示：按「11.」</div>
        </div>`;
      } else if (st.target === 'type-name') {
        // 輸入序號後，顯示名字按鈕
        keyboard = `<div class="keyboard" data-neutral>
          <div class="kb-row">
            <button class="kb-key" data-wrong="序號已經輸入了。現在按「${CHAIN_USER_NAME}」。">11.</button>
            <button class="kb-key wide" data-t="type-name">${CHAIN_USER_NAME}</button>
          </div>
          <div class="kb-helper">提示：按「${CHAIN_USER_NAME}」</div>
        </div>`;
      } else if (st.target === 'send-chain') {
        // 已完成輸入，準備傳送（鍵盤縮小或隱藏）
        keyboard = `<div class="keyboard keyboard-minimal" data-neutral>
          <div class="kb-row">
            <button class="kb-key" disabled>完成輸入</button>
          </div>
        </div>`;
      } else {
        // 初始鍵盤（貼上之前）
        keyboard = `<div class="keyboard" data-neutral>
          <div class="kb-row">
            <button class="kb-key" ${st.target === 'long-press-input' ? 'data-t="long-press-input"' : 'data-wrong="這是一般按鍵。請<b>長按</b>輸入框（上面白色的地方）。"'}>ㄅ</button>
            <button class="kb-key">ㄆ</button>
            <button class="kb-key">ㄇ</button>
            <button class="kb-key">ㄈ</button>
            <button class="kb-key">ㄉ</button>
          </div>
          <div class="kb-row">
            <button class="kb-key wide paste-key" ${st.target === 'paste-btn' ? 'data-t="paste-btn"' : 'data-wrong="這些是其他按鍵。請按<b>「貼上」</b>按鈕。"'}>貼上</button>
            <button class="kb-key wide" data-wrong="先按「貼上」。">換行</button>
          </div>
        </div>`;
      }
      
      return `<div class="scr chat-room">
        <div class="appbar"><span class="back">‹</span><span class="avatar" style="background:#ff9800">社</span><span>社區團購群 (48)</span></div>
        <div class="scroll scroll-compact">
          <div class="msg msg-other"><div class="msg-bubble chain-msg">${CHAIN_INITIAL.replace(/\n/g, '<br>')}</div><div class="msg-time">09:35</div></div>
        </div>
        <div class="chat-input-bar-expanded">
          <div class="input-area" ${st.target === 'paste-box' ? 'data-t="paste-box"' : 'data-wrong="現在不用按這裡。請看下面的指示操作。"'}>
            ${displayText}
          </div>
          <button class="input-send" ${st.target === 'send-chain' ? 'data-t="send-chain"' : 'data-wrong="還沒輸入完喔。請先照指示完成輸入。"'}>${I.send}</button>
        </div>
        ${keyboard}
      </div>`;
    },

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

  const CHAT_COMMON = [
    { screen: 'home', target: 'line', say: '這是手機的桌面。請按<span class="em">綠色的「LINE」</span>圖示。' },
    { screen: 'lineHome', target: 'chat-tab', say: '打開 LINE 了！請按<span class="em">下方的「聊天」</span>。' },
    { screen: 'lineChat', target: 'open-chat', say: '這是聊天列表。請按<span class="em">「家人群組」</span>打開聊天室。' },
    { screen: 'chatRoom', target: 'chat-plus', say: '這是跟家人的聊天室。請按<span class="em">左下角的 ＋ 按鈕</span>。' },
    { screen: 'chatMenu', target: 'location-menu', say: '出現選單了！請按<span class="em">「位置資訊」</span>。' }
  ];

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
    ] },
    D: { name: '傳送我現在的位置', steps: [...CHAT_COMMON,
      { screen: 'locationPermission', target: 'allow-location', say: 'LINE 需要權限才能知道你的位置。請按<span class="em">「允許」</span>。' },
      { screen: 'locationMap', target: 'send-location', enter() { S.locAddr = '目前位置'; S.locationSent = false; },
        say: '地圖顯示你現在的位置（練習用模擬位置）。請按下方的<span class="em">「分享 / 傳送」</span>按鈕。' },
      { screen: 'chatRoom', final: true, enter() { S.locationSent = true; }, 
        say: '🎉 太棒了！位置已經傳送到聊天室了！家人就能知道你在哪裡。' }
    ] },
    E: { name: '傳送一個地址', steps: [...CHAT_COMMON,
      { screen: 'locationMap', target: 'search-box', enter() { S.locAddr = '目前位置'; S.locationSent = false; S.searchText = ''; },
        say: '這是地圖畫面。我們要搜尋地點。請按<span class="em">上方的搜尋框</span>。' },
      { screen: 'locationSearch', target: 'place-臺北車站', say: '可以輸入地址，或選建議地點。請按<span class="em">「臺北車站」</span>。' },
      { screen: 'locationMap', target: 'send-location', enter() { S.locAddr = '臺北車站'; },
        say: '地圖已經移動到<span class="em">臺北車站</span>了。請按下方的<span class="em">「分享 / 傳送」</span>按鈕。' },
      { screen: 'chatRoom', final: true, enter() { S.locationSent = true; },
        say: '🎉 太棒了！臺北車站的位置已經傳送到聊天室了！' }
    ] },
    F: { name: '在群組接龍留名字', steps: [
      { screen: 'home', target: 'line', say: '這是手機的桌面。請按<span class="em">綠色的「LINE」</span>圖示。' },
      { screen: 'lineHome', target: 'chat-tab', say: '打開 LINE 了！請按<span class="em">下方的「聊天」</span>。' },
      { screen: 'lineChat', target: 'open-group', say: '這是聊天列表。請按<span class="em">「社區團購群」</span>打開群組。' },
      { screen: 'groupChat', target: 'long-press-msg', say: '群組裡有團購接龍訊息。請<span class="em">長按最下面最新的</span>接龍訊息（一大串名字）。' },
      { screen: 'lineLongPress', target: 'copy-item', say: 'LINE 的選單出現了！請按<span class="em">「複製」</span>。' },
      { screen: 'groupChatCopied', target: 'input-box', say: '已複製！現在請<span class="em">點擊下方的輸入框</span>（寫「輸入訊息」的地方）。' },
      { screen: 'groupChatKeyboard', target: 'long-press-input', say: '鍵盤出現了！請<span class="em">長按輸入框內部</span>（白色的地方），準備貼上。' },
      { screen: 'androidPaste', target: 'paste-popup', say: 'Android 貼上工具列出現了！（若想看更多選項，可按「⋮」展開。）請按<span class="em">「貼上」</span>。' },
      { screen: 'groupChatPasted', target: 'enter-key', say: '貼上了！輸入框顯示最後幾個名字，游標在最後一個名字後面。請按<span class="em">鍵盤右下角的「換行」鍵</span>。' },
      { screen: 'groupChatNewline', target: 'switch-123', say: '游標跳到新的一行了（在 10. 家豪 下面）！現在要輸入「11.」。請先按<span class="em">左下角的「符號」</span>切換到數字。' },
      { screen: 'groupChatNum', target: 'type-11', say: '數字鍵盤出現了！請<span class="em">依序按 1 1 .</span>（點三次）。' },
      { screen: 'groupChatZhuyin1', target: 'type-xiao', say: '輸入「小」：請<span class="em">依序按 ㄒ ㄧ ㄠ ˇ</span>，然後按候選列的<span class="em">「小」</span>。' },
      { screen: 'groupChatZhuyin2', target: 'type-rong', say: '輸入「蓉」：請<span class="em">依序按 ㄖ ㄨ ㄥ ˊ</span>，然後按候選列的<span class="em">「蓉」</span>。' },
      { screen: 'groupChatComplete', target: 'send-btn', say: '名字輸入完成了！請按<span class="em">右側的傳送按鈕</span>（紙飛機）。' },
      { screen: 'groupChatSent', final: true, say: '🎉 太棒了！你的名字已經加到接龍裡，傳送到群組了！' }
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

  function scrollInputToBottom() {
    requestAnimationFrame(() => {
      const inputBox = el.screen.querySelector('.input-box-text.scrolled-bottom');
      if (inputBox) {
        inputBox.scrollTop = inputBox.scrollHeight;
        requestAnimationFrame(() => {
          inputBox.scrollTop = inputBox.scrollHeight;
        });
      }
    });
  }

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
      // 自動滾動到目標元素（在模擬手機畫面內）
      setTimeout(() => {
        const g = glowTarget();
        if (g && g.scrollIntoView) {
          g.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 100);
    }
    scrollInputToBottom();
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
    },
    input(b) {
      const v = b.dataset.v;
      S.chainInput += v;
      render(true);
      if (S.chainInput === '11.') {
        setTimeout(() => {
          S.zhuyinBuf = '';
          next();
        }, 300);
      }
    },
    'switch-zh'() {
      S.zhuyinBuf = '';
      next();
    },
    zhuyin(b) {
      const v = b.dataset.v;
      S.zhuyinBuf += v;
      render(true);
    },
    'paste-more'() {
      S.pasteMenuExpanded = true;
      render(true);
    },
    'paste-back'() {
      S.pasteMenuExpanded = false;
      render(true);
    }
  };

  el.phone.addEventListener('click', e => {
    if (!S.scn) return;
    const st = step();
    const act = e.target.closest('[data-act]');
    if (act && el.screen.contains(act)) { ACTIONS[act.dataset.act](act); return; }
    const t = e.target.closest('[data-t]');
    if (t && st.target && t.dataset.t === st.target) {
      const v = t.dataset.v;
      if (st.target === 'type-xiao' || st.target === 'type-rong') {
        S.chainInput += v;
        S.zhuyinBuf = '';
        success();
      } else if (st.target === 'copy-item') {
        toast('已複製', false);
        setTimeout(success, 800);
      } else {
        success();
      }
      return;
    }
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
    S.scn = k; S.cart = {}; S.pin = ''; S.amt = ''; S.locationSent = false; S.locAddr = ''; S.searchText = ''; S.chainInput = ''; S.zhuyinBuf = ''; S.pasteMenuExpanded = false;
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

  // 監聽視窗大小變化，重新捲動輸入框
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scrollInputToBottom);
  }
  window.addEventListener('resize', scrollInputToBottom);

  // 給測試用（不影響使用）
  window.__lpp = { S, step: () => step(), SCENARIOS };
})();
