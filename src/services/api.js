import axios from 'axios';
 
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});
 
// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
 
// Handle 401 - redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
 
// ── Auth ──
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
 
// ── Clans ──
export const getAllClans = () => api.get('/clans');
export const getClan = (id) => api.get(`/clans/${id}`);
export const getRecruitingClans = () => api.get('/clans/recruiting');
export const getTopClans = (limit = 10) => api.get(`/clans/top?limit=${limit}`);
export const createClan = (data) => api.post('/clans', data);
export const updateClan = (id, data) => api.put(`/clans/${id}`, data);
export const disbandClan = (id) => api.delete(`/clans/${id}`);
export const getClanMembers = (id) => api.get(`/clans/${id}/members`);
 
// ── Members ──
export const joinClan = (clanId) => api.post(`/clans/${clanId}/members/join`);
export const leaveClan = (clanId) => api.delete(`/clans/${clanId}/members/leave`);
export const kickMember = (clanId, memberId) => api.delete(`/clans/${clanId}/members/${memberId}/kick`);
export const updateMemberRole = (clanId, memberId, role) =>
  api.patch(`/clans/${clanId}/members/${memberId}/role`, { memberRole: role });
 
export default api;
 