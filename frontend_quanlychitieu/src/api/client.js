import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Tu dong gan token vao moi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Neu token het han -> dang xuat
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      // tranh vong lap khi dang o trang dang nhap
      if (!location.pathname.startsWith('/dang-nhap')) {
        location.href = '/dang-nhap';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
