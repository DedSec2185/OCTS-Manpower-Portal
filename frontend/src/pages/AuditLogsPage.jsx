import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { adminApi } from '../api/adminApi';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

const getActionBadge = (action) => {
  let color = '#5f6368';
  let bg = '#e8eaed';
  
  if (action === 'CREATE') {
    color = '#166534';
    bg = '#dcfce7';
  } else if (action === 'UPDATE') {
    color = '#9a3412';
    bg = '#ffedd5';
  } else if (action === 'DELETE') {
    color = '#991b1b';
    bg = '#fee2e2';
  } else if (action?.includes('FILE_')) {
    color = '#0369a1';
    bg = '#e0f2fe';
  } else if (action === 'EXPORT') {
    color = '#6b21a8';
    bg = '#f3e8ff';
  }
  
  return (
    <span style={{
      backgroundColor: bg,
      color: color,
      padding: '0.25rem 0.6rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {action}
    </span>
  );
};

const getLogTarget = (log) => {
  const name = log.new_value?.full_name || log.old_value?.full_name || '';
  const designation = log.new_value?.designation || log.old_value?.designation || '';
  
  if (log.table_name === 'employees') {
    if (name) {
      return `Employee: ${name} ${designation ? `(${designation})` : ''}`;
    }
    return `Employee ID: ${log.record_id || 'N/A'}`;
  }
  return `${log.table_name} (ID: ${log.record_id || 'N/A'})`;
};

const getLogDetails = (log) => {
  if (log.action === 'CREATE') {
    return `Created new employee profile: ${log.new_value?.full_name || 'N/A'}`;
  }
  if (log.action === 'DELETE') {
    return `Deleted employee profile: ${log.old_value?.full_name || 'N/A'}`;
  }
  if (log.action === 'UPDATE') {
    const oldVal = log.old_value || {};
    const newVal = log.new_value || {};
    const changes = [];
    
    Object.keys(newVal).forEach(key => {
      if (['updated_at', 'updated_by_id', 'created_at', 'created_by_id', 'id', 'sr_no'].includes(key)) return;
      
      const oldValStr = oldVal[key] !== undefined && oldVal[key] !== null ? String(oldVal[key]) : '';
      const newValStr = newVal[key] !== undefined && newVal[key] !== null ? String(newVal[key]) : '';
      
      if (oldValStr !== newValStr) {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        changes.push(`${label}: "${oldValStr || 'None'}" → "${newValStr || 'None'}"`);
      }
    });
    
    if (changes.length > 0) {
      return changes.join(', ');
    }
    return 'Updated profile details.';
  }
  if (log.action === 'FILE_UPLOAD') {
    return `Uploaded document: ${log.new_value?.doc_type || 'N/A'}`;
  }
  if (log.action === 'FILE_DOWNLOAD') {
    return `Downloaded document: ${log.new_value?.doc_type || 'N/A'}`;
  }
  if (log.action === 'EXPORT') {
    return `Exported ${log.new_value?.exported_count || 0} employees to Excel`;
  }
  return JSON.stringify(log.new_value || log.old_value || {});
};

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAuditLogs();
      setLogs(response.data.items || []);
    } catch (error) {
      toast.error('Failed to load audit logs');
      setLogs([]);
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
            <h1>Audit Logs</h1>
          </div>
        </div>

        <div className="dashboard-section">
          {loading ? (
            <LoadingSpinner />
          ) : logs.length === 0 ? (
            <p className="empty-state">No audit logs found.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id || index}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{log.user_name}</td>
                      <td>{getActionBadge(log.action)}</td>
                      <td style={{ color: '#0b1a30', fontWeight: 500 }}>{getLogTarget(log)}</td>
                      <td style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '400px', wordBreak: 'break-word' }}>
                        {getLogDetails(log)}
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

