import axiosClient from './axiosClient';

export const authApi = {
  login: (username, password) =>
    axiosClient.post('/auth/login', { username, password }),

  getMe: () => axiosClient.get('/auth/me'),

  register: (data) =>
    axiosClient.post('/auth/register', data),

  changePassword: (currentPassword, newPassword) =>
    axiosClient.patch('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  updateProfile: (data) =>
    axiosClient.put('/auth/profile', data),
};
