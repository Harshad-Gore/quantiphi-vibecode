import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Dashboard({ user }) {
  const [rsvps, setRsvps] = useState([]);
  const load = useCallback(async () => {
    if (!user?._id) return;
    setRsvps(await api.myRsvps(user._id).catch(() => []));
  }, [user?._id]);
  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    await api.cancelRsvp(id);
    load();
  };

  const remind = async (r) => {
    const remindAt = new Date(new Date(r.startsAt).getTime() - 3 * 3600e3).toISOString();
    await api.remind({ userId: user._id, eventId: r.eventId, remindAt });
    alert('Reminder set for 3 hours before the event.');
  };

  if (!user) return <p className="max-w-6xl mx-auto p-6 text-paper/60">Signing you in…</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-display font-extrabold text-3xl tracking-tight">My RSVPs</h1>
      <p className="text-paper/60 text-sm mt-1 mb-5">{rsvps.length} confirmed · reminders fire 3h before showtime.</p>
      {!rsvps.length ? (
        <p className="text-paper/60 text-sm">Nothing yet. <Link to="/" className="underline text-poster">Discover events</Link> and hit Interested.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {rsvps.map((r) => (
            <li key={r._id} className="bg-paper text-ink rounded-2xl p-4 flex gap-3">
              {r.imageUrl && <img src={r.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover" />}
              <div className="flex-1">
                <p className="font-display font-bold leading-tight">{r.eventTitle}</p>
                <p className="text-xs text-ink/60">{r.venue} · {r.startsAt ? new Date(r.startsAt).toLocaleString('en-IN') : ''}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => remind(r)} className="text-xs font-semibold rounded-lg bg-ink text-paper px-2.5 py-1.5">Remind me</button>
                  <button onClick={() => cancel(r._id)} className="text-xs font-semibold rounded-lg bg-ink/10 px-2.5 py-1.5">Cancel</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
