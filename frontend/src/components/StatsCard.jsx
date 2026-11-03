import React from 'react';

// Reusable Stats Card Component - Demonstrates React Props!
export default function StatsCard({ title, value, subtext, icon, color = 'blue' }) {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-header">
        <span className="stats-title">{title}</span>
        <span className="stats-icon">{icon}</span>
      </div>
      <div className="stats-value">{value}</div>
      {subtext && <div className="stats-subtext">{subtext}</div>}
    </div>
  );
}
