'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE, WS_BASE } from '@/lib/api-base';

const WS_URL = WS_BASE.replace(/^ws/, 'http');

export type ElectionCandidate = {
  id: string;
  name: string;
  bio?: string | null;
  photoUrl?: string | null;
  position?: number;
  positionId?: string | null;
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
  positions?: Array<{ id: string; title: string }>;
  electionResults?: Array<{
    id: string;
    candidateId: string;
    voteCount: number;
    candidate?: ElectionCandidate;
  }>;
};

function getCandidatePositionKey(candidate: ElectionCandidate) {
  return candidate.positionId || `ordinal:${candidate.position ?? 0}`;
}

export default function LiveElection({ election }: { election: ElectionDetails }) {
  const [results, setResults] = useState<Array<{ candidateId: string; voteCount: number; candidate?: ElectionCandidate }>>(
    Array.isArray(election?.electionResults) ? election.electionResults : [],
  );
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [countdown, setCountdown] = useState('');

  const isActive = election.status === 'active';
  const isClosed = election.status === 'closed';

  useEffect(() => {
    const socket: Socket = io(`${WS_URL}/results`, {
      transports: ['websocket'],
      withCredentials: true,
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
    const loadResults = async () => {
      try {
        const response = await fetch(`${API_BASE}/elections/${election.id}/results`, { cache: 'no-store', credentials: 'include' });
        if (!response.ok) return;
        const payload = await response.json();
        if (Array.isArray(payload)) setResults(payload);
        else if (Array.isArray(payload?.results)) setResults(payload.results);
      } catch {
        // WebSocket updates remain the primary live path.
      }
    };
    loadResults();
    const timer = window.setInterval(loadResults, 15000);
    return () => window.clearInterval(timer);
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
    const token = 'cookie-session';

    const loadVote = async () => {
      try {
        const response = await fetch(`${API_BASE}/elections/${election?.id}/my-vote`, {
          credentials: 'include',
          headers: {},
        });
        if (response.ok) {
          const data = await response.json();
          const votes = Array.isArray(data) ? data : data?.candidateId ? [data] : [];
          if (votes.length) setHasVoted(true);
          setSelectedCandidates(Object.fromEntries(votes.map((vote: { positionId?: string | null; candidateId: string }) => [vote.positionId || 'general', vote.candidateId])));
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

  const candidatesByPosition = useMemo(() => {
    const groups = new Map<string, ElectionCandidate[]>();
    for (const candidate of election.candidates) {
      const key = getCandidatePositionKey(candidate);
      const group = groups.get(key) || [];
      group.push(candidate);
      groups.set(key, group);
    }
    return Array.from(groups.values());
  }, [election.candidates]);

  const voteNow = async () => {
    const selections = Object.values(selectedCandidates);
    if (!selections.length || selections.length < candidatesByPosition.length) {
      setMessage('Select one candidate for every position.');
      return;
    }

    const token = 'cookie-session';

    setLoading(true);
    setMessage(null);

    try {
      for (const candidateId of selections) {
        const response = await fetch(`${API_BASE}/elections/${election?.id}/vote`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Unable to cast vote');
      }

      setHasVoted(true);
      setMessage('Vote recorded successfully.');
      const responseResults = await fetch(`${API_BASE}/elections/${election?.id}/results`, {
        credentials: 'include',
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
          {candidatesByPosition.map((positionCandidates) => positionCandidates.map((candidate, candidateIndex) => {
            const candidateResult = results.find((item) => item.candidateId === candidate.id);
            const voteCount = candidateResult?.voteCount ?? 0;
            const positionVotes = positionCandidates.reduce((sum, item) => sum + (results.find((result) => result.candidateId === item.id)?.voteCount || 0), 0);
            const winnerShare = positionVotes > 0 ? (voteCount / positionVotes) * 100 : 0;
            const positionTitle = election.positions?.find((position) => position.id === candidate.positionId)?.title || (candidate.position && election.positions?.[candidate.position - 1]?.title);
            const positionWinner = positionCandidates.reduce<ElectionCandidate | null>((winner, item) => {
              const itemVotes = results.find((result) => result.candidateId === item.id)?.voteCount || 0;
              const winnerVotes = winner ? results.find((result) => result.candidateId === winner.id)?.voteCount || 0 : -1;
              return itemVotes > winnerVotes ? item : winner;
            }, null);

            return (
              <div key={candidate.id}>
                {candidateIndex === 0 && <h3 style={{ margin: '12px 0 8px' }}>{positionTitle || 'Candidates'}</h3>}
                <label className={`candidate-card ${selectedCandidates[getCandidatePositionKey(candidate)] === candidate.id ? 'selected' : ''}`} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, border: '1px solid #dfe6ff', borderRadius: 16, background: selectedCandidates[getCandidatePositionKey(candidate)] === candidate.id ? '#eef3ff' : '#fff' }}>
                <input
                  type="radio"
                  name={`candidate-${getCandidatePositionKey(candidate)}`}
                  checked={selectedCandidates[getCandidatePositionKey(candidate)] === candidate.id}
                  onChange={() => setSelectedCandidates((current) => ({ ...current, [getCandidatePositionKey(candidate)]: candidate.id }))}
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
                    <strong>{voteCount} votes · {winnerShare.toFixed(2)}%{isClosed && positionWinner?.id === candidate.id && positionVotes > 0 ? ' · Winner' : ''}</strong>
                  </div>
                  <div className="vote-bar" style={{ marginTop: 8, height: 10, background: '#edf2ff', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${winnerShare}%`, height: '100%', background: '#3f51b5' }} />
                  </div>
                </div>
                </label>
              </div>
            );
          }))}
        </div>

        <aside className="panel-box vote-summary" style={{ padding: 20, display: 'grid', alignContent: 'start', gap: 12 }}>
          <h3>Election summary</h3>
          <div className="summary-stat"><span>Total votes</span><strong>{totalVotes}</strong></div>
          <div className="summary-stat"><span>Window</span><strong>{election.status}</strong></div>
          <div className="summary-stat"><span>Starts</span><strong>{new Date(election.startsAt).toLocaleString()}</strong></div>
          <div className="summary-stat"><span>Ends</span><strong>{new Date(election.endsAt).toLocaleString()}</strong></div>

          <div className="vote-breakdown" aria-label="Vote percentage breakdown">
            <div className="vote-donut" style={{ background: `conic-gradient(${results.map((item, index) => { const start = results.slice(0, index).reduce((sum, previous) => sum + (totalVotes ? Number(previous.voteCount || 0) / totalVotes * 360 : 0), 0); const end = start + (totalVotes ? Number(item.voteCount || 0) / totalVotes * 360 : 0); return `${['#3f51b5', '#16877d', '#d97706', '#b42318'][index % 4]} ${start}deg ${end}deg`; }).join(', ') || '#edf2ff 0 360deg'})` }}>
              <span>{totalVotes ? '100%' : '0%'}</span>
            </div>
            <div className="vote-legend">{election.candidates.map((candidate) => { const count = results.find((item) => item.candidateId === candidate.id)?.voteCount || 0; return <span key={candidate.id}><i />{candidate.name}: {totalVotes ? ((count / totalVotes) * 100).toFixed(2) : '0.00'}%</span> })}</div>
          </div>

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
