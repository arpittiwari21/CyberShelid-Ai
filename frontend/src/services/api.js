const API_BASE = '/api';

// Authentication Token Storage Helpers
export function getAuthToken() {
  return localStorage.getItem('cybershield_token') || null;
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('cybershield_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  localStorage.setItem('cybershield_token', token);
  localStorage.setItem('cybershield_user', JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem('cybershield_token');
  localStorage.removeItem('cybershield_user');
}

function getAuthHeaders() {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Authentication Endpoints
export async function registerUser({ username, email, password, role }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  const data = await res.json();
  setAuthSession(data.access_token, data.user);
  return data;
}

export async function loginUser({ login, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Invalid username/email or password');
  }
  const data = await res.json();
  setAuthSession(data.access_token, data.user);
  return data;
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    clearAuthSession();
    return null;
  }
  const user = await res.json();
  localStorage.setItem('cybershield_user', JSON.stringify(user));
  return user;
}

// System Health
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

// Threat Scanner
export async function scanContent(inputType, content) {
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      input_type: inputType,
      content: content,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Scan request failed' }));
    throw new Error(err.detail || 'Scan request failed');
  }
  return res.json();
}

// Scan History
export async function getScanHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.risk_level) query.append('risk_level', params.risk_level);
  if (params.scan_type) query.append('scan_type', params.scan_type);
  if (params.search) query.append('search', params.search);
  if (params.only_mine) query.append('only_mine', 'true');
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);

  const res = await fetch(`${API_BASE}/history?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch scan history');
  return res.json();
}

export async function deleteScanRecord(recordId) {
  const res = await fetch(`${API_BASE}/history/${recordId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete scan record');
  return res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to clear history');
  return res.json();
}

export async function getSystemStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch system stats');
  return res.json();
}

export async function getGuidance() {
  const res = await fetch(`${API_BASE}/guidance`);
  if (!res.ok) throw new Error('Failed to fetch guidance');
  return res.json();
}
