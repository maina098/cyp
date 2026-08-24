import { useState } from 'react';
import { submitApplication, ElectionApplication } from '@/lib/api';

export function useSubmitApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    positionId: string,
    electionId: string,
    data: {
      name: string;
      email: string;
      county: string;
      constituency?: string;
      age: number;
      description: string;
      reasonForApplying?: string;
      changeChampion: string;
      comments?: string;
    }
  ): Promise<ElectionApplication | null> => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const result = await submitApplication(token, positionId, electionId, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit application');
      }
      return result.data || null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
