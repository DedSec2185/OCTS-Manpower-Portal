import axiosClient from './axiosClient';

export const adminApi = {
  getStats: () =>
    axiosClient.get('/admin/stats'),

  exportExcel: () =>
    axiosClient.get('/admin/employees/export-excel', {
      responseType: 'blob',
    }),

  getAuditLogs: (params) =>
    axiosClient.get('/admin/audit-logs', { params }),

  getUsers: (params) =>
    axiosClient.get('/admin/users', { params }),

  createUser: (data) =>
    axiosClient.post('/admin/users', data),

  updateUser: (id, data) =>
    axiosClient.patch(`/admin/users/${id}`, data),

  deleteUser: (id) =>
    axiosClient.delete(`/admin/users/${id}`),
};
