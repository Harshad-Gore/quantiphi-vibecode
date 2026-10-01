import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import EventCalendar from '../components/EventCalendar';
import EventCard from '../components/EventCard';
import ChatWidget from '../components/ChatWidget';

export default function Home({ user }) {
  const [events, setEvents] = useState([]);
  const [density, setDensity] = useState({});
  const [rsvpIds, setRsvpIds] = useState(new Set());
  const [filters, setFilters] = useState({ keyword: '', city: 'Mumbai', day: null });
  const [chatEvents, setChatEvents] = useState(null);

  const load = useCallback(async () => {
    const params = { city: filters.city, keyword: filters.keyword };
    if (filters.day) {
      params.startDate = new Date(filters.day + 'T00:00:00').toISOString();
      params.endDate = new Date(filters.day + 'T23:59:59').toISOString();
    }
    const data = await api.events(params);
    setEvents(data.events || []);
    setDensity(data.calendar || {});
    if (user?._id) {
      const mine = await api.myRsvps(user._id).catch(() => []);
      setRsvpIds(new Set(mine.map((r) => r.eventId)));
    }
  }, [filters.city, filters.keyword, filters.day, user?._id]);

  useEffect(() => { load().catch(console.error); }, [load]);

  // Realtime vibe refresh whenever anyone RSVPs / clicks an invite.
  useEffect(() => {
    const s = getSocket();
    const onVibe = () => load().catch(() => {});
    s.on('vibe:update', onVibe);
    return () => s.off('vibe:update', onVibe);
  }, [load]);

  const shown = chatEvents || events;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[300px_1fr] gap-6">
      <div className="space-y-4">
        <EventCalendar density={density} selected={filters.day} onSelect={(day) => { setChatEvents(null); setFilters((f) => ({ ...f, day })); }} />
        <div className="bg-inksoft border border-white/10 rounded-2xl p-4 space-y-3">
          <label className="block text-xs text-paper/60">Search
            <input value={filters.keyword} onChange={(e) => { setChatEvents(null); setFilters((f) => ({ ...f, keyword: e.target.value })); }} placeholder="comedy, jazz, techno…" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-paper placeholder:text-paper/30" />
          </label>
          <label className="block text-xs text-paper/60">City
            <select value={filters.city} onChange={(e) => { setChatEvents(null); setFilters((f) => ({ ...f, city: e.target.value })); }} className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-paper">
              {['', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Goa'].map((c) => <option key={c} value={c} className="text-black">{c || 'All cities'}</option>)}
            </select>
          </label>
          {chatEvents && <button onClick={() => setChatEvents(null)} className="text-xs underline text-poster">Clear concierge results</button>}
        </div>
      </div>
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight mb-1">Tonight, this weekend, whenever.</h1>
        <p className="text-paper/60 text-sm mb-5">{shown.length} events · counts update live as friends RSVP and tap invites.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {shown.map((e) => (
            <EventCard key={e.id} event={e} user={user} rsvpd={rsvpIds.has(e.id)} onChanged={load} />
          ))}
        </div>
        {!shown.length && <p className="text-paper/50 text-sm mt-8">No events for these filters — try clearing the date or asking the concierge.</p>}
      </div>
      <ChatWidget onPick={setChatEvents} />
    </div>
  );
}
