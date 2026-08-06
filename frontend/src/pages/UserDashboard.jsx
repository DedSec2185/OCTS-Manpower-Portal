import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { EmployeeSearch } from '../components/employee/EmployeeSearch';
import { employeeApi } from '../api/employeeApi';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDate } from '../utils/validators';
import '../styles/dashboard.css';

export function UserDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentEmployees();
  }, []);

  const loadRecentEmployees = async () => {
    try {
      setLoading(true);
      // Fetch employee list
      const response = await employeeApi.getAllEmployees({ page: 1, limit: 10 });
      setEmployees(response.data.items || []);
    } catch (error) {
      console.error('Failed to load recent employees', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className="dashboard-page-header">
          <div className="header-left">
            <h1>Viewer Dashboard</h1>
            <p>Welcome back, {user?.name || 'Viewer'}</p>
          </div>
        </div>

        {/* Welcome Card Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0b1a30 0%, #152d4e 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(11, 26, 48, 0.15)',
          borderLeft: '5px solid #f97316'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>Welcome to OCTS Portal!</h2>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.85, fontSize: '0.95rem' }}>
            Authorized role: <strong>Viewer</strong>. You can search for employee details, view status updates, and track records.
          </p>
        </div>

        {/* Employee Search Section */}
        <div className="details-card futuristic-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div className="details-card-header" style={{ marginBottom: '1.5rem' }}>
            <span className="details-card-icon">🔍</span>
            <h3>Search Manpower Directory</h3>
          </div>
          <EmployeeSearch />
        </div>

        {/* Recent Employees List */}
        <div className="details-card futuristic-card" style={{ padding: '2rem' }}>
          <div className="details-card-header" style={{ marginBottom: '1.5rem' }}>
            <span className="details-card-icon">📋</span>
            <h3>Directory Snapshot (First 10 Records)</h3>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : employees.length === 0 ? (
            <p style={{ color: 'var(--color-dark-grey)', textAlign: 'center', padding: '1rem' }}>No employee records found.</p>
          ) : (
            <div className="table-container">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Sr.No</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Passport</th>
                    <th>BOSIET</th>
                    <th>Sign On</th>
                    <th>Status</th>
                    <th>Action</th>
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
                      <td>{formatDate(emp.sign_on_date)}</td>
                      <td>
                        <span className="badge" style={{ 
                          backgroundColor: emp.current_status === 'available' ? '#dcfce7' : emp.current_status === 'active' ? '#dbeafe' : '#fee2e2', 
                          color: emp.current_status === 'available' ? '#15803d' : emp.current_status === 'active' ? '#1d4ed8' : '#b91c1c'
                        }}>
                          {emp.current_status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" onClick={() => navigate(`/employee/${emp.id}`)} title="View Info">👁️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
