'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Election {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'closed';
  startsAt: string;
  endsAt: string;
  createdBy?: string;
}

export interface ElectionPosition {
  id: string;
  title: string;
  description?: string;
  isOpen: boolean;
  maxApplicants: number;
  applicationCount?: number;
}

export interface ElectionApplication {
  id: string;
  electionId: string;
  positionId: string;
  userId: string;
  name: string;
  email: string;
  county: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  appliedAt: string;
}

interface ElectionContextType {
  elections: Election[];
  selectedElection: Election | null;
  positions: ElectionPosition[];
  applications: ElectionApplication[];
  systemActivity: any[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Methods
  selectElection: (electionId: string) => void;
  fetchElections: () => Promise<void>;
  fetchPositions: (electionId: string) => Promise<void>;
  fetchApplications: (electionId: string) => Promise<void>;
  submitApplication: (positionId: string, formData: any) => Promise<void>;
  subscribeToSystemActivity: () => void;
  unsubscribeFromSystemActivity: () => void;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const ElectionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<ElectionPosition[]>([]);
  const [applications, setApplications] = useState<ElectionApplication[]>([]);
  const [systemActivity, setSystemActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(`${API_BASE.replace('http', 'ws')}/results`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('statusUpdate', (data: any) => {
      setElections((prev) =>
        prev.map((e) =>
          e.id === data.electionId ? { ...e, status: data.status } : e,
        ),
      );
      if (selectedElection?.id === data.electionId) {
        setSelectedElection((prev) =>
          prev ? { ...prev, status: data.status } : null,
        );
      }
    });

    newSocket.on('newApplication', (data: any) => {
      if (data.application.electionId === selectedElection?.id) {
        setApplications((prev) => [data.application, ...prev]);
      }
    });

    newSocket.on('applicationStatusUpdate', (data: any) => {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === data.application.id ? data.application : a,
        ),
      );
    });

    newSocket.on('positionsUpdate', (data: any) => {
      setPositions(data.positions);
    });

    newSocket.on('systemActivity', (data: any) => {
      setSystemActivity((prev) => [data, ...prev].slice(0, 100));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [API_BASE]);

  const selectElection = useCallback((electionId: string) => {
    const election = elections.find((e) => e.id === electionId);
    setSelectedElection(election || null);
    if (election) {
      fetchPositions(electionId);
      fetchApplications(electionId);
      socket?.emit('subscribeElection', electionId);
      socket?.emit('subscribeApplications', electionId);
    }
  }, [elections, socket]);

  const fetchElections = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/elections`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setElections(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && !selectedElection) {
          selectElection(data[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, selectedElection]);

  const fetchPositions = useCallback(async (electionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/positions?electionId=${electionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPositions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
    }
  }, [API_BASE]);

  const fetchApplications = useCallback(async (electionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/applications/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const filtered = Array.isArray(data)
          ? data.filter((app: any) => app.electionId === electionId)
          : [];
        setApplications(filtered);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    }
  }, [API_BASE]);

  const submitApplication = useCallback(async (positionId: string, formData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          positionId,
          electionId: selectedElection?.id,
          ...formData,
        }),
      });

      if (response.ok) {
        const app = await response.json();
        setApplications((prev) => [app, ...prev]);
        return app;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit application';
      setError(message);
      throw err;
    }
  }, [API_BASE, selectedElection?.id]);

  const subscribeToSystemActivity = useCallback(() => {
    socket?.emit('subscribeSystemActivity');
  }, [socket]);

  const unsubscribeFromSystemActivity = useCallback(() => {
    socket?.off('systemActivity');
  }, [socket]);

  const value: ElectionContextType = {
    elections,
    selectedElection,
    positions,
    applications,
    systemActivity,
    loading,
    error,
    isConnected,
    selectElection,
    fetchElections,
    fetchPositions,
    fetchApplications,
    submitApplication,
    subscribeToSystemActivity,
    unsubscribeFromSystemActivity,
  };

  return (
    <ElectionContext.Provider value={value}>
      {children}
    </ElectionContext.Provider>
  );
};

export const useElectionContext = () => {
  const context = useContext(ElectionContext);
  if (context === undefined) {
    throw new Error('useElectionContext must be used within ElectionContextProvider');
  }
  return context;
};
