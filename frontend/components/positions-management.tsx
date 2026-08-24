import React, { useState } from 'react';
import { ElectionPosition } from '@/lib/api';

interface PositionsManagementProps {
  positions: ElectionPosition[];
  electionId: string;
  loading: boolean;
  onTogglePosition: (positionId: string, open: boolean) => Promise<void>;
  onRefresh: () => void;
}

export function PositionsManagement({
  positions,
  electionId,
  loading,
  onTogglePosition,
  onRefresh,
}: PositionsManagementProps) {
  const [togglingId, setTogglingId] = useState<string>('');

  const handleTogglePosition = async (positionId: string, isOpen: boolean) => {
    try {
      setTogglingId(positionId);
      await onTogglePosition(positionId, !isOpen);
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle position:', err);
    } finally {
      setTogglingId('');
    }
  };

  return (
    <div className="positions-management">
      <div className="section-heading">
        <h2>Election Positions</h2>
        <p>Manage open/closed positions for this election</p>
      </div>

      <div className="positions-grid">
        {loading ? (
          <div className="loading-message">Loading positions...</div>
        ) : positions.length === 0 ? (
          <div className="empty-message">No positions created yet</div>
        ) : (
          positions.map((position) => (
            <div key={position.id} className={`position-card ${position.isOpen ? 'open' : 'closed'}`}>
              <div className="position-header">
                <h3>{position.title}</h3>
                <span className={`status-badge ${position.isOpen ? 'open' : 'closed'}`}>
                  {position.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              {position.description && (
                <p className="position-description">{position.description}</p>
              )}

              <div className="position-details">
                <div className="detail-row">
                  <span className="label">Max Applicants:</span>
                  <span className="value">{position.maxApplicants}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">
                    {new Date(position.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                className={`toggle-btn ${position.isOpen ? 'close-btn' : 'open-btn'}`}
                onClick={() => handleTogglePosition(position.id, position.isOpen)}
                disabled={togglingId === position.id}
              >
                {togglingId === position.id ? (
                  'Updating...'
                ) : position.isOpen ? (
                  'Close Applications'
                ) : (
                  'Open Applications'
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
