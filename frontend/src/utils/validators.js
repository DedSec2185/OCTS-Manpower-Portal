export const isValidPassport = (value) => {
  if (!value) return true;
  return /^[A-Z0-9]{5,15}$/i.test(value);
};

export const isValidAadhar = (value) => {
  if (!value) return true;
  return /^\d{12}$/.test(value.replace(/\s/g, ''));
};

export const isValidPhone = (value) => {
  if (!value) return true;
  return /^[+]?[\d\s\-()]{7,15}$/.test(value);
};

export const isValidEmail = (value) => {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isDateAfter = (date1, date2) => {
  if (!date1 || !date2) return true;
  return new Date(date1) > new Date(date2);
};

export const isExpiryValid = (expiryDate) => {
  if (!expiryDate) return true;
  return new Date(expiryDate) > new Date();
};

export const isValidFileSize = (file, maxMB = 20) => {
  const maxBytes = maxMB * 1024 * 1024;
  return file.size <= maxBytes;
};

export const isValidFileType = (file, allowedTypes) => {
  const ext = file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(`.${ext}`);
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatDateInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'active':
      return '#2E7D32';
    case 'available':
      return '#1565C0';
    case 'signed_off':
      return '#5F6368';
    case 'cancelled':
      return '#C62828';
    default:
      return '#1A1A2E';
  }
};
