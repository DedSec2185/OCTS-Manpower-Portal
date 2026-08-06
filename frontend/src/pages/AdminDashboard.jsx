import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { EmployeeTable } from '../components/employee/EmployeeTable';
import { EmployeeSearch } from '../components/employee/EmployeeSearch';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { adminApi } from '../api/adminApi';
import { employeeApi } from '../api/employeeApi';
import { downloadFile } from '../utils/validators';
import { Users, Ship, UserCheck, LogOut, XCircle, Plus, Search, List } from 'lucide-react';
import '../styles/dashboard.css';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [quickSearch, setQuickSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    loadEmployees();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminApi.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load stats');
    }
  };

  const loadEmployees = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await employeeApi.getAllEmployees({ page: pageNum, limit: 50 });
      if (pageNum === 1) {
        setEmployees(response.data.items);
      } else {
        setEmployees(prev => [...prev, ...response.data.items]);
      }
      setHasMore(response.data.page < response.data.pages);
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadEmployees(page + 1);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await adminApi.exportExcel();
      downloadFile(response.data, 'OCTS_MANPOWER_export.xlsx');
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await employeeApi.deleteEmployee(deleteConfirm);
      toast.success('Employee deleted successfully');
      loadEmployees(1);
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  // Compute designation breakdown from employee data
  const designationBreakdown = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    const counts = {};
    employees.forEach(emp => {
      const d = emp.designation || 'Unassigned';
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [employees]);

  const maxDesignation = designationBreakdown.length > 0
    ? Math.max(...designationBreakdown.map(d => d.count))
    : 1;

  // Quick search filter
  const filteredEmployees = useMemo(() => {
    if (!quickSearch.trim()) return employees;
    const q = quickSearch.toLowerCase();
    return employees.filter(emp =>
      (emp.name && emp.name.toLowerCase().includes(q)) ||
      (emp.designation && emp.designation.toLowerCase().includes(q)) ||
      (emp.passport_number && emp.passport_number.toLowerCase().includes(q))
    );
  }, [employees, quickSearch]);

  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar />
      <main className="main-content">

        {/* Page Header */}
        <div className="dashboard-page-header">
          <div className="header-left">
            <h1>Operations Dashboard</h1>
            <p>Real-time view of OCTS offshore manpower & deployments.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-accent" onClick={() => navigate('/admin/add-employee')}>
              <Plus size={16} /> Add Employee
            </button>
            <button className="btn btn-primary" onClick={handleExportExcel}>
              📥 Export Excel
            </button>
          </div>
        </div>

        {/* ===================== Stats Row ===================== */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Employees</span>
              <span className="stat-value">{stats?.total_employees ?? 0}</span>
            </div>
            <div className="stat-icon blue"><Users size={20} /></div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Active Deployments</span>
              <span className="stat-value">{stats?.active_deployments ?? 0}</span>
              <span className="stat-subtitle">Currently signed on</span>
            </div>
            <div className="stat-icon green"><Ship size={20} /></div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Available Workers</span>
              <span className="stat-value">{stats?.available_workers ?? 0}</span>
              <span className="stat-subtitle">Ready to deploy</span>
            </div>
            <div className="stat-icon blue"><UserCheck size={20} /></div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Signed Off</span>
              <span className="stat-value">{stats?.expiring_pcc_count ?? 0}</span>
            </div>
            <div className="stat-icon orange"><LogOut size={20} /></div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Cancelled</span>
              <span className="stat-value">{stats?.expiring_bosiet_count ?? 0}</span>
            </div>
            <div className="stat-icon red"><XCircle size={20} /></div>
          </div>
        </div>

        {/* ===================== Middle Section ===================== */}
        <div className="dashboard-middle">
          {/* Designations Breakdown */}
          <div className="designations-panel">
            <h3>Designations Breakdown</h3>
            {designationBreakdown.length === 0 ? (
              <p className="empty-state">No data yet. Add employees to see breakdown.</p>
            ) : (
              <div className="designation-bar-list">
                {designationBreakdown.map(d => (
                  <div className="designation-bar-item" key={d.name}>
                    <span className="bar-label" title={d.name}>{d.name}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(d.count / maxDesignation) * 100}%` }}
                      />
                    </div>
                    <span className="bar-count">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-panel">
            <h3>Quick Actions</h3>
            <div className="quick-action-list">
              <button className="quick-action-item" onClick={() => navigate('/admin/add-employee')}>
                <span>Register Employee</span>
                <Plus size={16} className="action-icon" />
              </button>
              <button className="quick-action-item" onClick={() => setActiveTab('search')}>
                <span>Search Employees</span>
                <Search size={16} className="action-icon" />
              </button>
              <button className="quick-action-item" onClick={() => navigate('/admin/employees')}>
                <span>Full Records View</span>
                <List size={16} className="action-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* ===================== Employee Master Section ===================== */}
        <div className="employee-master-section">
          <div className="employee-master-header">
            <div className="section-title">
              <h3>Employee Master</h3>
              <p>{employees.length} total records</p>
            </div>

            <div className="dashboard-tabs">
              <button
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                All Employees
              </button>
              <button
                className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveTab('search')}
              >
                Search
              </button>
              {activeTab === 'overview' && (
                <input
                  type="text"
                  className="quick-search-input"
                  placeholder="Quick search..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                />
              )}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="dashboard-section">
              <EmployeeTable
                employees={filteredEmployees}
                onView={(id) => window.location.href = `/employee/${id}`}
                onEdit={(id) => window.location.href = `/admin/edit/${id}`}
                onDelete={(id) => setDeleteConfirm(id)}
              />
              {loading && <LoadingSpinner />}
              {!loading && hasMore && !quickSearch.trim() && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" onClick={handleLoadMore}>
                    Load More Employees
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="dashboard-section">
              <EmployeeSearch />
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        danger
      />
    </div>
  );
}
