import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const language = localStorage.getItem('selectedLanguage') || 'english';
  config.headers['X-Language'] = language;
  return config;
});

export default api;

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  getDashboard: () => api.get('/auth/dashboard')
};

export const chaptersAPI = {
  getAll: (lang) => {
    const language = lang || localStorage.getItem('selectedLanguage') || 'english';
    return api.get(`/chapters?language=${language}`);
  },
  getChapter: (chapterId) => api.get(`/chapters/${chapterId}`),
  getLesson: (chapterId, lessonId) => api.get(`/chapters/${chapterId}/lessons/${lessonId}`),
  create: (language, chapterData) => api.post(`/admin/chapters?language=${language}`, chapterData),
  update: (chapterId, chapterData) => api.put(`/admin/chapters/${chapterId}`, chapterData),
  delete: (chapterId) => api.delete(`/admin/chapters/${chapterId}`)
};

export const practiceAPI = {
  getAll: (lang) => {
    const language = lang || localStorage.getItem('selectedLanguage') || 'english';
    return api.get(`/practice?language=${language}`);
  },
  getSession: (sessionNumber) => api.get(`/practice/session/${sessionNumber}`),
  create: (language, sessionData) => api.post(`/admin/practice?language=${language}`, sessionData),
  update: (sessionNumber, sessionData) => api.put(`/admin/practice/${sessionNumber}`, sessionData),
  delete: (sessionNumber) => api.delete(`/admin/practice/${sessionNumber}`)
};

export const progressAPI = {
  getLessonProgress: (lang) => {
    const language = lang || localStorage.getItem('selectedLanguage') || 'english';
    return api.get(`/progress/lessons?language=${language}`);
  },
  submitLesson: (lessonData) => api.post('/progress/lessons', lessonData),
  getPracticeProgress: (lang) => {
    const language = lang || localStorage.getItem('selectedLanguage') || 'english';
    return api.get(`/progress/practice?language=${language}`);
  },
  submitPractice: (practiceData) => api.post('/progress/practice', practiceData)
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data)
};