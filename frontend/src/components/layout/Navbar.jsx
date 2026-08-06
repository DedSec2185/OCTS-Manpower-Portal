import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import { Bell, User, LogOut, Clock, Menu } from 'lucide-react';
import '../../../src/styles/layout.css';

export function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await adminApi.getAuditLogs({ limit: 5 });
      if (response.data && response.data.items) {
        setNotifications(response.data.items);
      }
    } catch (error) {
      console.error("Failed to load notifications");
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('admin')) return 'Admin Dashboard';
    if (path.includes('clerk')) return 'Clerk Dashboard';
    if (path.includes('user')) return 'Employee Search';
    return 'OCTS';
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={() => window.dispatchEvent(new Event('toggleMobileSidebar'))}
        >
          <Menu size={24} />
        </button>
        <h2>{getPageTitle()}</h2>
      </div>

      <div className="navbar-right">
        <div className="notification-wrapper" ref={dropdownRef}>
          <button 
            className={`navbar-btn ${showNotifications ? 'active' : ''}`} 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Recent Activity</h3>
                <button onClick={fetchNotifications} className="refresh-btn">↻</button>
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <p className="no-notifications">No recent activity</p>
                ) : (
                  notifications.map(log => (
                    <div key={log.id} className="notification-item">
                      <div className="notification-icon">
                        <Clock size={14} />
                      </div>
                      <div className="notification-content">
                        <p className="notification-text">
                          <strong>{log.user_name}</strong> {log.action.toLowerCase().replace('_', ' ')} on {log.table_name} {log.record_id ? `#${log.record_id}` : ''}
                        </p>
                        <span className="notification-time">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-avatar-sm">{user?.name?.charAt(0) || 'U'}</div>
          <span>{user?.name}</span>
        </div>

        <button className="navbar-btn" onClick={logout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
