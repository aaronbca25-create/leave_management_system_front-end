import React, { useState } from 'react';
import StatsCard from './StatsCard';

export default function AdminView({ leaves, onUpdateStatus, onDeleteLeave }) {
  const [filter, setFilter] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  // Compute metrics dynamically from leaves list
  const totalCount = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  // Filter leaves based on active tab
  const filteredLeaves = leaves.filter((l) => {
    if (filter === 'All') return true;
    return l.status === filter;
  });

  const handleStatusChange = async (id, newStatus) => {
    setProcessingId(id);
    await onUpdateStatus(id, newStatus);
    setProcessingId(null);
  };

  return (
    <div className="view-container">
      {/* 1. Admin Analytics Summary Cards */}
      <section className="section-block">
        <h2 className="section-title">Manager Overview & Approval Pipeline</h2>
        <div className="stats-grid">
          <StatsCard
            title="Total Applications"
            value={totalCount}
            subtext="All employee submissions"
            icon="📋"
            color="blue"
          />
          <StatsCard
            title="Pending Review"
            value={pendingCount}
            subtext="Requires your action"
            icon="⏳"
            color="orange"
          />
          <StatsCard
            title="Approved Leaves"
            value={approvedCount}
            subtext="Granted time-off"
            icon="✅"
            color="green"
          />
          <StatsCard
            title="Rejected Leaves"
            value={rejectedCount}
            subtext="Declined requests"
            icon="❌"
            color="purple"
          />
        </div>
      </section>

      {/* 2. Management Table Card */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3>Leave Applications Queue</h3>
            <p className="card-subtitle">Review incoming leave requests from team members</p>
          </div>

          {/* Filter Pills */}
          <div className="filter-group">
            {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
              <button
                key={tab}
                className={`filter-btn ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab} {tab === 'Pending' && pendingCount > 0 && `(${pendingCount})`}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Type & Duration</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center empty-state">
                    No requests found in this view.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <div className="user-avatar-group">
                        <div className="avatar-circle">
                          {leave.employeeName ? leave.employeeName[0] : 'U'}
                        </div>
                        <div>
                          <div className="font-bold">{leave.employeeName}</div>
                          <span className="sub-text">{leave.department}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><strong>{leave.leaveType}</strong></div>
                      <span className="badge badge-neutral">{leave.daysCount} day(s)</span>
                    </td>
                    <td>
                      <div className="date-badge">{leave.startDate}</div>
                      <div className="date-sub">to {leave.endDate}</div>
                    </td>
                    <td>
                      <div className="reason-box">{leave.reason}</div>
                    </td>
                    <td>
                      <span className={`status-pill status-${leave.status.toLowerCase()}`}>
                        {leave.status === 'Approved' && '✓ Approved'}
                        {leave.status === 'Pending' && '⏳ Pending'}
                        {leave.status === 'Rejected' && '✕ Rejected'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        {leave.status === 'Pending' ? (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              disabled={processingId === leave.id}
                              onClick={() => handleStatusChange(leave.id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              disabled={processingId === leave.id}
                              onClick={() => handleStatusChange(leave.id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <div className="actions-subtext">
                            <span>Status set to {leave.status}</span>
                            <button
                              className="btn-link-danger ml-2"
                              onClick={() => onDeleteLeave(leave.id)}
                              title="Delete Record"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
