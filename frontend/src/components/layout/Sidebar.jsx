import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Menu, X, LogOut, User } from 'lucide-react';
import '../../../src/styles/layout.css';

export function Sidebar() {
  const { user, logout, isAdmin, isClerk, isUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleMobileSidebar', handleToggle);
    return () => window.removeEventListener('toggleMobileSidebar', handleToggle);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/employees', label: 'Employee Records', icon: '👥' },
    { path: '/admin/add-employee', label: 'Add Employee', icon: '➕' },
    { path: '/admin/search', label: 'Search', icon: '🔍' },
    { path: '/admin/audit', label: 'Audit Logs', icon: '📋' },
    { path: '/admin/users', label: 'User Management', icon: '⚙️' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  const clerkLinks = [
    { path: '/clerk', label: 'Dashboard', icon: '📊' },
    { path: '/clerk/add-employee', label: 'Add Employee', icon: '➕' },
    { path: '/clerk/search', label: 'Search Employee', icon: '🔍' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  const userLinks = [
    { path: '/user', label: 'Dashboard', icon: '📊' },
    { path: '/user/search', label: 'Search Employee', icon: '🔍' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  let links = [];
  if (isAdmin) links = adminLinks;
  else if (isClerk) links = clerkLinks;
  else if (isUser) links = userLinks;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-circle">
              <img src="/octs-logo.png" alt="OCTS Logo" className="sidebar-logo-img" />
            </div>
            <div>
              <h3>OCTS</h3>
              <p>Employee Management</p>
              <span className="sidebar-est">Est. 2020</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {links.map((link) => (
            <a
              key={link.path}
              onClick={(e) => { e.preventDefault(); navigate(link.path); setIsOpen(false); }}
              href={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
