const BASE = '';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

export const api = {
  auth: {
    register: (username, password) =>
      request('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
    login: (username, password, remember) =>
      request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password, remember }) }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me'),
    changeUsername: (username, password) =>
      request('/api/auth/username', { method: 'PUT', body: JSON.stringify({ username, password }) }),
    changePassword: (currentPassword, newPassword) =>
      request('/api/auth/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
  },
  resume: {
    get: () => request('/api/resume'),
    save: (data) => request('/api/resume', { method: 'PUT', body: JSON.stringify(data) }),
  },
  fonts: {
    list: () => request('/api/fonts'),
  },
};
