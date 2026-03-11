import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 503) {
      window.location.href = '/db-error';
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const getEmployees = async () => {
  const response = await api.get('/employees');
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

export const deleteEmployee = async (employeeId) => {
  const response = await api.delete(`/employees/${employeeId}`);
  return response.data;
};

export const applyLeave = async (leaveData) => {
  const response = await api.post('/leaves', leaveData);
  return response.data;
};

export const getMyLeaves = async () => {
  const response = await api.get('/my-leaves');
  return response.data;
};

export const getAllLeaves = async () => {
  const response = await api.get('/leaves');
  return response.data;
};

export const updateLeaveStatus = async (leaveId, status, manager_comment) => {
  const response = await api.put(`/leaves/${leaveId}`, { status, manager_comment });
  return response.data;
};

export const getMyBalance = async () => {
  const response = await api.get('/my-balance');
  return response.data;
};

export const getEmployeeBalance = async (employeeId) => {
  const response = await api.get(`/employee-balance/${employeeId}`);
  return response.data;
};

export const getEmployeeLeaves = async (employeeId) => {
  const response = await api.get(`/employee-leaves/${employeeId}`);
  return response.data;
};

export const deleteLeave = async (leaveId) => {
  const response = await api.delete(`/leaves/${leaveId}`);
  return response.data;
};

export default api;
