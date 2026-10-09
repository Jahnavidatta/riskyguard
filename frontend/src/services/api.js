const API_BASE = 'https://riskyguard-backend.onrender.com/api';

function getAuthHeaders() {
  const token = localStorage.getItem('riskradar_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(url, options = {}) {
  const token = localStorage.getItem('riskradar_token');
  const headers = {
    ...options.headers,
    ...(options.body && typeof options.body === 'string' && !options.headers?.['Content-Type']
      ? { 'Content-Type': 'application/json' }
      : {})
  };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    // If not on login/register, clear auth state
    if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
      localStorage.removeItem('riskradar_token');
      localStorage.removeItem('riskradar_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }

  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch (e) {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  async login(email, password) {
    const data = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.access_token) {
      localStorage.setItem('riskradar_token', data.access_token);
      localStorage.setItem('riskradar_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(userData) {
    const data = await request(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.access_token) {
      localStorage.setItem('riskradar_token', data.access_token);
      localStorage.setItem('riskradar_user', JSON.stringify(data.user));
    }
    return data;
  },

  async forgotPassword(email) {
    return request(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async getMe() {
    return request(`${API_BASE}/auth/me`);
  },

  logout() {
    localStorage.removeItem('riskradar_token');
    localStorage.removeItem('riskradar_user');
  },

  getStoredUser() {
    try {
      const u = localStorage.getItem('riskradar_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('riskradar_token');
  },

  // Brands
  async getBrands() {
    return request(`${API_BASE}/brands/`);
  },

  async createBrand(data) {
    return request(`${API_BASE}/brands/`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateBrand(brandId, data) {
    return request(`${API_BASE}/brands/${brandId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteBrand(brandId) {
    return request(`${API_BASE}/brands/${brandId}`, {
      method: 'DELETE'
    });
  },

  // Threats
  async getThreats(filters = {}) {
    const params = new URLSearchParams();
    if (filters.brand_id) params.append('brand_id', filters.brand_id);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.status) params.append('status', filters.status);
    if (filters.threat_type) params.append('threat_type', filters.threat_type);
    if (filters.search) params.append('search', filters.search);
    if (filters.is_sample !== undefined && filters.is_sample !== '') params.append('is_sample', filters.is_sample);

    return request(`${API_BASE}/threats/?${params.toString()}`);
  },

  async scanThreat(payload) {
    return request(`${API_BASE}/threats/scan`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getThreat(id) {
    return request(`${API_BASE}/threats/${id}`);
  },

  async updateThreatStatus(id, status, notes = '') {
    return request(`${API_BASE}/threats/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  },

  async getCaseNotes(threatId) {
    return request(`${API_BASE}/threats/${threatId}/notes`);
  },

  async addCaseNote(threatId, action, notes) {
    return request(`${API_BASE}/threats/${threatId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    });
  },

  async deleteThreat(threatId) {
    return request(`${API_BASE}/threats/${threatId}`, {
      method: 'DELETE'
    });
  },

  // Unique Feature 1: Hidden Threat Connection Finder (NetworkX)
  async getThreatGraph(brandId = null, minRisk = 0) {
    const params = new URLSearchParams();
    if (brandId) params.append('brand_id', brandId);
    if (minRisk > 0) params.append('min_risk', minRisk);
    return request(`${API_BASE}/graph/threat-connections?${params.toString()}`);
  },

  // Unique Feature 2: Early Warning System
  async getEarlyWarnings(brandId = null) {
    const url = brandId ? `${API_BASE}/extensions/early-warnings?brand_id=${brandId}` : `${API_BASE}/extensions/early-warnings`;
    return request(url);
  },

  async updateEarlyWarningStatus(alertId, status) {
    return request(`${API_BASE}/extensions/early-warnings/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Unique Feature 3: Digital Risk What-If Simulator
  async getSimulationScenarios() {
    return request(`${API_BASE}/extensions/simulation/scenarios`);
  },

  async runSimulation(scenario_key, active_countermeasures) {
    return request(`${API_BASE}/extensions/simulation/run`, {
      method: 'POST',
      body: JSON.stringify({ scenario_key, active_countermeasures })
    });
  },

  // Explainable Investigation Assistant
  async getAssistantBrief(threatId) {
    return request(`${API_BASE}/extensions/assistant/explain/${threatId}`);
  },

  // Campaign Timeline
  async getTimeline(threatId) {
    return request(`${API_BASE}/extensions/timeline/${threatId}`);
  },

  // Dashboard Overview Metrics
  async getDashboardStats(brandId = null) {
    const url = brandId ? `${API_BASE}/dashboard/stats?brand_id=${brandId}` : `${API_BASE}/dashboard/stats`;
    return request(url);
  },

  // Reset Demo Dataset
  async resetDemoData() {
    return request(`${API_BASE}/seed/demo-data`, {
      method: 'POST'
    });
  }
};
