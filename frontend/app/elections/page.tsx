'use client';

import { useEffect, useState } from 'react';
import LiveElection, { ElectionDetails } from './live-election';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ElectionsPage() {
  const [election, setElection] = useState<ElectionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadElection = async () => {
      try {
        const response = await fetch(`${API_BASE}/elections`);
        if (!response.ok) {
          throw new Error('Unable to load elections');
        }
        const elections = await response.json();
        const activeElection = Array.isArray(elections) ? elections.find((item) => item.status === 'active' || item.status === 'scheduled') ?? elections[0] : null;

        if (!activeElection) {
          setError('No election is currently available.');
          setLoading(false);
          return;
        }

        const detailsResponse = await fetch(`${API_BASE}/elections/${activeElection.id}`);
        if (!detailsResponse.ok) {
          throw new Error('Unable to load election details');
        }

        const details = await detailsResponse.json();
        setElection(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load election');
      } finally {
        setLoading(false);
      }
    };

    loadElection();
  }, []);

  if (loading) {
    return <div className="container page-shell"><div className="panel-box">Loading election...</div></div>;
  }

  if (error || !election) {
    return <div className="container page-shell"><div className="panel-box"><h2>Election not available</h2><p>{error || 'No election found.'}</p></div></div>;
  }

  return (
    <div className="container page-shell">
      <LiveElection election={election} />
    </div>
  );
}
