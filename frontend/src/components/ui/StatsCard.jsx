import React from 'react';
import '../../../src/styles/components.css';

export function StatsCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="stats-card" style={{ borderLeftColor: color }}>
      <div className="stats-card-header">
        <span className="stats-icon">{icon}</span>
        <h4>{title}</h4>
      </div>
      <div className="stats-card-value" style={{ color }}>
        {value}
      </div>
      {subtitle && <p className="stats-card-subtitle">{subtitle}</p>}
    </div>
  );
}
