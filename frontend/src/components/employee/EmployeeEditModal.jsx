import React from 'react';
import { EmployeeForm } from './EmployeeForm';
import '../../styles/components.css';

export function EmployeeEditModal({ isOpen, onClose, employee, onSuccess }) {
  if (!isOpen || !employee) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container edit-modal futuristic-card animate-fade-in">
        <div className="modal-header">
          <h2>Edit Employee: {employee.full_name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <EmployeeForm 
            employee={employee} 
            onSuccess={(updatedEmployee) => {
              if (onSuccess) onSuccess(updatedEmployee);
              onClose();
            }} 
          />
        </div>
      </div>
    </div>
  );
}
