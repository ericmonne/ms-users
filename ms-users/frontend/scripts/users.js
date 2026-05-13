/* ── Users Module ────────────────────────────────────────────
   User list, detail, edit, password change, activate/deactivate
   ─────────────────────────────────────────────────────────── */

let usersState = { page: 1, size: 9, data: [], loading: false }; // backend uses page starting at 1

/* ════════════════════════════════════════════════════════════
   USERS LIST SECTION
   ════════════════════════════════════════════════════════════ */
function renderUsersSection() {
  setTopbar('Usuários', `
    <button class="btn btn--primary btn--sm" id="btn-refresh-users" onclick="loadUsers()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      Atualizar
    </button>
  `);

  getMainContent().innerHTML = `
    <div class="section-header">
      <h3>Gerenciar Usuários</h3>
    </div>
    <div class="search-bar">
      <div class="field-input-wrap" style="flex:1;min-width:220px">
        <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input id="user-search" type="text" class="field-input" placeholder="Filtrar por nome, login ou e-mail…" oninput="filterUsers()" />
      </div>
      <select id="user-filter-role" class="field-input field-select" style="width:auto;padding-left:12px" onchange="filterUsers()">
        <option value="">Todos os perfis</option>
        <option value="OWNER">Proprietário</option>
        <option value="CLIENT">Cliente</option>
      </select>
    </div>
    <div id="users-grid" class="users-grid"></div>
    <div id="pagination" class="pagination"></div>
  `;

  loadUsers();
}

async function loadUsers() {
  if (usersState.loading) return;
  usersState.loading = true;

  const grid = document.getElementById('users-grid');
  if (!grid) return;

  // Show skeletons
  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="user-card" style="cursor:default">
      <div class="user-card-header">
        <div class="skeleton" style="width:44px;height:44px;border-radius:50%"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div class="skeleton" style="height:14px;width:70%"></div>
          <div class="skeleton" style="height:11px;width:45%"></div>
        </div>
      </div>
      <div class="skeleton" style="height:11px;width:80%"></div>
    </div>
  `).join('');

  try {
    const list = await Api.listUsers(usersState.page, usersState.size);
    usersState.data = Array.isArray(list) ? list : [];
    renderUsersGrid(usersState.data);
    renderPagination();
  } catch (err) {
    const isPermissionError = err.message?.includes('403') || err.message?.toLowerCase().includes('access denied') || err.message?.toLowerCase().includes('forbidden');
    const displayMsg = isPermissionError
      ? 'Acesso negado. Somente usuários com perfil <strong>Proprietário (OWNER)</strong> podem listar todos os usuários.'
      : (err.message || 'Erro ao carregar usuários.');
    grid.innerHTML = `
      <div class="state-box" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>${displayMsg}</p>
        ${isPermissionError ? '<p style="font-size:0.78rem;color:var(--text-dim)">Faça logout e entre com uma conta OWNER para ter acesso.</p>' : ''}
      </div>
    `;
    if (!isPermissionError) showToast(err.message || 'Erro ao carregar usuários.', 'error');
  } finally {
    usersState.loading = false;
  }
}

function filterUsers() {
  const q    = (document.getElementById('user-search')?.value || '').toLowerCase();
  const role = document.getElementById('user-filter-role')?.value || '';
  const filtered = usersState.data.filter(u => {
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.login?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchR = !role || u.role === role;
    return matchQ && matchR;
  });
  renderUsersGrid(filtered);
}

function renderUsersGrid(users) {
  const grid = document.getElementById('users-grid');
  if (!grid) return;

  if (!users.length) {
    grid.innerHTML = `
      <div class="state-box" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p>Nenhum usuário encontrado.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = users.map(u => `
    <div class="user-card" onclick="openUserDetail('${u.id}')" role="button" tabindex="0"
         aria-label="Ver detalhes de ${escHtml(u.name)}">
      <div class="user-card-header">
        <div class="user-card-avatar">${initials(u.name)}</div>
        <div class="user-card-info">
          <div class="user-card-name">${escHtml(u.name)}</div>
          <div class="user-card-login">@${escHtml(u.login)}</div>
        </div>
        <span class="badge badge--${u.role === 'OWNER' ? 'owner' : 'client'}">
          ${u.role === 'OWNER' ? 'Owner' : 'Client'}
        </span>
      </div>
      <div class="user-card-email">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        ${escHtml(u.email)}
      </div>
    </div>
  `).join('');
}

function renderPagination() {
  const el = document.getElementById('pagination');
  if (!el) return;
  el.innerHTML = `
    <button class="btn btn--ghost btn--sm" onclick="changePage(-1)" ${usersState.page <= 1 ? 'disabled' : ''}>
      ← Anterior
    </button>
    <span class="pagination-info">Página ${usersState.page}</span>
    <button class="btn btn--ghost btn--sm" onclick="changePage(1)" ${usersState.data.length < usersState.size ? 'disabled' : ''}>
      Próxima →
    </button>
  `;
}

function changePage(delta) {
  usersState.page = Math.max(1, usersState.page + delta); // backend pages start at 1
  loadUsers();
}

/* ════════════════════════════════════════════════════════════
   USER DETAIL
   ════════════════════════════════════════════════════════════ */
async function openUserDetail(id) {
  openModal('<p class="state-box" style="padding:40px">Carregando…</p>');
  try {
    const u = await Api.getUserById(id);
    renderDetailModal(u);
  } catch (err) {
    closeModal();
    showToast(err.message || 'Erro ao carregar usuário.', 'error');
  }
}

function renderDetailModal(u) {
  const addresses = (u.address || []).map(a => `
    <div class="address-card">
      <div>
        <div class="address-field-label">Rua</div>
        <div class="address-field-value">${escHtml(a.street)}, ${a.number}</div>
      </div>
      <div>
        <div class="address-field-label">Bairro</div>
        <div class="address-field-value">${escHtml(a.neighborhood)}</div>
      </div>
      <div>
        <div class="address-field-label">Cidade / UF</div>
        <div class="address-field-value">${escHtml(a.city)} / ${escHtml(a.state)}</div>
      </div>
      <div>
        <div class="address-field-label">CEP</div>
        <div class="address-field-value">${escHtml(a.zipcode)}</div>
      </div>
      ${a.complement ? `<div style="grid-column:1/-1">
        <div class="address-field-label">Complemento</div>
        <div class="address-field-value">${escHtml(a.complement)}</div>
      </div>` : ''}
    </div>
  `).join('');

  setModalContent(`
    <div class="detail-header">
      <div class="detail-avatar">${initials(u.name)}</div>
      <div class="detail-info">
        <div class="detail-name">${escHtml(u.name)}</div>
        <div class="detail-meta">
          <span class="badge badge--${u.role === 'OWNER' ? 'owner' : 'client'}">
            ${u.role === 'OWNER' ? 'Proprietário' : 'Cliente'}
          </span>
        </div>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-item">
        <div class="detail-item-label">Login</div>
        <div class="detail-item-value">@${escHtml(u.login)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-item-label">E-mail</div>
        <div class="detail-item-value">${escHtml(u.email)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-item-label">ID</div>
        <div class="detail-item-value" style="font-size:0.72rem;color:var(--text-muted)">${u.id}</div>
      </div>
    </div>

    ${addresses ? `<p class="section-subtitle">Endereços</p>${addresses}` : ''}

    <div class="action-row">
      <button class="btn btn--ghost btn--sm" onclick="openEditModal('${u.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Editar
      </button>
      <button class="btn btn--ghost btn--sm" onclick="openChangePasswordModal('${u.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Alterar Senha
      </button>
      <button class="btn btn--success btn--sm" onclick="handleToggleActivation('${u.id}', true)">Ativar</button>
      <button class="btn btn--danger btn--sm" onclick="handleToggleActivation('${u.id}', false)">Desativar</button>
    </div>
  `);
}

/* ════════════════════════════════════════════════════════════
   EDIT USER MODAL
   ════════════════════════════════════════════════════════════ */
async function openEditModal(id) {
  openModal('<p class="state-box" style="padding:40px">Carregando…</p>');
  try {
    const u = await Api.getUserById(id);
    const addr = (u.address && u.address[0]) || {};
    setModalContent(`
      <h2 class="modal-title">Editar Usuário</h2>
      <form class="modal-form" onsubmit="submitEditUser(event, '${u.id}')">
        <div class="fields-row">
          <div class="field-group">
            <label class="field-label">Nome</label>
            <div class="field-input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input id="edit-name" type="text" class="field-input" value="${escHtml(u.name)}" required />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Login</label>
            <div class="field-input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input id="edit-login" type="text" class="field-input" value="${escHtml(u.login)}" required />
            </div>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">E-mail</label>
          <div class="field-input-wrap">
            <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input id="edit-email" type="email" class="field-input" value="${escHtml(u.email)}" required />
          </div>
        </div>
        <p class="section-label">Endereço</p>
        <div class="fields-row">
          <div class="field-group">
            <label class="field-label">CEP</label>
            <div class="field-input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input id="edit-zip" type="text" class="field-input" value="${escHtml(addr.zipcode||'')}" required />
            </div>
          </div>
          <div class="field-group" style="flex:2">
            <label class="field-label">Rua</label>
            <div class="field-input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
              <input id="edit-street" type="text" class="field-input" value="${escHtml(addr.street||'')}" required />
            </div>
          </div>
        </div>
        <div class="fields-row">
          <div class="field-group">
            <label class="field-label">Número</label>
            <div class="field-input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/></svg>
              <input id="edit-number" type="number" class="field-input" value="${addr.number||''}" required />
            </div>
          </div>
          <div class="field-group" style="flex:2">
            <label class="field-label">Complemento <span class="optional">(opcional)</span></label>
            <div class="field-input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
              <input id="edit-complement" type="text" class="field-input" value="${escHtml(addr.complement||'')}" />
            </div>
          </div>
        </div>
        <div class="fields-row">
          <div class="field-group">
            <label class="field-label">Bairro</label>
            <div class="field-input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <input id="edit-neighborhood" type="text" class="field-input" value="${escHtml(addr.neighborhood||'')}" required />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Cidade</label>
            <div class="field-input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <input id="edit-city" type="text" class="field-input" value="${escHtml(addr.city||'')}" required />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">UF</label>
            <div class="field-input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <input id="edit-state" type="text" class="field-input" value="${escHtml(addr.state||'')}" maxlength="2" required />
            </div>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button type="button" class="btn btn--ghost btn--full" onclick="closeModal()">Cancelar</button>
          <button type="submit" id="btn-edit-submit" class="btn btn--primary btn--full">
            <span class="btn-text">Salvar</span>
            <span class="btn-spinner hidden"></span>
          </button>
        </div>
      </form>
    `);
  } catch (err) {
    closeModal();
    showToast(err.message || 'Erro ao carregar dados.', 'error');
  }
}

async function submitEditUser(e, id) {
  e.preventDefault();
  const btn = document.getElementById('btn-edit-submit');
  const dto = {
    name:  document.getElementById('edit-name').value.trim(),
    login: document.getElementById('edit-login').value.trim(),
    email: document.getElementById('edit-email').value.trim(),
    address: [{
      zipcode:      document.getElementById('edit-zip').value.trim(),
      street:       document.getElementById('edit-street').value.trim(),
      number:       parseInt(document.getElementById('edit-number').value, 10),
      complement:   document.getElementById('edit-complement').value.trim() || null,
      neighborhood: document.getElementById('edit-neighborhood').value.trim(),
      city:         document.getElementById('edit-city').value.trim(),
      state:        document.getElementById('edit-state').value.trim().toUpperCase(),
    }],
  };
  setButtonLoading(btn, true);
  try {
    await Api.updateUser(id, dto);
    showToast('Usuário atualizado com sucesso!', 'success');
    closeModal();
    loadUsers();
  } catch (err) {
    showToast(err.message || 'Erro ao atualizar.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

/* ════════════════════════════════════════════════════════════
   CHANGE PASSWORD MODAL
   ════════════════════════════════════════════════════════════ */
function openChangePasswordModal(id) {
  setModalContent(`
    <h2 class="modal-title">Alterar Senha</h2>
    <form class="modal-form" onsubmit="submitChangePassword(event,'${id}')">
      <div class="field-group">
        <label class="field-label">Senha atual</label>
        <div class="field-input-wrap">
          <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input id="cp-old" type="password" class="field-input" placeholder="••••••••" required />
          <button type="button" class="toggle-pass" onclick="togglePass('cp-old',this)" aria-label="Mostrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Nova senha</label>
        <div class="field-input-wrap">
          <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input id="cp-new" type="password" class="field-input" placeholder="••••••••" required />
          <button type="button" class="toggle-pass" onclick="togglePass('cp-new',this)" aria-label="Mostrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button type="button" class="btn btn--ghost btn--full" onclick="closeModal()">Cancelar</button>
        <button type="submit" id="btn-cp-submit" class="btn btn--primary btn--full">
          <span class="btn-text">Alterar</span>
          <span class="btn-spinner hidden"></span>
        </button>
      </div>
    </form>
  `);
}

async function submitChangePassword(e, id) {
  e.preventDefault();
  const btn = document.getElementById('btn-cp-submit');
  const oldPass = document.getElementById('cp-old').value;
  const newPass = document.getElementById('cp-new').value;
  if (!oldPass || !newPass) { showToast('Preencha os dois campos.', 'error'); return; }
  setButtonLoading(btn, true);
  try {
    await Api.changePassword(id, { oldPassword: oldPass, newPassword: newPass });
    showToast('Senha alterada com sucesso!', 'success');
    closeModal();
  } catch (err) {
    showToast(err.message || 'Erro ao alterar senha.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

/* ════════════════════════════════════════════════════════════
   ACTIVATE / DEACTIVATE
   ════════════════════════════════════════════════════════════ */
async function handleToggleActivation(id, activate) {
  try {
    await Api.toggleActivation(id, activate);
    showToast(activate ? 'Usuário ativado!' : 'Usuário desativado!', 'success');
    closeModal();
    loadUsers();
  } catch (err) {
    showToast(err.message || 'Erro ao alterar status.', 'error');
  }
}

/* ════════════════════════════════════════════════════════════
   PROFILE SECTION
   ════════════════════════════════════════════════════════════ */
async function renderProfileSection() {
  setTopbar('Meu Perfil');
  const main = getMainContent();
  main.innerHTML = `<div class="state-box"><div class="btn-spinner" style="width:32px;height:32px;border-width:3px"></div></div>`;

  const id = sessionStorage.getItem('currentUserId');
  if (!id) {
    main.innerHTML = `<div class="state-box"><p>Nenhum ID de usuário em sessão. Faça login novamente.</p></div>`;
    return;
  }
  try {
    const u = await Api.getUserById(id);
    main.innerHTML = `
      <div class="profile-wrap">
        <div class="detail-header">
          <div class="detail-avatar" style="width:72px;height:72px;font-size:1.6rem">${initials(u.name)}</div>
          <div class="detail-info">
            <div class="detail-name">${escHtml(u.name)}</div>
            <div class="detail-meta">
              <span class="badge badge--${u.role==='OWNER'?'owner':'client'}">${u.role==='OWNER'?'Proprietário':'Cliente'}</span>
            </div>
          </div>
        </div>
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-item-label">Login</div><div class="detail-item-value">@${escHtml(u.login)}</div></div>
          <div class="detail-item"><div class="detail-item-label">E-mail</div><div class="detail-item-value">${escHtml(u.email)}</div></div>
          <div class="detail-item" style="grid-column:1/-1"><div class="detail-item-label">ID</div><div class="detail-item-value" style="font-size:0.72rem;color:var(--text-muted)">${u.id}</div></div>
        </div>
        <div class="action-row">
          <button class="btn btn--ghost btn--sm" onclick="openEditModal('${u.id}')">Editar Dados</button>
          <button class="btn btn--ghost btn--sm" onclick="openChangePasswordModal('${u.id}')">Alterar Senha</button>
        </div>
      </div>
    `;
  } catch (err) {
    main.innerHTML = `<div class="state-box"><p>${err.message}</p></div>`;
  }
}
