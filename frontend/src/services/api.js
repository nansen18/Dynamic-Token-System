import { io } from 'socket.io-client';
import { API_URL } from '../config';

const API_BASE = `${API_URL.replace(/\/+$/, '')}/api`;
const SOCKET_URL = API_URL;

export const socket = io(SOCKET_URL, {
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  autoConnect: true
});

const TOKEN_KEY = 'nexus_auth_token';
const USER_KEY = 'nexus_auth_user';

export const authStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  }
};

// Generic HTTP helper
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = authStorage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(url, {
      headers,
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
  },

  // Authentication & Role-Based Access Control
  login: async ({ email, password, portalRole }) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, portalRole })
    });
    if (res.token && res.user) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  registerCustomer: async ({ name, email, password, phone }) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, role: 'CUSTOMER' })
    });
    if (res.token && res.user) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  getMe: async () => {
    return request('/auth/me');
  },

  logout: () => {
    authStorage.clear();
  },

  // Staff Account Management (Admin Authorized)
  createStaff: (payload) => {
    return request('/auth/staff', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getStaffList: () => {
    return request('/auth/staff');
  },

  getAdminStatus: () => {
    return request('/auth/admin-status');
  }
};
