'use client';

import { useEffect, useState } from 'react';
import LiveElection, { ElectionDetails } from './live-election';
import { getElections, getElectionById, Election } from '@/lib/api';

export default function ElectionsPage() {
  const [election, setElection] = useState<ElectionDetails | null>(null);
  const [availableElections, setAvailableElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadElection = async () => {
      try {
        const elections = await getElections();
        setAvailableElections(elections);
        const activeElection = elections.find((item) => item.status === 'active')
          ?? elections.find((item) => item.status === 'scheduled');

        if (!activeElection) {
          setLoading(false);
          return;
        }

        const details = await getElectionById(activeElection.id);
        if (!details) {
          throw new Error('Unable to load election details. Please try again later.');
        }
        setElection({ ...details, candidates: details.candidates || [] });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load elections. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadElection();
  }, []);

  if (loading) {
    return <div className="container page-shell"><div className="panel-box">Loading election...</div></div>;
  }

  if (error) {
    return <div className="container page-shell"><div className="panel-box"><h2>Unable to load elections</h2><p>{error}</p></div></div>;
  }

  if (!election) {
    const scheduledElection = availableElections.find((item) => item.status === 'scheduled');
    const draftElection = availableElections.find((item) => item.status === 'draft');
    const latestElection = availableElections[0];
    const statusElection = scheduledElection || draftElection || latestElection;

    return (
      <div className="container page-shell">
        <div className="panel-box">
          <h2>{statusElection ? statusElection.title : 'No election scheduled'}</h2>
          {statusElection?.status === 'scheduled' ? (
            <>
              <p>This election is scheduled, but voting is not open yet.</p>
              <p>Voting starts {new Date(statusElection.startsAt).toLocaleString()}.</p>
            </>
          ) : statusElection?.status === 'draft' ? (
            <p>An election is being prepared, but it has not been scheduled yet.</p>
          ) : statusElection?.status === 'closed' ? (
            <p>The latest election has closed. There is no election available for voting right now.</p>
          ) : (
            <p>No election has been scheduled yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container page-shell">
      <LiveElection election={election} />
    </div>
  );
}
