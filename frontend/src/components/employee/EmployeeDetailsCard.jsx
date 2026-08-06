import React from 'react';
import '../../styles/components.css';

export function EmployeeDetailsCard({ title, icon, children }) {
  return (
    <div className="details-card futuristic-card">
      <div className="details-card-header">
        <span className="details-card-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="details-card-body">
        {children}
      </div>
    </div>
  );
}

export function DetailItem({ label, value, fullWidth = false }) {
  return (
    <div className={`detail-item ${fullWidth ? 'full-width' : ''}`}>
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || 'N/A'}</span>
    </div>
  );
}
