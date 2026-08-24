import React, { useState } from 'react';
import { ElectionApplication, ElectionPosition } from '@/lib/api';
import { useUpdateApplicationStatus } from '@/app/hooks/useUpdateApplicationStatus';

interface ApplicationsManagementProps {
  applications: ElectionApplication[];
  positions: ElectionPosition[];
  electionId: string;
  loading: boolean;
  onRefresh: () => void;
}

export function ApplicationsManagement({
  applications,
  positions,
  electionId,
  loading,
  onRefresh,
}: ApplicationsManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string>('');
  const { update: updateStatus } = useUpdateApplicationStatus();

  const filtered = applications.filter((app) => {
    if (selectedStatus && app.status !== selectedStatus) return false;
    if (selectedPosition && app.positionId !== selectedPosition) return false;
    return true;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      setUpdatingId(applicationId);
      await updateStatus(
        applicationId,
        newStatus as 'pending' | 'approved' | 'rejected' | 'withdrawn'
      );
      onRefresh();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="applications-management">
      <div className="section-heading">
        <h2>Election Applications</h2>
        <p>Manage and review candidate applications in real-time</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="filters-bar">
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="filter-select"
        >
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {pos.title}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        <button onClick={onRefresh} className="refresh-btn" disabled={loading}>
          Refresh
        </button>
      </div>

      <div className="applications-list">
        {loading ? (
          <div className="loading-message">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-message">No applications found</div>
        ) : (
          <table className="applications-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>County</th>
                <th>Email</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className={`status-${app.status}`}>
                  <td className="name-cell">{app.name}</td>
                  <td className="position-cell">
                    {positions.find((p) => p.id === app.positionId)?.title || 'Unknown'}
                  </td>
                  <td>{app.county}</td>
                  <td>{app.email}</td>
                  <td>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      disabled={updatingId === app.id}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="withdrawn">Withdraw</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
