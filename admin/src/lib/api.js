const API_URL = '/api';

export function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    ...getHeaders(),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  } else if (config.body instanceof FormData) {
    // Let browser set the boundary header
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);

  if (response.status === 401 || response.status === 403) {
    // Unauthorized / Expired token - clear local storage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    if (window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(data.error || 'Bir hata oluştu.');
  }

  return data;
}

export const api = {
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: { username, password }
  }),
  
  checkAuth: () => request('/auth/me'),

  getArticles: (includeDeleted = false) => request(`/articles?deleted=${includeDeleted}`),
  getArticle: (id) => request(`/articles/${id}`),
  createArticle: (data) => request('/articles', {
    method: 'POST',
    body: data
  }),
  updateArticle: (id, data) => request(`/articles/${id}`, {
    method: 'PUT',
    body: data
  }),
  deleteArticle: (id) => request(`/articles/${id}`, {
    method: 'DELETE'
  }),
  restoreArticle: (id) => request(`/articles/${id}/restore`, {
    method: 'POST'
  }),

  getVideos: () => request('/videos'),
  createVideo: (data) => request('/videos', {
    method: 'POST',
    body: data
  }),
  updateVideo: (id, data) => request(`/videos/${id}`, {
    method: 'PUT',
    body: data
  }),
  deleteVideo: (id) => request(`/videos/${id}`, {
    method: 'DELETE'
  }),

  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', {
    method: 'POST',
    body: data
  }),
  updateCategory: (id, data) => request(`/categories/${id}`, {
    method: 'PUT',
    body: data
  }),
  deleteCategory: (id) => request(`/categories/${id}`, {
    method: 'DELETE'
  }),

  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', {
    method: 'PUT',
    body: data
  }),

  getMedia: () => request('/media'),
  uploadMedia: (formData) => request('/media/upload', {
    method: 'POST',
    body: formData
  }),
  renameMedia: (filename, newFilename) => request(`/media/${filename}`, {
    method: 'PUT',
    body: { newFilename }
  }),
  deleteMedia: (filename) => request(`/media/${filename}`, {
    method: 'DELETE'
  })
};
