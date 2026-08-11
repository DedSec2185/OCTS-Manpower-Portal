import axiosClient from './axiosClient';

export const employeeApi = {
  createEmployee: (data) =>
    axiosClient.post('/employees', data),

  getAllEmployees: (params) =>
    axiosClient.get('/employees', { params }),

  searchEmployees: (params) =>
    axiosClient.get('/employees/search', { params }),

  getEmployee: (id) =>
    axiosClient.get(`/employees/${id}`),

  updateEmployee: (id, data) =>
    axiosClient.patch(`/employees/${id}`, data),

  deleteEmployee: (id) =>
    axiosClient.delete(`/employees/${id}`),

  uploadDocument: (id, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/employees/${id}/upload/${docType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteDocument: (id, docType) =>
    axiosClient.delete(`/employees/${id}/upload/${docType}`),

  downloadDocument: (id, docType) =>
    axiosClient.get(`/employees/${id}/download/${docType}`, {
      responseType: 'blob',
    }),
};
