// ================================================================
//  辅助函数
// ================================================================

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const c of cookies) {
    const [key, val] = c.split('=');
    if (key === name) return decodeURIComponent(val);
  }
  return null;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function jsonResponse(data, status = 200, setCookie = false, userId = '') {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };
  if (userId) {
    headers['Set-Cookie'] = `userId=${encodeURIComponent(userId)}; Path=/; Max-Age=31536000; SameSite=None; Secure`;
  }
  return new Response(JSON.stringify(data), { status, headers });
}

// ================================================================
//  HTML 页面（内嵌）
// ================================================================
function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>灵堂 · 追思</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      min-height:100vh;
      background:#1a1a1e;
      display:flex;
      justify-content:center;
      align-items:center;
      font-family:'Times New Roman','宋体','SimSun','PingFang SC',serif;
      color:#c0b8b0;
      padding:20px;
    }
    .shrine {
      max-width:400px;
      width:100%;
      background:#24242a;
      border:1px solid #3a3a44;
      border-radius:8px;
      padding:32px 24px 28px;
      box-shadow:0 8px 32px rgba(0,0,0,0.6);
      display:flex;
      flex-direction:column;
      align-items:center;
    }
    .photo-frame {
      width:130px;
      height:160px;
      border:2px solid #4a4a56;
      border-radius:4px;
      background:#1a1a1e;
      margin-bottom:18px;
      overflow:hidden;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:inset 0 0 20px rgba(0,0,0,0.4);
    }
    .photo-frame img {
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }
    .tablet {
      text-align:center;
      padding:14px 20px 12px;
      border-bottom:1px solid #3a3a44;
      margin-bottom:20px;
      width:100%;
    }
    .tablet .title {
      font-size:14px;
      letter-spacing:8px;
      color:#7a7a8a;
      font-weight:normal;
      margin-bottom:4px;
    }
    .tablet .name {
      font-size:38px;
      font-weight:700;
      color:#e6e0d8;
      letter-spacing:10px;
      font-family:'Times New Roman','宋体',serif;
      text-shadow:0 0 8px rgba(160,140,120,0.15);
    }
    .tablet .sub {
      font-size:13px;
      color:#6a6a7a;
      letter-spacing:4px;
      margin-top:6px;
    }
    .incense-area {
      display:flex;
      flex-direction:column;
      align-items:center;
      width:100%;
      margin:8px 0 14px;
      cursor:pointer;
      padding:8px 0;
      border-radius:6px;
      transition:background 0.2s;
    }
    .incense-area:hover { background:#2a2a32; }
    .sticks {
      display:flex;
      gap:22px;
      height:90px;
      align-items:flex-end;
      margin-bottom:6px;
    }
    .stick {
      width:4px;
      height:60px;
      background:#5a4a3a;
      border-radius:2px;
      position:relative;
    }
    .stick::after {
      content:'';
      position:absolute;
      top:-5px;
      left:50%;
      transform:translateX(-50%);
      width:8px;
      height:8px;
      border-radius:50%;
      background:#d68a4a;
      opacity:0.5;
      transition:opacity 0.3s, box-shadow 0.3s;
    }
    .stick.lit::after {
      opacity:1;
      box-shadow:0 0 12px rgba(200,120,40,0.5);
    }
    .censer {
      width:140px;
      height:24px;
      background:#2a2a32;
      border-radius:50%;
      border:1px solid #3a3a44;
      box-shadow:inset 0 4px 6px rgba(0,0,0,0.4);
      position:relative;
    }
    .censer::before {
      content:'';
      position:absolute;
      top:-4px;
      left:50%;
      transform:translateX(-50%);
      width:60px;
      height:6px;
      background:#2a2a32;
      border-radius:50%;
      border:1px solid #3a3a44;
      border-bottom:none;
    }
    .censer .legs {
      display:flex;
      gap:40px;
      justify-content:center;
      margin-top:6px;
    }
    .censer .legs span {
      display:block;
      width:4px;
      height:10px;
      background:#1a1a22;
      border-radius:2px;
      border:1px solid #3a3a44;
    }
    .counter {
      margin:12px 0 16px;
      text-align:center;
      width:100%;
    }
    .counter .label {
      font-size:13px;
      letter-spacing:4px;
      color:#7a7a8a;
      font-weight:300;
    }
    .counter .number {
      font-size:54px;
      font-weight:700;
      color:#e6e0d8;
      line-height:1.2;
      font-variant-numeric:tabular-nums;
      letter-spacing:2px;
    }
    .counter .number.pop {
      animation:pop 0.25s ease;
    }
    @keyframes pop {
      0% { transform:scale(1); }
      40% { transform:scale(1.12); }
      100% { transform:scale(1); }
    }
    .personal-counter {
      margin:6px 0 10px;
      font-size:16px;
      color:#b0a8a0;
      letter-spacing:2px;
    }
    .personal-counter span {
      font-weight:700;
      color:#e6e0d8;
    }
    .btn-incense {
      background:#2a2a34;
      border:1px solid #4a4a56;
      border-radius:6px;
      padding:14px 32px;
      color:#d0c8c0;
      font-size:18px;
      letter-spacing:6px;
      font-family:inherit;
      cursor:pointer;
      transition:background 0.2s,border-color 0.2s,transform 0.1s;
      display:flex;
      align-items:center;
      gap:12px;
      font-weight:normal;
      box-shadow:inset 0 2px 4px rgba(0,0,0,0.2);
    }
    .btn-incense:hover { background:#32323e; border-color:#5a5a6a; }
    .btn-incense:active { transform:scale(0.96); background:#22222c; }
    .btn-incense:disabled {
      opacity:0.5;
      cursor:not-allowed;
      background:#2a2a34;
      border-color:#3a3a44;
      transform:none;
    }
    .btn-incense .icon { font-size:22px; opacity:0.7; }
    .footer {
      margin-top:20px;
      text-align:center;
      width:100%;
      font-size:12px;
      color:#5a5a6a;
      border-top:1px solid #2a2a34;
      padding-top:16px;
    }
    .msg {
      font-size:14px;
      color:#a08060;
      margin-top:6px;
      height:24px;
    }
    @media (max-width:420px) {
      .shrine { padding:20px 16px; }
      .photo-frame { width:100px; height:130px; }
      .tablet .name { font-size:28px; letter-spacing:6px; }
      .counter .number { font-size:40px; }
      .btn-incense { font-size:16px; padding:12px 24px; }
      .sticks { gap:16px; height:70px; }
      .stick { height:48px; }
      .censer { width:110px; height:20px; }
    }
    @media (max-width:350px) {
      .photo-frame { width:80px; height:106px; }
      .tablet .name { font-size:22px; letter-spacing:4px; }
      .counter .number { font-size:32px; }
      .btn-incense { font-size:14px; padding:10px 16px; letter-spacing:4px; }
    }
  </style>
</head>
<body>
<div class="shrine">
  <div class="photo-frame">
    <!-- ★★★ 替换为逝者照片 URL ★★★ -->
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='130' height='160' viewBox='0 0 130 160'%3E%3Crect width='130' height='160' fill='%231a1a1e'/%3E%3Ctext x='65' y='75' font-family='serif' font-size='16' fill='%235a5a6a' text-anchor='middle'%3E遗 像%3C/text%3E%3Ctext x='65' y='95' font-family='serif' font-size='12' fill='%234a4a56' text-anchor='middle'%3E(请替换照片)%3C/text%3E%3C/svg%3E" alt="逝者遗像" />
  </div>
  <div class="tablet">
    <div class="title">▣ 灵 位</div>
    <div class="name">追 思</div>
    <div class="sub">· 永 怀 ·</div>
  </div>
  <div class="incense-area" id="incenseArea">
    <div class="sticks" id="sticks">
      <div class="stick" data-idx="0"></div>
      <div class="stick" data-idx="1"></div>
      <div class="stick" data-idx="2"></div>
    </div>
    <div class="censer">
      <div class="legs"><span></span><span></span><span></span></div>
    </div>
  </div>

  <div class="counter">
    <div class="label">⟡ 总上香次数</div>
    <div class="number" id="globalCount">0</div>
  </div>

  <div class="personal-counter">
    您已上香 <span id="userCount">0</span> / <span id="maxCount">3</span> 支
  </div>

  <div class="msg" id="msg"></div>

  <button class="btn-incense" id="btnIncense">
    <span class="icon">🕯</span> 上香
  </button>
  <div class="footer">· 祭 ·</div>
</div>

<script>
  const globalDisplay = document.getElementById('globalCount');
  const userDisplay = document.getElementById('userCount');
  const maxDisplay = document.getElementById('maxCount');
  const btnIncense = document.getElementById('btnIncense');
  const incenseArea = document.getElementById('incenseArea');
  const sticks = document.querySelectorAll('.stick');
  const msg = document.getElementById('msg');

  let maxUserIncense = 3; // 默认值，从 API 获取后更新

  function showMsg(text, isError = false) {
    msg.textContent = text;
    msg.style.color = isError ? '#b08060' : '#a08060';
    setTimeout(() => { if (msg.textContent === text) msg.textContent = ''; }, 5000);
  }

  async function fetchStatus() {
    const res = await fetch('/api/incense', { credentials: 'include' });
    if (!res.ok) {
      let errMsg = '请求失败 (status: ' + res.status + ')';
      try {
        const data = await res.json();
        if (data.error) errMsg = data.error;
        else if (data.message) errMsg = data.message;
      } catch (_) {}
      throw new Error(errMsg);
    }
    return await res.json();
  }

  function updateDisplay(global, user, maxIncense) {
    maxUserIncense = maxIncense || maxUserIncense;
    globalDisplay.textContent = global.toLocaleString();
    userDisplay.textContent = user;
    maxDisplay.textContent = maxUserIncense;
    btnIncense.disabled = user >= maxUserIncense;
    if (user >= maxUserIncense) {
      showMsg('您已上完' + maxUserIncense + '支香，感恩追思。', false);
    }
  }

  async function performIncense() {
    if (btnIncense.disabled) {
      showMsg('您已上完' + maxUserIncense + '支香。', true);
      return;
    }

    try {
      const res = await fetch('/api/incense', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        let errMsg = '请求失败 (status: ' + res.status + ')';
        try {
          const data = await res.json();
          if (data.error) errMsg = data.error;
          else if (data.message) errMsg = data.message;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      updateDisplay(data.global, data.user, data.maxIncense);

      sticks.forEach((s, idx) => {
        s.classList.remove('lit');
        setTimeout(() => s.classList.add('lit'), idx * 50);
      });
      setTimeout(() => sticks.forEach(s => s.classList.remove('lit')), 600);

      globalDisplay.classList.remove('pop');
      void globalDisplay.offsetWidth;
      globalDisplay.classList.add('pop');

      if (navigator.vibrate) navigator.vibrate(10);
      showMsg('上香成功，功德无量。', false);
    } catch (err) {
      console.error(err);
      showMsg('操作失败：' + err.message, true);
    }
  }

  async function init() {
    try {
      const status = await fetchStatus();
      updateDisplay(status.global, status.user, status.maxIncense);
    } catch (err) {
      console.error(err);
      showMsg('加载失败：' + err.message, true);
      btnIncense.disabled = true;
    }

    btnIncense.addEventListener('click', performIncense);
    incenseArea.addEventListener('click', (e) => {
      if (e.target.closest('.btn-incense')) return;
      performIncense();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const tag = document.activeElement?.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT') return;
        e.preventDefault();
        performIncense();
      }
    });
  }

  init();
</script>
</body>
</html>`;
}

// ================================================================
//  Worker 入口
// ================================================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 从环境变量读取最大上香次数，默认 3
    const MAX_USER_INCENSE = parseInt(env.MAX_USER_INCENSE) || 3;
    const maxIncense = MAX_USER_INCENSE > 0 ? MAX_USER_INCENSE : 3;

    // ---------- API 路由 ----------
    if (path === '/api/incense') {
      if (!env || !env.INCENSE_KV) {
        return jsonResponse({ error: 'KV 绑定未配置，请检查 Worker 绑定设置。' }, 500);
      }

      let userId = getCookie(request, 'userId');
      let needSetCookie = false;
      if (!userId) {
        userId = generateUUID();
        needSetCookie = true;
      }

      async function getCounts() {
        try {
          const global = await env.INCENSE_KV.get('global_count', 'json') || 0;
          const userKey = 'user:' + userId;
          const user = await env.INCENSE_KV.get(userKey, 'json') || 0;
          return { global, user };
        } catch (err) {
          console.error('KV 读取失败:', err);
          throw new Error('KV 读取失败: ' + err.message);
        }
      }

      if (request.method === 'GET') {
        try {
          const { global, user } = await getCounts();
          return jsonResponse({
            global,
            user,
            maxIncense: maxIncense,
            userId,
          }, 200, needSetCookie, userId);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      if (request.method === 'POST') {
        try {
          const { global, user } = await getCounts();
          if (user >= maxIncense) {
            return jsonResponse({
              error: 'limit_reached',
              message: '您已上完' + maxIncense + '支香。',
              global,
              user,
              maxIncense: maxIncense,
              userId,
            }, 403, needSetCookie, userId);
          }

          const newUser = user + 1;
          const newGlobal = global + 1;
          const userKey = 'user:' + userId;
          await env.INCENSE_KV.put('global_count', JSON.stringify(newGlobal));
          await env.INCENSE_KV.put(userKey, JSON.stringify(newUser));

          return jsonResponse({
            global: newGlobal,
            user: newUser,
            maxIncense: maxIncense,
            userId,
          }, 200, needSetCookie, userId);
        } catch (err) {
          console.error('KV 写入失败:', err);
          return jsonResponse({ error: '服务器内部错误：' + err.message }, 500);
        }
      }

      return new Response('Method Not Allowed', { status: 405 });
    }

    // ---------- 根路径返回 HTML ----------
    if (path === '/') {
      const html = getHTML();
      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=utf-8' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};