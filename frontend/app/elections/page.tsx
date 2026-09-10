'use client';

import { useEffect, useState } from 'react';
import LiveElection, { ElectionDetails } from './live-election';
import { API_BASE } from '@/lib/api-base';

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
        const payload = await response.json();
        const elections = (Array.isArray(payload) ? payload : payload?.data || []) as Array<{ id: string; status: string }>;
        const activeElection = elections.find((item) => item.status === 'active' || item.status === 'scheduled') ?? (elections[0] || null);

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
