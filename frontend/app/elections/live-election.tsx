'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export type ElectionCandidate = {
  id: string;
  name: string;
  bio?: string | null;
  photoUrl?: string | null;
  position?: number;
};

export type ElectionDetails = {
  id: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'scheduled' | 'active' | 'closed';
  startsAt: string;
  endsAt: string;
  createdBy: string;
  candidates: ElectionCandidate[];
  electionResults?: Array<{
    id: string;
    candidateId: string;
    voteCount: number;
    candidate?: ElectionCandidate;
  }>;
};

export default function LiveElection({ election }: { election: ElectionDetails }) {
  const [results, setResults] = useState<Array<{ candidateId: string; voteCount: number; candidate?: ElectionCandidate }>>(
    Array.isArray(election?.electionResults) ? election.electionResults : [],
  );
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [countdown, setCountdown] = useState('');

  const isActive = election.status === 'active';
  const isClosed = election.status === 'closed';

  useEffect(() => {
    const socket: Socket = io(`${WS_URL}/results`, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') },
    });

    socket.emit('subscribeElection', election?.id);
    socket.on('resultsUpdate', (nextResults) => {
      if (Array.isArray(nextResults)) {
        setResults(nextResults);
      } else if (Array.isArray(nextResults?.results)) {
        setResults(nextResults.results);
      }
    });
    socket.on('statusUpdate', (payload) => {
      if (payload?.electionId === election?.id) {
        window.location.reload();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [election.id]);

  useEffect(() => {
    const targetTime = isClosed ? new Date(election.endsAt).getTime() : new Date(election.startsAt).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [election.startsAt, election.endsAt, isClosed]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please sign in to vote.');
      return;
    }

    const loadVote = async () => {
      try {
        const response = await fetch(`${API_BASE}/elections/${election?.id}/my-vote`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.candidateId) {
            setHasVoted(true);
            setSelectedCandidate(data.candidateId);
          }
        }
      } catch {
        // ignore
      }
    };

    loadVote();
  }, [election.id]);

  const totalVotes = useMemo(
    () => (Array.isArray(results) ? results.reduce((sum, item) => sum + Number(item?.voteCount || 0), 0) : 0),
    [results],
  );

  const voteNow = async () => {
    if (!selectedCandidate) {
      setMessage('Select a candidate to vote.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please sign in to vote.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/elections/${election?.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId: selectedCandidate }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to cast vote');
      }

      setHasVoted(true);
      setMessage('Vote recorded successfully.');
      const responseResults = await fetch(`${API_BASE}/elections/${election?.id}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (responseResults.ok) {
        const nextData = await responseResults.json();
        setResults(Array.isArray(nextData) ? nextData : nextData.results || []);
      }
    } catch (error: any) {
      setMessage(error.message || 'Unable to cast vote.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="election-live-panel" style={{ display: 'grid', gap: 20 }}>
      <div className="panel-box election-hero">
        <div>
          <p className="section-kicker">Live election</p>
          <h2>{election.title}</h2>
          <p>{election.description || 'Vote for the candidate you believe best represents your constituency.'}</p>
        </div>
        <div className="election-status-pill" data-status={election.status}>
          {election.status}
        </div>
      </div>

      <div className="panel-box election-countdown-box">
        <div>
          <p className="section-kicker">Countdown</p>
          <h3>{election.status === 'closed' ? 'Voting closed' : 'Voting window'}</h3>
        </div>
        <strong>{countdown}</strong>
      </div>

      <div className="panel-box election-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        <div className="candidate-list" style={{ display: 'grid', gap: 16 }}>
          {election.candidates.map((candidate) => {
            const candidateResult = results.find((item) => item.candidateId === candidate.id);
            const voteCount = candidateResult?.voteCount ?? 0;
            const winnerShare = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

            return (
              <label key={candidate.id} className={`candidate-card ${selectedCandidate === candidate.id ? 'selected' : ''}`} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, border: '1px solid #dfe6ff', borderRadius: 16, background: selectedCandidate === candidate.id ? '#eef3ff' : '#fff' }}>
                <input
                  type="radio"
                  name="candidate"
                  checked={selectedCandidate === candidate.id}
                  onChange={() => setSelectedCandidate(candidate.id)}
                  disabled={!isActive || hasVoted}
                />
                <div className="candidate-avatar" style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #3f51b5, #7c4dff)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <h4>{candidate.name}</h4>
                      {candidate.bio && <p>{candidate.bio}</p>}
                    </div>
                    <strong>{voteCount} votes</strong>
                  </div>
                  <div className="vote-bar" style={{ marginTop: 8, height: 10, background: '#edf2ff', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${winnerShare}%`, height: '100%', background: 'linear-gradient(90deg, #3f51b5, #7c4dff)' }} />
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <aside className="panel-box vote-summary" style={{ padding: 20, display: 'grid', alignContent: 'start', gap: 12 }}>
          <h3>Election summary</h3>
          <div className="summary-stat"><span>Total votes</span><strong>{totalVotes}</strong></div>
          <div className="summary-stat"><span>Window</span><strong>{election.status}</strong></div>
          <div className="summary-stat"><span>Starts</span><strong>{new Date(election.startsAt).toLocaleString()}</strong></div>
          <div className="summary-stat"><span>Ends</span><strong>{new Date(election.endsAt).toLocaleString()}</strong></div>

          <button
            type="button"
            className="primary-btn"
            onClick={voteNow}
            disabled={!isActive || hasVoted || loading}
            style={{ marginTop: 10 }}
          >
            {loading ? 'Submitting...' : hasVoted ? 'Vote submitted' : 'Cast vote'}
          </button>

          {message && <div className="vote-message" style={{ color: message.includes('success') ? '#1d7a3d' : '#b42318' }}>{message}</div>}
        </aside>
      </div>
    </section>
  );
}
