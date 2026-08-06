import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { EmployeeTable } from '../components/employee/EmployeeTable';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { employeeApi } from '../api/employeeApi';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

export function EmployeeRecordsPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

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

  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className="dashboard-page-header">
          <div className="header-left">
            <h1>Employee Records</h1>
          </div>
        </div>

        <div className="dashboard-section">
          <EmployeeTable
            employees={employees}
            onView={(id) => navigate(`/employee/${id}`)}
            onEdit={(id) => navigate(`/admin/edit/${id}`)}
            onDelete={(id) => setDeleteConfirm(id)}
          />
          {loading && <LoadingSpinner />}
          {!loading && hasMore && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={handleLoadMore}>
                Load More Employees
              </button>
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
