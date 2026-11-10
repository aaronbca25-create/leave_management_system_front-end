import React, { useState, useEffect } from 'react';
import EmployeeView from './components/EmployeeView';
import AdminView from './components/AdminView';

// Backend API URL - Node.js runs on port 5000
const API_URL = https://backend-lms-aamx.onrender.com/api';

export default function App() {
  // State 1: Active user role ('employee' or 'admin')
  const [activeRole, setActiveRole] = useState('employee');

  // State 2: Data fetched from backend
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [notification, setNotification] = useState('');

  // Show a temporary top toast notification
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // 1. Fetch data from backend on first load
  const loadData = async () => {
    try {
      setLoading(true);
      const [leavesRes, balancesRes] = await Promise.all([
        fetch(`${API_URL}/leaves`),
        fetch(`${API_URL}/balances`)
      ]);

      if (!leavesRes.ok || !balancesRes.ok) {
        throw new Error('Failed to fetch from backend');
      }

      const leavesData = await leavesRes.json();
      const balancesData = await balancesRes.json();

      setLeaves(leavesData);
      setBalances(balancesData);
      setBackendOnline(true);
    } catch (err) {
      console.warn('Backend appears offline:', err.message);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // Run loadData once when the app starts
  useEffect(() => {
    loadData();
  }, []);

  // 2. Submit new leave application
  const handleApplyLeave = async (newLeaveData) => {
    try {
      const response = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeaveData)
      });

      if (!response.ok) throw new Error('Submission failed');

      const result = await response.json();
      showNotification('✅ Leave application submitted successfully!');
      // Reload updated leaves and balances from backend
      await loadData();
      return true;
    } catch (error) {
      console.error(error);
      showNotification('❌ Could not connect to backend server on port 5000');
      return false;
    }
  };

  // 3. Admin updates leave status (Approved / Rejected)
  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Status update failed');

      showNotification(`Leave request marked as ${status}!`);
      // Reload updated leaves and balances
      await loadData();
    } catch (error) {
      console.error(error);
      showNotification('❌ Failed to update status on server');
    }
  };

  // 4. Delete a leave record
  const handleDeleteLeave = async (id) => {
    if (!window.confirm('Are you sure you want to remove this leave record?')) return;

    try {
      const response = await fetch(`${API_URL}/leaves/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Delete failed');

      showNotification('Leave request deleted.');
      await loadData();
    } catch (error) {
      console.error(error);
      showNotification('❌ Failed to delete record');
    }
  };

  return (
    <div className="app-container">
      {/* Top Notification Toast */}
      {notification && <div className="toast-notification">{notification}</div>}

      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-logo">🗓️</div>
          <div>
            <h1 className="brand-title">LeaveFlow</h1>
            <span className="brand-subtitle">Smart Leave Management Portal</span>
          </div>
        </div>

        {/* Backend Connection Indicator & Role Switcher */}
        <div className="nav-controls">
          <div className={`status-badge ${backendOnline ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            {backendOnline ? 'Backend Online (Port 5000)' : 'Backend Disconnected'}
          </div>

          <div className="role-switcher">
            <button
              className={`role-btn ${activeRole === 'employee' ? 'active' : ''}`}
              onClick={() => setActiveRole('employee')}
            >
              👤 Employee View
            </button>
            <button
              className={`role-btn ${activeRole === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveRole('admin')}
            >
              🛡️ Admin / Manager View
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {!backendOnline && (
          <div className="backend-offline-banner">
            <div className="banner-icon">⚠️</div>
            <div>
              <strong>Node.js Backend is not running yet</strong>
              <p>Run <code>node server.js</code> inside the <code>backend</code> directory to connect live data storage.</p>
            </div>
          </div>
        )}

        {loading && backendOnline ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading application data...</p>
          </div>
        ) : activeRole === 'employee' ? (
          <EmployeeView
            balances={balances}
            leaves={leaves}
            onApplyLeave={handleApplyLeave}
            onDeleteLeave={handleDeleteLeave}
          />
        ) : (
          <AdminView
            leaves={leaves}
            onUpdateStatus={handleUpdateStatus}
            onDeleteLeave={handleDeleteLeave}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>LeaveFlow Portal • Built with React & Node.js Express</p>
      </footer>
    </div>
  );
}
