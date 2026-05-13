/* ── Auth Module ─────────────────────────────────────────────
   Login / Register logic + session management
   ─────────────────────────────────────────────────────────── */

/* ---- Tab switcher ---- */
function showAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('form-login').classList.toggle('hidden', !isLogin);
  document.getElementById('form-register').classList.toggle('hidden', isLogin);
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
}

/* ---- Toggle password visibility ---- */
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
}

/* ---- Login handler ---- */
async function handleLogin(e) {
  e.preventDefault();
  const btn    = document.getElementById('btn-login');
  const login  = document.getElementById('login-username').value.trim();
  const pass   = document.getElementById('login-password').value;

  if (!login || !pass) { showToast('Preencha login e senha.', 'error'); return; }

  setButtonLoading(btn, true);
  try {
    const data = await Api.login({ login, password: pass });
    sessionStorage.setItem('jwt', data.tokenJWT);

    // Decode JWT payload to get user info (no library needed)
    const payload = parseJwtPayload(data.tokenJWT);
    sessionStorage.setItem('userLogin', payload.sub || login);

    showToast('Login realizado com sucesso!', 'success');
    initDashboard();
  } catch (err) {
    showToast(err.message || 'Credenciais inválidas.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

/* ---- Register handler ---- */
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-register');

  const dto = {
    name:     document.getElementById('reg-name').value.trim(),
    login:    document.getElementById('reg-login').value.trim(),
    email:    document.getElementById('reg-email').value.trim(),
    password: document.getElementById('reg-password').value,
    role:     document.getElementById('reg-role').value,
    address: [{
      zipcode:      document.getElementById('reg-zip').value.trim(),
      street:       document.getElementById('reg-street').value.trim(),
      number:       parseInt(document.getElementById('reg-number').value, 10),
      complement:   document.getElementById('reg-complement').value.trim() || null,
      neighborhood: document.getElementById('reg-neighborhood').value.trim(),
      city:         document.getElementById('reg-city').value.trim(),
      state:        document.getElementById('reg-state').value.trim().toUpperCase(),
    }],
  };

  if (!dto.name || !dto.login || !dto.email || !dto.password) {
    showToast('Preencha todos os campos obrigatórios.', 'error'); return;
  }

  setButtonLoading(btn, true);
  try {
    const data = await Api.register(dto);
    sessionStorage.setItem('jwt', data.tokenJWT);
    sessionStorage.setItem('userLogin', dto.login);
    sessionStorage.setItem('currentUserId', data.user.id);
    showToast('Conta criada! Bem-vindo(a) 🎉', 'success');
    initDashboard();
  } catch (err) {
    showToast(err.message || 'Erro ao criar conta.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

/* ---- Logout ---- */
function handleLogout() {
  sessionStorage.clear();
  localStorage.removeItem('jwt');
  document.getElementById('page-auth').classList.add('active');
  document.getElementById('page-auth').classList.remove('hidden');
  document.getElementById('page-dashboard').classList.add('hidden');
  showToast('Sessão encerrada.', 'info');
}

/* ---- Helpers ---- */
function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch { return {}; }
}
