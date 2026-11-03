import React, { useState } from 'react';
import StatsCard from './StatsCard';

export default function EmployeeView({ balances, leaves, onApplyLeave, onDeleteLeave }) {
  // React State: stores what the user types into the form
  const [formData, setFormData] = useState({
    employeeName: 'Alex Rivera',
    department: 'Design',
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Handle inputs dynamically as user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    // Validation
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setFormError('Please fill in all the required fields.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    setIsSubmitting(true);
    const success = await onApplyLeave(formData);
    setIsSubmitting(false);

    if (success) {
      setFormSuccess('🎉 Your leave application has been submitted to the manager!');
      // Reset form dates and reason
      setFormData((prev) => ({
        ...prev,
        startDate: '',
        endDate: '',
        reason: ''
      }));
    } else {
      setFormError('Failed to submit application. Please check backend server.');
    }
  };

  return (
    <div className="view-container">
      {/* 1. Leave Balance Summary Cards */}
      <section className="section-block">
        <h2 className="section-title">Your Leave Balances (Yearly)</h2>
        <div className="stats-grid">
          {balances && Object.keys(balances).map((key) => {
            const b = balances[key];
            const remaining = b.total - b.used;
            return (
              <StatsCard
                key={key}
                title={b.title}
                value={`${remaining} Days Left`}
                subtext={`Used: ${b.used} of ${b.total} days`}
                icon={key === 'sick' ? '🩺' : key === 'casual' ? '🌴' : '✈️'}
                color={key === 'sick' ? 'orange' : key === 'casual' ? 'blue' : 'purple'}
              />
            );
          })}
        </div>
      </section>

      {/* 2. Main Two-Column Layout: Application Form & History */}
      <div className="layout-grid">
        {/* Application Form */}
        <div className="card form-card">
          <div className="card-header">
            <h3>Apply for Leave</h3>
            <p className="card-subtitle">Fill out the details below for manager approval.</p>
          </div>

          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
          {formError && <div className="alert alert-danger">{formError}</div>}

          <form onSubmit={handleSubmit} className="leave-form">
            <div className="form-group">
              <label>Applicant Name</label>
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                placeholder="e.g. Alex Rivera"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select name="department" value={formData.department} onChange={handleChange}>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div className="form-group">
                <label>Leave Type</label>
                <select name="leaveType" value={formData.leaveType} onChange={handleChange}>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Leave</label>
              <textarea
                name="reason"
                rows="3"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Explain the purpose of your leave..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting to Backend...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>

        {/* Leave History List */}
        <div className="card history-card">
          <div className="card-header">
            <h3>Recent Leave Requests</h3>
            <p className="card-subtitle">Track the status of your applications</p>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type & Reason</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center empty-state">
                      No leave requests found. Submit your first one!
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <strong>{leave.leaveType}</strong>
                        <div className="sub-text">{leave.reason}</div>
                      </td>
                      <td>
                        {leave.startDate} <span className="arrow">→</span> {leave.endDate}
                      </td>
                      <td>
                        <span className="badge badge-neutral">{leave.daysCount} day(s)</span>
                      </td>
                      <td>
                        <span className={`status-pill status-${leave.status.toLowerCase()}`}>
                          {leave.status === 'Approved' && '✓ Approved'}
                          {leave.status === 'Pending' && '⏳ Pending'}
                          {leave.status === 'Rejected' && '✕ Rejected'}
                        </span>
                      </td>
                      <td>
                        {leave.status === 'Pending' && (
                          <button
                            className="btn-link-danger"
                            onClick={() => onDeleteLeave(leave.id)}
                            title="Cancel Request"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
