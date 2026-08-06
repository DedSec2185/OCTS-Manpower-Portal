import React from 'react';
import { X } from 'lucide-react';
import '../../../src/styles/components.css';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, danger }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>
          <X size={20} />
        </button>

        <h3>{title}</h3>
        <p>{message}</p>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
