const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function scanContent(inputType, content) {
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

export async function getScanHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.risk_level) query.append('risk_level', params.risk_level);
  if (params.scan_type) query.append('scan_type', params.scan_type);
  if (params.search) query.append('search', params.search);
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);

  const res = await fetch(`${API_BASE}/history?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch scan history');
  return res.json();
}

export async function deleteScanRecord(recordId) {
  const res = await fetch(`${API_BASE}/history/${recordId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete scan record');
  return res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'DELETE',
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
