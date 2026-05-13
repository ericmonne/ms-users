/* ── UI Helpers ──────────────────────────────────────────────
   Toast, modal, button-loading, misc
   ─────────────────────────────────────────────────────────── */

/* ---- Toast ---- */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `<div class="toast-dot"></div><span>${escHtml(message)}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove());
  }, 3500);
}

/* ---- Modal ---- */
function openModal(html = '') {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  content.innerHTML = html;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function setModalContent(html) {
  document.getElementById('modal-content').innerHTML = html;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// Close modal when clicking overlay (but not the card)
document.getElementById('modal-overlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

/* ---- Button loading state ---- */
function setButtonLoading(btn, loading) {
  const text    = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  text?.classList.toggle('hidden', loading);
  spinner?.classList.toggle('hidden', !loading);
}

/* ---- Sidebar mobile ---- */
function toggleSidebar(open) {
  document.getElementById('sidebar').classList.toggle('open', open);
  document.getElementById('sidebar-overlay').classList.toggle('hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
}

/* ---- Topbar helpers ---- */
function setTopbar(title, actionsHtml = '') {
  document.getElementById('topbar-title').textContent = title;
  document.getElementById('topbar-actions').innerHTML = actionsHtml;
}

function getMainContent() {
  return document.getElementById('main-content');
}

/* ---- Nav highlight ---- */
function setActiveNav(id) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`nav-${id}`)?.classList.add('active');
}

/* ---- Utilities ---- */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ---- Keyboard: close modal with Escape ---- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
