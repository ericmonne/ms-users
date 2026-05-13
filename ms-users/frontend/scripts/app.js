/* ── App Entry Point ─────────────────────────────────────────
   Bootstrap, routing, session check
   ─────────────────────────────────────────────────────────── */

/* ---- Router ---- */
function navigateTo(section) {
  setActiveNav(section);
  toggleSidebar(false); // close on mobile
  if (section === 'users')   renderUsersSection();
  if (section === 'profile') renderProfileSection();
}

/* ---- Dashboard init (after login) ---- */
function initDashboard() {
  // Hide auth, show dashboard
  document.getElementById('page-auth').classList.remove('active');
  document.getElementById('page-auth').classList.add('hidden');
  document.getElementById('page-dashboard').classList.remove('hidden');
  document.getElementById('page-dashboard').classList.add('active');

  // Fill sidebar user info
  const login = sessionStorage.getItem('userLogin') || '—';
  document.getElementById('sidebar-username').textContent = login;
  document.getElementById('sidebar-avatar').textContent   = login[0]?.toUpperCase() || '?';
  document.getElementById('sidebar-role').textContent     = 'Autenticado';

  // Navigate to default section
  navigateTo('users');
}

/* ---- Bootstrap on page load ---- */
(function bootstrap() {
  const jwt = sessionStorage.getItem('jwt') || localStorage.getItem('jwt');
  if (jwt) {
    initDashboard();
  } else {
    // Show auth page
    document.getElementById('page-auth').classList.add('active');
    document.getElementById('page-dashboard').classList.add('hidden');
  }
})();
