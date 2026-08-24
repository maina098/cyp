import { useEffect, useState } from 'react';
import { getUserApplications, ElectionApplication } from '@/lib/api';

export function useUserApplications() {
  const [applications, setApplications] = useState<ElectionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setApplications([]);
          return;
        }
        const data = await getUserApplications(token);
        setApplications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const refetch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await getUserApplications(token);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refetch applications');
    }
  };

  return { applications, loading, error, refetch };
}
