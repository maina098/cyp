import { useEffect, useState } from 'react';
import { getAllApplications, ElectionApplication } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

export function useAdminApplications(electionId?: string, positionId?: string) {
  const [applications, setApplications] = useState<ElectionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setApplications([]);
          return;
        }
        const data = await getAllApplications(token, { electionId, positionId });
        setApplications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [electionId, positionId]);

  useEffect(() => {
    if (!electionId) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const newSocket = io(`${API_BASE}/results`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      newSocket.emit('subscribeApplications', electionId);
    });

    newSocket.on('newApplication', (payload) => {
      setApplications((prev) => [payload.application, ...prev]);
    });

    newSocket.on('applicationStatusUpdate', (payload) => {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === payload.application.id ? payload.application : app
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [electionId]);

  const refetch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await getAllApplications(token, { electionId, positionId });
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refetch applications');
    }
  };

  return { applications, loading, error, refetch, socket };
}
