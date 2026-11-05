import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type?: string; minutes?: number; points?: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities ?? []))
      .catch(() => setError('Unable to load activities. The service is unavailable.'));
  }, []);
  return (
    <section>
      <h2>Activities</h2>
      {activities === null && !error && <p role="status">Loading activities...</p>}
      {error && <p role="alert">Error: {error}</p>}
      {activities !== null && activities.length === 0 && <p>No activities yet. Check back soon for an empty state update.</p>}
      {activities !== null && activities.length > 0 && (
        <ul>{activities.map((a, i) => <li key={i}>{a.type} - {a.minutes} minutes - {a.points} points</li>)}</ul>
      )}
    </section>
  );
}
