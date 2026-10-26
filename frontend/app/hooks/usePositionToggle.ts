import { useState } from 'react';
import { openApplications, closeApplications } from '@/lib/api';

export function usePositionToggle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePosition = async (
    electionId: string,
    positionId: string,
    shouldOpen: boolean
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (shouldOpen) {
        result = await openApplications(electionId, positionId);
      } else {
        result = await closeApplications(electionId, positionId);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to update position');
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle position';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { togglePosition, loading, error };
}
