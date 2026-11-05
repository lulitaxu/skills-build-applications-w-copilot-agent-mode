import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name?: string; mascot?: string; members?: unknown[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams ?? []))
      .catch(() => setError('Unable to load teams. The service is unavailable.'));
  }, []);
  return (
    <section>
      <h2>Teams</h2>
      {teams === null && !error && <p role="status">Loading teams...</p>}
      {error && <p role="alert">Error: {error}</p>}
      {teams !== null && teams.length === 0 && <p>No teams yet.</p>}
      {teams !== null && teams.length > 0 && (
        <ul>{teams.map((t, i) => <li key={i}>{t.name}{t.mascot ? ` (mascot: ${t.mascot})` : ''} - {t.members ? `${t.members.length} member(s): ${t.members.map((m) => String(m)).join(', ')}` : ''}</li>)}</ul>
      )}
    </section>
  );
}
