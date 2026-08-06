import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { EmployeeForm } from '../components/employee/EmployeeForm';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { employeeApi } from '../api/employeeApi';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

export function AddEmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isClerk } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  // Determine where to go back based on role
  const backPath = isAdmin ? '/admin/employees' : '/clerk';

  useEffect(() => {
    if (id) {
      const loadEmployee = async () => {
        try {
          setLoading(true);
          const response = await employeeApi.getEmployee(id);
          setEmployee(response.data);
        } catch (error) {
          toast.error('Failed to load employee details');
          navigate(backPath);
        } finally {
          setLoading(false);
        }
      };
      loadEmployee();
    } else {
      setEmployee(null);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className="dashboard-page-header">
          <div className="header-left">
            <h1>{id ? 'Edit Employee Details' : 'Register New Employee'}</h1>
          </div>
          <div className="header-right">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(backPath)}
              style={{ fontSize: '0.9rem' }}
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="dashboard-section">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <EmployeeForm
              employee={employee}
              onSuccess={() => navigate(backPath)}
              onDone={() => navigate(backPath)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
