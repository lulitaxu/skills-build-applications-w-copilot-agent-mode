import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Suggestion = { title?: string; focus?: string; minutes?: number; reason?: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getJson<{ suggestions: Suggestion[] }>('/api/workouts/suggestions/mona@example.com')
      .then((data) => setSuggestions(data.suggestions ?? []))
      .catch(() => setError('Unable to load workout suggestions. The service is unavailable.'));
  }, []);
  return (
    <section>
      <h2>Workout suggestions</h2>
      {suggestions === null && !error && <p role="status">Loading workout suggestions...</p>}
      {error && <p role="alert">Error: {error}</p>}
      {suggestions !== null && suggestions.length === 0 && <p>No workout suggestions available.</p>}
      {suggestions !== null && suggestions.length > 0 && (
        <ul>{suggestions.map((s, i) => <li key={i}>{s.title}{s.focus ? ` - ${s.focus}` : ''}{s.minutes ? ` - ${s.minutes} minutes` : ''}{s.reason ? ` - ${s.reason}` : ''}</li>)}</ul>
      )}
    </section>
  );
}
