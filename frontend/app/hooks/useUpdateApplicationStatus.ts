import { useState } from 'react';
import { updateApplicationStatus, ElectionApplication } from '@/lib/api';

export function useUpdateApplicationStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (
    applicationId: string,
    status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  ): Promise<ElectionApplication | null> => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const result = await updateApplicationStatus(token, applicationId, status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update status');
      }
      return result.data || null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
