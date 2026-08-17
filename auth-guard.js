(() => {
  const ALLOWED_EMAIL = 'yuubae96@gmail.com';
  const STORAGE_KEY = 'np_sales_auth_session';

  function injectStyle() {
    const style = document.createElement('style');
    style.textContent = `
      body.auth-locked main{display:none!important}
      body.auth-locked #authGate{display:flex!important}
      #authGate{display:none;position:fixed;inset:0;z-index:99999;background:#f4f5f7;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}
      #authGate .auth-card{width:min(420px,100%);background:#fff;border-radius:20px;padding:24px;box-shadow:0 10px 35px #0002}
      #authGate h1{margin:0 0 6px;font-size:28px}
      #authGate p{color:#666;line-height:1.55}
      #authGate label{display:block;font-weight:700;margin:14px 0 6px}
      #authGate input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #ccc;border-radius:10px;font-size:16px}
      #authGate button{width:100%;padding:13px;border:0;border-radius:11px;font-size:16px;font-weight:800;margin-top:12px;cursor:pointer}
      #authLoginBtn{background:#111;color:#fff}
      #authSignupBtn{background:#ececec;color:#111}
      #authMsg{min-height:22px;font-size:14px;margin-top:10px;white-space:pre-wrap}
      #authLogoutBtn{width:auto;padding:8px 12px;font-size:13px;margin:0 0 0 12px;background:#ececec;color:#111;vertical-align:middle}
    `;
    document.head.appendChild(style);
  }

  function gateHtml() {
    const gate = document.createElement('div');
    gate.id = 'authGate';
    gate.innerHTML = `<div class="auth-card">
      <h1>NP営業</h1>
      <p>営業管理〜顧客のニーズに応える</p>
      <label>メールアドレス</label>
      <input id="authEmail" type="email" value="${ALLOWED_EMAIL}" readonly>
      <label>パスワード</label>
      <input id="authPassword" type="password" autocomplete="current-password" placeholder="営業管理アプリ専用パスワード">
      <button id="authLoginBtn">ログイン</button>
      <button id="authSignupBtn">初回パスワード設定</button>
      <div id="authMsg"></div>
    </div>`;
    document.body.appendChild(gate);
  }

  function setMsg(msg, bad=false) {
    const el = document.getElementById('authMsg');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = bad ? '#b00020' : '#333';
  }

  function saveSession(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }
  function loadSession() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  }
  function clearSession() { localStorage.removeItem(STORAGE_KEY); }

  async function authRequest(path, body) {
    const r = await fetch(`${U}/auth/v1/${path}`, {
      method: 'POST',
      headers: { apikey: K, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.msg || d?.message || d?.error_description || d?.error || `認証エラー (${r.status})`);
    return d;
  }

  async function refreshSession(session) {
    if (!session?.refresh_token) return null;
    try {
      const d = await authRequest('token?grant_type=refresh_token', { refresh_token: session.refresh_token });
      if (d?.access_token) { saveSession(d); return d; }
    } catch {}
    return null;
  }

  function applySession(session) {
    if (!session?.access_token) return false;
    H.Authorization = `Bearer ${session.access_token}`;
    document.body.classList.remove('auth-locked');
    const gate = document.getElementById('authGate');
    if (gate) gate.style.display = 'none';
    addLogoutButton();
    return true;
  }

  function addLogoutButton() {
    if (document.getElementById('authLogoutBtn')) return;
    const header = document.querySelector('header');
    if (!header) return;
    const b = document.createElement('button');
    b.id = 'authLogoutBtn';
    b.textContent = 'ログアウト';
    b.onclick = () => {
      clearSession();
      location.reload();
    };
    header.appendChild(b);
  }

  async function login() {
    const password = document.getElementById('authPassword').value;
    if (!password) return setMsg('パスワードを入力してください。', true);
    setMsg('ログイン中…');
    try {
      const d = await authRequest('token?grant_type=password', { email: ALLOWED_EMAIL, password });
      if (!d?.access_token) throw new Error('ログインできませんでした。');
      saveSession(d);
      applySession(d);
      setMsg('');
    } catch (e) { setMsg(e.message || 'ログインに失敗しました。', true); }
  }

  async function signup() {
    const password = document.getElementById('authPassword').value;
    if (!password || password.length < 8) return setMsg('初回パスワードは8文字以上にしてください。', true);
    setMsg('初回登録中…');
    try {
      const d = await authRequest('signup', { email: ALLOWED_EMAIL, password });
      if (d?.access_token) {
        saveSession(d);
        applySession(d);
        setMsg('');
      } else {
        setMsg('確認メールを送りました。メール内の確認を完了した後、この画面で同じパスワードを使ってログインしてください。');
      }
    } catch (e) {
      const m = String(e.message || '');
      if (/already|registered|exists/i.test(m)) setMsg('このメールアドレスはすでに登録されています。「ログイン」を押してください。', true);
      else setMsg(m || '初回登録に失敗しました。', true);
    }
  }

  async function boot() {
    injectStyle();
    document.body.classList.add('auth-locked');
    gateHtml();
    document.getElementById('authLoginBtn').onclick = login;
    document.getElementById('authSignupBtn').onclick = signup;
    document.getElementById('authPassword').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

    let s = loadSession();
    if (s?.access_token) {
      const exp = Number(s.expires_at || 0);
      if (exp && Date.now()/1000 > exp - 60) s = await refreshSession(s);
      if (s?.access_token) return applySession(s);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
