import React from 'react';
import { formatDate, getStatusBadgeColor } from '../../utils/validators';
import '../../../src/styles/employee-table.css';

export function EmployeeTable({ employees, onView, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Sr.No</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Passport</th>
            <th>BOSIET</th>
            <th>PCC</th>
            <th>Phone Number</th>
            <th>DOB</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="table-row">
              <td>{emp.sr_no}</td>
              <td className="cell-name">{emp.full_name}</td>
              <td>{emp.designation}</td>
              <td className="cell-mono">{emp.passport_number}</td>
              <td className="cell-center">{emp.bosiet_done ? '✓' : '-'}</td>
              <td>{formatDate(emp.pcc_validity)}</td>
              <td>{emp.phone_number || '-'}</td>
              <td>{formatDate(emp.dob)}</td>
              <td className="cell-actions">
                <button className="btn-icon" onClick={() => onView(emp.id)} title="View">👁️</button>
                <button className="btn-icon" onClick={() => onEdit(emp.id)} title="Edit">✏️</button>
                <button className="btn-icon btn-danger" onClick={() => onDelete(emp.id)} title="Delete">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
