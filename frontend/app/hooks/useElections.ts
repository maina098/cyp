import { useEffect, useState } from 'react';
import { getElections, Election } from '@/lib/api';

export function useElections() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const data = await getElections();
        setElections(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load elections');
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  return { elections, loading, error };
}
