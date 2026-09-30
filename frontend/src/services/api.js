import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  autoConnect: true
});

// Generic HTTP helper
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Services
  getServices: (department) => {
    const query = department && department !== 'ALL' ? `?department=${encodeURIComponent(department)}` : '';
    return request(`/services${query}`);
  },
  updateServiceBenchmark: (serviceId, baseDurationMinutes) => {
    return request(`/services/${serviceId}/benchmark`, {
      method: 'PUT',
      body: JSON.stringify({ baseDurationMinutes })
    });
  },

  // Counters
  getCounters: (department) => {
    const query = department && department !== 'ALL' ? `?department=${encodeURIComponent(department)}` : '';
    return request(`/counters${query}`);
  },
  updateCounterStatus: (counterId, status, throughputMultiplier) => {
    return request(`/counters/${counterId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, throughputMultiplier })
    });
  },

  // Tokens
  getTokens: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.department && filters.department !== 'ALL') params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/tokens${queryString}`);
  },
  getTokenByIdOrNumber: (identifier) => {
    return request(`/tokens/${encodeURIComponent(identifier)}`);
  },
  createToken: (payload) => {
    return request('/tokens', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  callNextToken: (counterId, specificTokenId = null) => {
    return request('/tokens/call', {
      method: 'POST',
      body: JSON.stringify({ counterId, specificTokenId })
    });
  },
  startService: (tokenId) => {
    return request('/tokens/start', {
      method: 'POST',
      body: JSON.stringify({ tokenId })
    });
  },
  completeService: (tokenId, notes = '', customDurationMinutes = null) => {
    return request('/tokens/complete', {
      method: 'POST',
      body: JSON.stringify({ tokenId, notes, customDurationMinutes })
    });
  },
  markNoShow: (tokenId) => {
    return request('/tokens/noshow', {
      method: 'POST',
      body: JSON.stringify({ tokenId })
    });
  },
  recalculateSchedule: (department = null) => {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return request(`/tokens/recalculate${query}`, { method: 'POST' });
  },

  // Analytics & Demo Seeding
  getStats: (department = null) => {
    const query = department && department !== 'ALL' ? `?department=${encodeURIComponent(department)}` : '';
    return request(`/analytics/stats${query}`);
  },
  seedData: () => {
    return request('/analytics/seed', { method: 'POST' });
  }
};
