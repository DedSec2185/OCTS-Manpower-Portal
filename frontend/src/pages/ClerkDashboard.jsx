import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { employeeApi } from '../api/employeeApi';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDate } from '../utils/validators';
import '../styles/dashboard.css';

export function ClerkDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    active: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getAllEmployees({ page: 1, limit: 100 });
      const items = response.data.items || [];
      const total = items.length;
      const available = items.filter(i => i.current_status === 'available').length;
      const active = items.filter(i => i.current_status === 'active').length;
      setStats({ total, available, active });
    } catch (error) {
      console.error(error);
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
            <h1>Clerk Dashboard</h1>
            <p>Operations & Data Entry Panel</p>
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
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>Welcome Back, {user?.name}!</h2>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.85, fontSize: '0.95rem' }}>
            Authorized role: <strong>Data Entry Clerk</strong>. You can register new employees, manage documents, and search records.
          </p>
        </div>

        {/* Stats Cards Section */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="stats-card card-total" style={{ borderLeftColor: '#f97316' }}>
              <div className="stats-card-header">
                <span className="stats-icon">👥</span>
                <h4>Total Employees</h4>
              </div>
              <p className="stats-card-value">{stats.total}</p>
            </div>
            <div className="stats-card card-active" style={{ borderLeftColor: '#10b981' }}>
              <div className="stats-card-header">
                <span className="stats-icon">🟢</span>
                <h4>Available / Standby</h4>
              </div>
              <p className="stats-card-value">{stats.available}</p>
            </div>
            <div className="stats-card card-standby" style={{ borderLeftColor: '#3b82f6' }}>
              <div className="stats-card-header">
                <span className="stats-icon">🚢</span>
                <h4>Active Deployment</h4>
              </div>
              <p className="stats-card-value">{stats.active}</p>
            </div>
          </div>
        )}

        {/* Clerk Action Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem'
        }}>
          {/* Card 1: Register */}
          <div 
            onClick={() => navigate('/clerk/add-employee')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
              e.currentTarget.style.borderColor = '#f97316';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div>
              <span style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block' }}>➕</span>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0b1a30', fontSize: '1.25rem', fontWeight: 700 }}>Register Employee</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Fill out the comprehensive employee profile form, including identity documents, certificates, safety validation dates, and passport info.
              </p>
            </div>
            <span style={{
              color: '#f97316',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginTop: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              Launch Registration Form &rarr;
            </span>
          </div>

          {/* Card 2: Search */}
          <div 
            onClick={() => navigate('/clerk/search')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
              e.currentTarget.style.borderColor = '#f97316';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div>
              <span style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block' }}>🔍</span>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0b1a30', fontSize: '1.25rem', fontWeight: 700 }}>Search Records</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Look up active, available, signed-off or cancelled employees by name, passport, designation, Indos, or other fields.
              </p>
            </div>
            <span style={{
              color: '#f97316',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginTop: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              Open Search Interface &rarr;
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
