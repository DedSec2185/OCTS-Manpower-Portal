import React from 'react';
import '../../../src/styles/components.css';

export function Badge({ children, variant = 'primary' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
