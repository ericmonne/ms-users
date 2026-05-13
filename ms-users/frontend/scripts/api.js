/* ── API Layer ───────────────────────────────────────────────
   All HTTP calls to the ms-users backend (port 8080)
   ─────────────────────────────────────────────────────────── */

const API_BASE = 'http://localhost:8080';

const Api = (() => {

  function getToken() {
    return sessionStorage.getItem('jwt') || localStorage.getItem('jwt') || '';
  }

  async function request(method, path, body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const t = getToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;
    }
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);

    if (res.status === 204) return null;

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      // Try to extract a meaningful error message
      const msg =
        (typeof data === 'object' && data !== null
          ? (data.message || (data.errors && data.errors.join(', ')) || JSON.stringify(data))
          : data) || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data;
  }

  return {
    // Auth
    login:    (dto)         => request('POST', '/users/login', dto, false),
    register: (dto)         => request('POST', '/users', dto, false),

    // Users (require JWT)
    listUsers:       (page, size) => request('GET', `/users?page=${page}&size=${size}`),
    getUserById:     (id)         => request('GET', `/users/${id}`),
    updateUser:      (id, dto)    => request('PUT', `/users/${id}`, dto),
    toggleActivation:(id, active) => request('PATCH', `/users/${id}?activate=${active}`),
    changePassword:  (id, dto)    => request('PATCH', `/users/${id}/password`, dto),
  };
})();
