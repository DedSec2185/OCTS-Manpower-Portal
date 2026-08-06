import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

export function ProfilePage() {
  const { user, updateCurrentUser } = useContext(AuthContext);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile Form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      phone_number: user?.phone_number || ''
    }
  });

  // Password Form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  const onUpdateProfile = async (data) => {
    try {
      setProfileLoading(true);
      const response = await authApi.updateProfile(data);
      updateCurrentUser(response.data);
      toast.success('Profile details updated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      await authApi.changePassword(data.current_password, data.new_password);
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className="dashboard-page-header">
          <div className="header-left">
            <h1>My Profile</h1>
            <p>Manage your account settings, login credentials, and contact information.</p>
          </div>
        </div>

        <div className="dashboard-middle" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
          {/* Profile Details Card */}
          <div className="details-card" style={{ marginTop: 0 }}>
            <div className="details-card-header">
              <span className="details-card-icon">👤</span>
              <h3>Account Information</h3>
            </div>
            
            <form onSubmit={handleSubmitProfile(onUpdateProfile)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Display Name</label>
                <input
                  type="text"
                  {...registerProfile('name', { required: 'Name is required' })}
                  placeholder="Full name"
                />
                {profileErrors.name && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{profileErrors.name.message}</span>}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                <input
                  type="email"
                  {...registerProfile('email', { required: 'Email is required' })}
                  placeholder="name@example.com"
                />
                {profileErrors.email && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{profileErrors.email.message}</span>}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
                <input
                  type="text"
                  {...registerProfile('username', { required: 'Username is required' })}
                  placeholder="login_username"
                />
                {profileErrors.username && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{profileErrors.username.message}</span>}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
                <input
                  type="text"
                  {...registerProfile('phone_number')}
                  placeholder="e.g., +91 73047 04503"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={profileLoading}
                style={{
                  justifyContent: 'center',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  marginTop: '0.5rem'
                }}
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="details-card" style={{ marginTop: 0 }}>
            <div className="details-card-header">
              <span className="details-card-icon">🔒</span>
              <h3>Security & Password</h3>
            </div>
            
            <form onSubmit={handleSubmitPassword(onChangePassword)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Password</label>
                <input
                  type="password"
                  {...registerPassword('current_password', { required: 'Current password is required' })}
                  placeholder="••••••••"
                />
                {passwordErrors.current_password && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{passwordErrors.current_password.message}</span>}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Password</label>
                <input
                  type="password"
                  {...registerPassword('new_password', { 
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  placeholder="••••••••"
                />
                {passwordErrors.new_password && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{passwordErrors.new_password.message}</span>}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm New Password</label>
                <input
                  type="password"
                  {...registerPassword('confirm_password', { required: 'Please confirm your new password' })}
                  placeholder="••••••••"
                />
                {passwordErrors.confirm_password && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{passwordErrors.confirm_password.message}</span>}
              </div>

              <button 
                type="submit" 
                className="btn btn-accent" 
                disabled={passwordLoading}
                style={{
                  justifyContent: 'center',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  marginTop: '0.5rem',
                  backgroundColor: '#ea580c',
                  color: '#fff'
                }}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
