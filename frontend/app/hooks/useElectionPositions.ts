import { useEffect, useState } from 'react';
import { getElectionPositions, ElectionPosition } from '@/lib/api';

export function useElectionPositions(electionId: string) {
  const [positions, setPositions] = useState<ElectionPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!electionId) {
      setPositions([]);
      return;
    }

    const fetchPositions = async () => {
      try {
        setLoading(true);
        const data = await getElectionPositions(electionId);
        setPositions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load positions');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [electionId]);

  return { positions, loading, error };
}
