import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { adminApi } from '../api/adminApi';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    phone_number: '',
    role: 'user'
  });

  const [editData, setEditData] = useState({
    role: 'user',
    is_active: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response.data.items || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createUser(formData);
      toast.success('User created successfully!');
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        phone_number: '',
        role: 'user'
      });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateUser(selectedUser.id, editData);
      toast.success('User updated successfully!');
      setIsEditOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditData({
      role: user.role,
      is_active: user.is_active
    });
    setIsEditOpen(true);
  };

  const toggleUserStatus = async (user) => {
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      toast.success(`User is now ${!user.is_active ? 'Active' : 'Inactive'}`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to toggle user status');
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className="dashboard-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="header-left">
            <h1>User Management</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            ➕ Add New User
          </button>
        </div>

        <div className="dashboard-section">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id || index}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td className="cell-mono">{user.username}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 'bold' }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}
                          style={{
                            backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
                            color: user.is_active ? '#166534' : '#991b1b',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => toggleUserStatus(user)}
                          title="Click to toggle status"
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleString()}</td>
                      <td>
                        <button className="btn-icon" onClick={() => handleEditClick(user)} title="Edit Role/Status">✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="details-card futuristic-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', margin: '1.5rem', padding: '2rem', zIndex: 210 }}>
            <div className="details-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Add New User Account</h3>
              <button className="btn-icon" onClick={() => setIsAddOpen(false)} style={{ fontSize: '1.5rem', width: '32px', height: '32px' }}>&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark-grey)' }}>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. John Doe" />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark-grey)' }}>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="e.g. john@octs.com" />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark-grey)' }}>Username *</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required placeholder="Choose login username" />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark-grey)' }}>Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="Min 8 characters" />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark-grey)' }}>Phone Number</label>
                <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="e.g. 7304704503" />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark-grey)' }}>Access Role *</label>
                <select name="role" value={formData.role} onChange={handleInputChange} required style={{ backgroundColor: '#f8fafc' }}>
                  <option value="user">Viewer (Read Only)</option>
                  <option value="clerk">Clerk (Data Entry / Register)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>
              <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditOpen && selectedUser && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="details-card futuristic-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', margin: '1.5rem', padding: '2rem', zIndex: 210 }}>
            <div className="details-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Modify User: {selectedUser.name}</h3>
              <button className="btn-icon" onClick={() => { setIsEditOpen(false); setSelectedUser(null); }} style={{ fontSize: '1.5rem', width: '32px', height: '32px' }}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-dark-grey)' }}>Access Role</label>
                <select name="role" value={editData.role} onChange={handleEditChange} required style={{ backgroundColor: '#f8fafc' }}>
                  <option value="user">Viewer (Read Only)</option>
                  <option value="clerk">Clerk (Data Entry / Register)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={editData.is_active}
                  onChange={handleEditChange}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="is_active" style={{ cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)' }}>Active User Account</label>
              </div>
              <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setIsEditOpen(false); setSelectedUser(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
