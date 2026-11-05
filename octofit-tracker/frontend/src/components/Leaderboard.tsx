import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Entry = { teamName?: string; totalPoints?: number; rank?: number };

export default function Leaderboard() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getJson<{ leaderboard: Entry[] }>('/api/leaderboard')
      .then((data) => setEntries(data.leaderboard ?? []))
      .catch(() => setError('Unable to load leaderboard. The service is unavailable.'));
  }, []);
  return (
    <section>
      <h2>Leaderboard</h2>
      {entries === null && !error && <p role="status">Loading leaderboard...</p>}
      {error && <p role="alert">Error: {error}</p>}
      {entries !== null && entries.length === 0 && <p>No leaderboard rankings yet.</p>}
      {entries !== null && entries.length > 0 && (
        <ol>{entries.map((e, i) => <li key={i}>#{e.rank} {e.teamName} - {e.totalPoints} points</li>)}</ol>
      )}
    </section>
  );
}
