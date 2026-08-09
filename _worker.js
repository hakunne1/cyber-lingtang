// ================================================================
//  默认配置（所有内容均可通过环境变量覆盖）
// ================================================================

// 用户限制
const DEFAULT_MAX_INCENSE = 3;                    // 每人最多上香次数

// 文本内容
const DEFAULT_BIOGRAPHY = '愿逝者安息，生者坚强。';   // 生平
const DEFAULT_LEFT_EPITAPH = '音容宛在';            // 左侧挽联（下联）
const DEFAULT_RIGHT_EPITAPH = '浩气长存';           // 右侧挽联（上联）
const DEFAULT_TABLET_NAME = '追思';                // 牌位主名
const DEFAULT_TABLET_SUB = '· 永怀 ·';             // 牌位副标题
const DEFAULT_PAGE_TITLE = '灵堂 · 追思';          // 浏览器标题

// 图片资源
const DEFAULT_PORTRAIT_URL = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'130\' height=\'160\' viewBox=\'0 0 130 160\'%3E%3Crect width=\'130\' height=\'160\' fill=\'%231a1a1e\'/%3E%3Ctext x=\'65\' y=\'75\' font-family=\'serif\' font-size=\'16\' fill=\'%235a5a6a\' text-anchor=\'middle\'%3E遗 像%3C/text%3E%3Ctext x=\'65\' y=\'95\' font-family=\'serif\' font-size=\'12\' fill=\'%234a4a56\' text-anchor=\'middle\'%3E(请替换照片)%3C/text%3E%3C/svg%3E';

// 背景图片默认为空（纯色背景）
const DEFAULT_BACKGROUND_IMAGE = '';

// ================================================================
//  辅助函数
// ================================================================

/**
 * 从 Cookie 中读取指定名称的值
 */
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

/**
 * 生成简易 UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 返回 JSON 响应，可选设置 Cookie
 */
function jsonResponse(data, status = 200, setCookie = false, userId = '') {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };
  if (setCookie && userId) {
    // SameSite=None; Secure 要求 HTTPS（workers.dev 和自定义域名均支持）
    headers['Set-Cookie'] = `userId=${encodeURIComponent(userId)}; Path=/; Max-Age=31536000; SameSite=None; Secure`;
  }
  return new Response(JSON.stringify(data), { status, headers });
}

/**
 * HTML 转义（防止 XSS 注入）
 */
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
}

// ================================================================
//  HTML 页面生成器（所有动态内容由环境变量驱动）
// ================================================================
function getHTML({
  biography,
  leftEpitaph,
  rightEpitaph,
  bgImage,
  portraitUrl,
  tabletName,
  tabletSub,
  pageTitle,
}) {
  // 转义文本
  const safeBio = biography.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  const safeLeft = escapeHtml(leftEpitaph);
  const safeRight = escapeHtml(rightEpitaph);
  const safeName = escapeHtml(tabletName);
  const safeSub = escapeHtml(tabletSub);
  const safeTitle = escapeHtml(pageTitle);

  // 挽联显示控制（若内容为空则不渲染）
  const showLeft = safeLeft && safeLeft.trim() !== '';
  const showRight = safeRight && safeRight.trim() !== '';

  // 背景样式（若提供了背景图 URL，则使用背景图 + 毛玻璃效果）
  const bgStyle = bgImage ? `
    body {
      background-image: url('${bgImage}');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }
    .shrine {
      background-color: rgba(36, 36, 42, 0.88);
      backdrop-filter: blur(2px);
    }
  ` : `
    body { background: #1a1a1e; }
    .shrine { background: #24242a; }
  `;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    /* ----- 重置 & 全局 ----- */
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      min-height:100vh;
      display:flex;
      justify-content:center;
      align-items:center;
      font-family:'Times New Roman','宋体','SimSun','PingFang SC',serif;
      color:#c0b8b0;
      padding:20px;
      transition: background-image 0.5s ease;
      ${bgImage ? '' : 'background:#1a1a1e;'}
    }
    ${bgStyle}

    /* ----- 主容器 ----- */
    .shrine {
      max-width:480px;
      width:100%;
      border:1px solid #3a3a44;
      border-radius:8px;
      padding:32px 24px 28px;
      box-shadow:0 8px 32px rgba(0,0,0,0.6);
      display:flex;
      flex-direction:column;
      align-items:center;
      backdrop-filter: ${bgImage ? 'blur(2px)' : 'none'};
    }

    /* ----- 相框 + 挽联 ----- */
    .photo-section {
      display:flex;
      align-items:center;
      justify-content:center;
      gap:12px;
      width:100%;
      margin-bottom:18px;
    }
    .epitaph {
      writing-mode: vertical-rl;
      font-size:28px;
      letter-spacing:8px;
      color:#b0a8a0;
      font-weight:300;
      padding:8px 2px;
      white-space:nowrap;
      line-height:1.6;
      text-shadow:0 0 6px rgba(160,140,120,0.1);
      min-width:30px;
      text-align:center;
    }
    .epitaph-left { order:0; }
    .epitaph-right { order:2; }
    .photo-frame {
      width:130px;
      height:160px;
      border:2px solid #4a4a56;
      border-radius:4px;
      background:#1a1a1e;
      overflow:hidden;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:inset 0 0 20px rgba(0,0,0,0.4);
      flex-shrink:0;
      order:1;
    }
    .photo-frame img {
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }

    /* ----- 牌位 ----- */
    .tablet {
      text-align:center;
      padding:14px 20px 12px;
      border-bottom:1px solid #3a3a44;
      margin-bottom:16px;
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

    /* ----- 生平 ----- */
    .biography {
      width:100%;
      margin:6px 0 14px;
      padding:12px 16px;
      border-left:2px solid #4a4a56;
      border-right:2px solid #4a4a56;
      background:rgba(30, 30, 38, 0.8);
      border-radius:4px;
      font-size:15px;
      line-height:1.8;
      color:#d0c8c0;
      text-align:center;
      max-height:200px;
      overflow-y:auto;
    }
    .biography .bio-label {
      font-size:12px;
      letter-spacing:4px;
      color:#7a7a8a;
      margin-bottom:6px;
      display:block;
    }
    .biography .bio-content {
      white-space:pre-wrap;
      word-break:break-word;
    }

    /* ----- 香炉 & 香 ----- */
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
    .incense-area:hover { background:rgba(42, 42, 50, 0.6); }
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

    /* ----- 计数器 ----- */
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

    /* ----- 上香按钮 ----- */
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

    /* ----- 底部 & 消息 ----- */
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

    /* ----- 响应式调整 ----- */
    @media (max-width:480px) {
      .shrine { padding:20px 16px; }
      .photo-frame { width:100px; height:130px; }
      .epitaph { font-size:20px; letter-spacing:4px; padding:4px 2px; }
      .photo-section { gap:6px; }
      .tablet .name { font-size:28px; letter-spacing:6px; }
      .counter .number { font-size:40px; }
      .btn-incense { font-size:16px; padding:12px 24px; }
      .sticks { gap:16px; height:70px; }
      .stick { height:48px; }
      .censer { width:110px; height:20px; }
      .biography { font-size:14px; padding:10px 12px; }
    }
    @media (max-width:380px) {
      .photo-frame { width:80px; height:106px; }
      .epitaph { font-size:16px; letter-spacing:2px; }
      .tablet .name { font-size:22px; letter-spacing:4px; }
      .counter .number { font-size:32px; }
      .btn-incense { font-size:14px; padding:10px 16px; letter-spacing:4px; }
      .biography { font-size:13px; }
    }
  </style>
</head>
<body>
<div class="shrine">
  <!-- 相框 + 挽联 -->
  <div class="photo-section">
    ${showLeft ? `<div class="epitaph epitaph-left">${safeLeft}</div>` : ''}
    <div class="photo-frame">
      <img src="${portraitUrl}" alt="逝者遗像" />
    </div>
    ${showRight ? `<div class="epitaph epitaph-right">${safeRight}</div>` : ''}
  </div>

  <!-- 牌位 -->
  <div class="tablet">
    <div class="title">▣ 灵 位 ▣</div>
    <div class="name">${safeName}</div>
    <div class="sub">${safeSub}</div>
  </div>

  <!-- 生平 -->
  <div class="biography">
    <span class="bio-label">—— 生 平 ——</span>
    <div class="bio-content">${safeBio}</div>
  </div>

  <!-- 香炉 -->
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

  <!-- 计数器 -->
  <div class="counter">
    <div class="label">⟡ 总上香次数 ⟡</div>
    <div class="number" id="globalCount">0</div>
  </div>
  <div class="personal-counter">
    您已上香 <span id="userCount">0</span> / <span id="maxUserDisplay">3</span> 支
  </div>
  <div class="msg" id="msg"></div>

  <!-- 上香按钮 -->
  <button class="btn-incense" id="btnIncense">
    <span class="icon">🕯</span> 上香
  </button>
  <div class="footer">· 祭 ·</div>
</div>

<script>
  // =============================================================
  //  前端逻辑
  // =============================================================
  const globalDisplay = document.getElementById('globalCount');
  const userDisplay = document.getElementById('userCount');
  const maxDisplay = document.getElementById('maxUserDisplay');
  const btnIncense = document.getElementById('btnIncense');
  const incenseArea = document.getElementById('incenseArea');
  const sticks = document.querySelectorAll('.stick');
  const msg = document.getElementById('msg');

  let maxUserIncense = 3;

  /** 显示提示消息 */
  function showMsg(text, isError = false) {
    msg.textContent = text;
    msg.style.color = isError ? '#b08060' : '#a08060';
    setTimeout(() => { if (msg.textContent === text) msg.textContent = ''; }, 5000);
  }

  /** 从 API 获取当前状态 */
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
    const data = await res.json();
    if (data.maxIncense) {
      maxUserIncense = data.maxIncense;
      maxDisplay.textContent = maxUserIncense;
    }
    return data;
  }

  /** 更新 UI */
  function updateDisplay(global, user) {
    globalDisplay.textContent = global.toLocaleString();
    userDisplay.textContent = user;
    btnIncense.disabled = user >= maxUserIncense;
    if (user >= maxUserIncense) {
      showMsg('您已上完' + maxUserIncense + '支香，感恩追思。', false);
    }
  }

  /** 执行上香操作 */
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
      if (data.maxIncense) {
        maxUserIncense = data.maxIncense;
        maxDisplay.textContent = maxUserIncense;
      }
      updateDisplay(data.global, data.user);

      // 香火闪烁
      sticks.forEach((s, idx) => {
        s.classList.remove('lit');
        setTimeout(() => s.classList.add('lit'), idx * 50);
      });
      setTimeout(() => sticks.forEach(s => s.classList.remove('lit')), 600);

      // 数字弹跳
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

  /** 初始化 */
  async function init() {
    try {
      const status = await fetchStatus();
      maxDisplay.textContent = status.maxIncense || 3;
      maxUserIncense = status.maxIncense || 3;
      updateDisplay(status.global, status.user);
    } catch (err) {
      console.error(err);
      showMsg('加载失败：' + err.message, true);
      btnIncense.disabled = true;
    }

    // 事件绑定
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
//  Cloudflare Worker 入口
// ================================================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ---------- 读取环境变量（全部带默认值） ----------
    // 1. 最大上香数
    const maxIncense = parseInt(env.MAX_USER_INCENSE) || DEFAULT_MAX_INCENSE;
    const finalMax = maxIncense > 0 ? maxIncense : DEFAULT_MAX_INCENSE;

    // 2. 生平（优先从 KV 读取，若无则取环境变量，再否则默认）
    let biography = DEFAULT_BIOGRAPHY;
    try {
      if (env && env.INCENSE_KV) {
        const kvBio = await env.INCENSE_KV.get('biography');
        if (kvBio) biography = kvBio;
      }
    } catch (e) { /* ignore */ }
    if (biography === DEFAULT_BIOGRAPHY && env && env.BIOGRAPHY) {
      biography = env.BIOGRAPHY;
    }

    // 3. 挽联（左右）
    let leftEpitaph = DEFAULT_LEFT_EPITAPH;
    let rightEpitaph = DEFAULT_RIGHT_EPITAPH;
    try {
      if (env && env.INCENSE_KV) {
        const kvLeft = await env.INCENSE_KV.get('epitaph_left');
        if (kvLeft) leftEpitaph = kvLeft;
        const kvRight = await env.INCENSE_KV.get('epitaph_right');
        if (kvRight) rightEpitaph = kvRight;
      }
    } catch (e) { /* ignore */ }
    if (leftEpitaph === DEFAULT_LEFT_EPITAPH && env && env.EPITAPH_LEFT) {
      leftEpitaph = env.EPITAPH_LEFT;
    }
    if (rightEpitaph === DEFAULT_RIGHT_EPITAPH && env && env.EPITAPH_RIGHT) {
      rightEpitaph = env.EPITAPH_RIGHT;
    }

    // 4. 背景图片
    let bgImage = DEFAULT_BACKGROUND_IMAGE;
    if (env && env.BACKGROUND_IMAGE) {
      bgImage = env.BACKGROUND_IMAGE.trim();
    }

    // 5. 遗像 URL
    let portraitUrl = DEFAULT_PORTRAIT_URL;
    if (env && env.PORTRAIT_URL) {
      portraitUrl = env.PORTRAIT_URL.trim();
    }

    // 6. 牌位主名
    let tabletName = DEFAULT_TABLET_NAME;
    if (env && env.TABLET_NAME) {
      tabletName = env.TABLET_NAME.trim();
    }

    // 7. 牌位副标题
    let tabletSub = DEFAULT_TABLET_SUB;
    if (env && env.TABLET_SUB) {
      tabletSub = env.TABLET_SUB.trim();
    }

    // 8. 页面标题
    let pageTitle = DEFAULT_PAGE_TITLE;
    if (env && env.PAGE_TITLE) {
      pageTitle = env.PAGE_TITLE.trim();
    }

    // ---------- API 路由：/api/incense ----------
    if (path === '/api/incense') {
      // 检查 KV 绑定
      if (!env || !env.INCENSE_KV) {
        return jsonResponse({ error: 'KV 绑定未配置，请检查 Worker 绑定设置。' }, 500);
      }

      // 获取或创建用户 ID
      let userId = getCookie(request, 'userId');
      let needSetCookie = false;
      if (!userId) {
        userId = generateUUID();
        needSetCookie = true;
      }

      // 辅助：读取计数
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

      // GET：返回当前状态
      if (request.method === 'GET') {
        try {
          const { global, user } = await getCounts();
          return jsonResponse({
            global,
            user,
            maxIncense: finalMax,
            userId
          }, 200, needSetCookie, userId);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      // POST：上香
      if (request.method === 'POST') {
        try {
          const { global, user } = await getCounts();
          if (user >= finalMax) {
            return jsonResponse({
              error: 'limit_reached',
              message: '您已上完' + finalMax + '支香。',
              global,
              user,
              maxIncense: finalMax,
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
            maxIncense: finalMax,
            userId,
          }, 200, needSetCookie, userId);
        } catch (err) {
          console.error('KV 写入失败:', err);
          return jsonResponse({ error: '服务器内部错误：' + err.message }, 500);
        }
      }

      return new Response('Method Not Allowed', { status: 405 });
    }

    // ---------- 根路径：返回 HTML ----------
    if (path === '/') {
      const html = getHTML({
        biography,
        leftEpitaph,
        rightEpitaph,
        bgImage,
        portraitUrl,
        tabletName,
        tabletSub,
        pageTitle,
      });
      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=utf-8' },
      });
    }

    // 其他路径返回 404
    return new Response('Not Found', { status: 404 });
  }
};