'use client';

import { useEffect, useState } from 'react';
import {
  useElectionDashboard,
  useElectionApplications,
  useApproveApplication,
  useRejectApplication,
  useOpenPositions,
  useClosePositions,
  useSystemActivity,
} from '@/lib/election-hooks';

interface AdminElectionsProps {
  electionId: string;
}

export default function AdminElectionsPanel({ electionId }: AdminElectionsProps) {
  const { stats, loading: statsLoading, refetch: refetchStats } = useElectionDashboard(electionId);
  const { applications, loading: appsLoading, refetch: refetchApps } = useElectionApplications(electionId);
  const { approve, loading: approveLoading } = useApproveApplication();
  const { reject, loading: rejectLoading } = useRejectApplication();
  const { openPositions } = useOpenPositions();
  const { closePositions } = useClosePositions();
  const { activity } = useSystemActivity();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [showPositionToggle, setShowPositionToggle] = useState(false);

  useEffect(() => {
    refetchStats();
    refetchApps();
  }, [electionId]);

  const handleApproveApplication = async (applicationId: string) => {
    try {
      await approve(electionId, applicationId);
      refetchApps();
      refetchStats();
    } catch (err) {
      console.error('Failed to approve application:', err);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await reject(electionId, applicationId);
      refetchApps();
      refetchStats();
    } catch (err) {
      console.error('Failed to reject application:', err);
    }
  };

  const handleOpenPositions = async () => {
    if (selectedPositions.length === 0) return;
    try {
      await openPositions(electionId, selectedPositions);
      setSelectedPositions([]);
      setShowPositionToggle(false);
      refetchStats();
      refetchApps();
    } catch (err) {
      console.error('Failed to open positions:', err);
    }
  };

  const handleClosePositions = async () => {
    if (selectedPositions.length === 0) return;
    try {
      await closePositions(electionId, selectedPositions);
      setSelectedPositions([]);
      setShowPositionToggle(false);
      refetchStats();
      refetchApps();
    } catch (err) {
      console.error('Failed to close positions:', err);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (positionFilter !== 'all' && app.positionId !== positionFilter) return false;
    if (countyFilter !== 'all' && app.county !== countyFilter) return false;
    return true;
  });

  if (statsLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading election data...</p>
      </div>
    );
  }

  return (
    <div className="admin-elections-panel">
      {/* Dashboard Statistics */}
      <div className="elections-stats-grid">
        <div className="stat-card">
          <div className="stat-header">Total Candidates</div>
          <div className="stat-value">{stats?.totalCandidates || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">Total Applications</div>
          <div className="stat-value">{stats?.totalApplications || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">Total Votes</div>
          <div className="stat-value">{stats?.totalVotes || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">Election Status</div>
          <div className="stat-value" style={{ fontSize: '14px' }}>
            {stats?.status?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Application Status Breakdown */}
      <div className="section-card">
        <h3>Application Status Summary</h3>
        <div className="status-breakdown">
          <div className="status-item">
            <span className="status-label">Pending</span>
            <span className="status-count">{stats?.applicationsByStatus?.pending || 0}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Approved</span>
            <span className="status-count">{stats?.applicationsByStatus?.approved || 0}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Rejected</span>
            <span className="status-count">{stats?.applicationsByStatus?.rejected || 0}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Withdrawn</span>
            <span className="status-count">{stats?.applicationsByStatus?.withdrawn || 0}</span>
          </div>
        </div>
      </div>

      {/* Positions Management */}
      <div className="section-card">
        <div className="section-header">
          <h3>Available Positions</h3>
          <button
            className="toggle-btn"
            onClick={() => setShowPositionToggle(!showPositionToggle)}
          >
            {showPositionToggle ? 'Done' : 'Manage'}
          </button>
        </div>

        <div className="positions-list">
          {stats?.positions?.map((position: any) => (
            <div key={position.id} className="position-item">
              {showPositionToggle && (
                <input
                  type="checkbox"
                  checked={selectedPositions.includes(position.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPositions([...selectedPositions, position.id]);
                    } else {
                      setSelectedPositions(selectedPositions.filter((id) => id !== position.id));
                    }
                  }}
                />
              )}
              <div className="position-info">
                <div className="position-title">{position.title}</div>
                <div className="position-meta">
                  {position.applicationCount} applications
                  {!position.isOpen && <span className="closed-badge">Closed</span>}
                  {position.isOpen && <span className="open-badge">Open</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showPositionToggle && selectedPositions.length > 0 && (
          <div className="position-actions">
            <button
              className="action-btn-open"
              onClick={handleOpenPositions}
              disabled={approveLoading}
            >
              Open Selected
            </button>
            <button
              className="action-btn-close"
              onClick={handleClosePositions}
              disabled={rejectLoading}
            >
              Close Selected
            </button>
          </div>
        )}
      </div>

      {/* Applications Management */}
      <div className="section-card">
        <div className="section-header">
          <h3>Applications</h3>
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Positions</option>
              {stats?.positions?.map((pos: any) => (
                <option key={pos.id} value={pos.id}>
                  {pos.title}
                </option>
              ))}
            </select>

            <select
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Counties</option>
              <option value="TAITA TAVETA">Taita Taveta</option>
              <option value="KILIFI">Kilifi</option>
              <option value="KWALE">Kwale</option>
              <option value="LAMU">Lamu</option>
              <option value="TANA RIVER">Tana River</option>
              <option value="MOMBASA">Mombasa</option>
            </select>
          </div>
        </div>

        {appsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner"></div>
            <p>Loading applications...</p>
          </div>
        ) : (
          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>County</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td>{app.name}</td>
                      <td>{app.position?.title || 'Unknown'}</td>
                      <td>{app.county}</td>
                      <td>{app.email}</td>
                      <td>
                        <span className={`app-status-badge ${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="action-buttons">
                        {app.status === 'pending' && (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() => handleApproveApplication(app.id)}
                              disabled={approveLoading}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleRejectApplication(app.id)}
                              disabled={rejectLoading}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status !== 'pending' && (
                          <span className="status-lock">
                            {app.status === 'approved' ? '✓' : '✗'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real-time System Activity */}
      <div className="section-card">
        <h3>Real-Time System Activity</h3>
        <div className="activity-feed">
          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              No recent activity
            </div>
          ) : (
            activity.slice(0, 10).map((item: any, idx: number) => (
              <div key={idx} className="activity-item">
                <div className="activity-type">{item.type?.replace(/_/g, ' ').toUpperCase()}</div>
                <div className="activity-data">{JSON.stringify(item.data)}</div>
                <div className="activity-time">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-elections-panel {
          padding: 20px;
          gap: 20px;
          display: flex;
          flex-direction: column;
        }

        .elections-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-header {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #3f51b5;
        }

        .section-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .section-header h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .toggle-btn {
          padding: 8px 16px;
          background: #3f51b5;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .toggle-btn:hover {
          background: #3f51b5dd;
        }

        .status-breakdown {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          background: #f5f7fa;
          border-radius: 6px;
        }

        .status-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }

        .status-count {
          font-size: 24px;
          font-weight: bold;
          color: #3f51b5;
        }

        .positions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .position-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 6px;
        }

        .position-item input[type='checkbox'] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .position-info {
          flex: 1;
        }

        .position-title {
          font-weight: 500;
          color: #333;
        }

        .position-meta {
          font-size: 12px;
          color: #999;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .open-badge {
          background: #4caf50;
          color: white;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 10px;
        }

        .closed-badge {
          background: #f44336;
          color: white;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 10px;
        }

        .position-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .action-btn-open,
        .action-btn-close {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .action-btn-open {
          background: #4caf50;
          color: white;
        }

        .action-btn-close {
          background: #f44336;
          color: white;
        }

        .action-btn-open:disabled,
        .action-btn-close:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .filter-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .applications-table {
          overflow-x: auto;
        }

        .applications-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .applications-table thead {
          background: #f5f7fa;
        }

        .applications-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }

        .applications-table td {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 13px;
        }

        .app-status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
        }

        .app-status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }

        .app-status-badge.approved {
          background: #d4edda;
          color: #155724;
        }

        .app-status-badge.rejected {
          background: #f8d7da;
          color: #721c24;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-approve,
        .btn-reject {
          padding: 6px 12px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
        }

        .btn-approve {
          background: #4caf50;
          color: white;
        }

        .btn-reject {
          background: #f44336;
          color: white;
        }

        .btn-approve:disabled,
        .btn-reject:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .status-lock {
          font-size: 16px;
          font-weight: bold;
          color: #999;
        }

        .activity-feed {
          max-height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .activity-item {
          padding: 10px;
          background: #f5f7fa;
          border-radius: 4px;
          border-left: 3px solid #3f51b5;
        }

        .activity-type {
          font-weight: 500;
          color: #333;
          font-size: 12px;
        }

        .activity-data {
          font-size: 11px;
          color: #666;
          margin-top: 4px;
          word-break: break-all;
        }

        .activity-time {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e0e0e0;
          border-top-color: #3f51b5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
