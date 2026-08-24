import { useElectionContext } from './election-context';
import { useCallback, useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useElections = () => {
  const { elections, loading, fetchElections } = useElectionContext();

  useEffect(() => {
    if (elections.length === 0) {
      fetchElections();
    }
  }, []);

  return { elections, loading, refetch: fetchElections };
};

export const useSelectedElection = () => {
  const { selectedElection, selectElection } = useElectionContext();
  return { election: selectedElection, selectElection };
};

export const useElectionPositions = (electionId?: string) => {
  const { positions, fetchPositions } = useElectionContext();
  const [filteredPositions, setFilteredPositions] = useState(positions);

  useEffect(() => {
    if (electionId) {
      fetchPositions(electionId);
    }
  }, [electionId]);

  useEffect(() => {
    setFilteredPositions(positions);
  }, [positions]);

  return { positions: filteredPositions, refetch: () => fetchPositions(electionId || '') };
};

export const useUserApplications = () => {
  const { applications } = useElectionContext();
  return { applications };
};

export const useSubmitApplication = () => {
  const { submitApplication, selectedElection } = useElectionContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (positionId: string, formData: any) => {
      try {
        setLoading(true);
        setError(null);
        const result = await submitApplication(positionId, formData);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit application';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [submitApplication],
  );

  return { submit, loading, error };
};

export const useElectionDashboard = (electionId: string) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/elections/${electionId}/dashboard-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    if (electionId) {
      fetchStats();
    }
  }, [electionId, fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useElectionApplications = (electionId: string, filters?: any) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const query = new URLSearchParams();

      if (filters?.status) query.append('status', filters.status);
      if (filters?.positionId) query.append('positionId', filters.positionId);
      if (filters?.county) query.append('county', filters.county);

      const response = await fetch(
        `${API_BASE}/elections/${electionId}/applications?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [electionId, filters]);

  useEffect(() => {
    if (electionId) {
      fetchApplications();
    }
  }, [electionId, filters, fetchApplications]);

  return { applications, loading, error, refetch: fetchApplications };
};

export const useApproveApplication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = useCallback(async (electionId: string, applicationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/elections/${electionId}/applications/${applicationId}/approve`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve application');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve application';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { approve, loading, error };
};

export const useRejectApplication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reject = useCallback(async (electionId: string, applicationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/elections/${electionId}/applications/${applicationId}/reject`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject application');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject application';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reject, loading, error };
};

export const useSystemActivity = () => {
  const { systemActivity, subscribeToSystemActivity, unsubscribeFromSystemActivity } =
    useElectionContext();

  useEffect(() => {
    subscribeToSystemActivity();
    return () => unsubscribeFromSystemActivity();
  }, []);

  return { activity: systemActivity };
};

export const useOpenPositions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPositions = useCallback(
    async (electionId: string, positionIds: string[]) => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_BASE}/elections/${electionId}/open-positions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ positionIds }),
          },
        );

        if (response.ok) {
          return await response.json();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to open positions');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to open positions';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { openPositions, loading, error };
};

export const useClosePositions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closePositions = useCallback(
    async (electionId: string, positionIds: string[]) => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_BASE}/elections/${electionId}/close-positions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ positionIds }),
          },
        );

        if (response.ok) {
          return await response.json();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to close positions');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to close positions';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { closePositions, loading, error };
};
