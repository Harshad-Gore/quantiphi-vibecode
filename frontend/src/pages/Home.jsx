import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import EventCalendar from '../components/EventCalendar';
import EventCard from '../components/EventCard';
import ChatWidget from '../components/ChatWidget';

const EMPTY_FILTERS = { keyword: '', city: '', day: null };

function SkeletonCard() {
  return (
    <div aria-hidden className="bg-paper/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="h-36 bg-white/10 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-white/10 animate-pulse" />
        <div className="h-9 rounded-xl bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

export default function Home({ user }) {
  const [events, setEvents] = useState([]);
  const [density, setDensity] = useState({});
  const [rsvpIds, setRsvpIds] = useState(new Set());
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [chatEvents, setChatEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feed, setFeed] = useState({ source: '', note: '' });

  const load = useCallback(async () => {
    const params = { city: filters.city, keyword: filters.keyword };
    if (filters.day) {
      params.startDate = new Date(filters.day + 'T00:00:00').toISOString();
      params.endDate = new Date(filters.day + 'T23:59:59').toISOString();
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.events(params);
      setEvents(data.events || []);
      setDensity(data.calendar || {});
      setFeed({ source: data.source || '', note: data.note || '' });
      if (user?._id) {
        const mine = await api.myRsvps(user._id).catch(() => []);
        setRsvpIds(new Set(mine.map((r) => r.eventId)));
      }
    } catch (e) {
      setError('Could not reach the event feed. Check that the backend is running on :8080, then retry.');
    } finally {
      setLoading(false);
    }
  }, [filters.city, filters.keyword, filters.day, user?._id]);

  useEffect(() => { load(); }, [load]);

  // Realtime vibe refresh whenever anyone RSVPs / clicks an invite.
  useEffect(() => {
    const s = getSocket();
    const onVibe = () => load();
    s.on('vibe:update', onVibe);
    return () => s.off('vibe:update', onVibe);
  }, [load]);

  const shown = chatEvents || events;
  const filtering = filters.keyword || filters.city || filters.day;
  const clearAll = () => { setChatEvents(null); setFilters(EMPTY_FILTERS); };

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
          <div className="flex gap-3">
            {chatEvents && <button onClick={() => setChatEvents(null)} className="text-xs underline text-poster cursor-pointer">Clear concierge results</button>}
            {filtering && <button onClick={clearAll} className="text-xs underline text-paper/60 cursor-pointer">Clear filters</button>}
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="font-display font-extrabold text-3xl tracking-tight">Tonight, this weekend, whenever.</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <p className="text-paper/60 text-sm" aria-live="polite">
            {loading ? 'Finding events…' : `${shown.length} event${shown.length === 1 ? '' : 's'} · counts update live as friends RSVP and tap invites.`}
          </p>
          {!loading && feed.source && (
            <span title={feed.note || (feed.source === 'ticketmaster' ? 'Live feed from Ticketmaster' : 'Built-in local picks')} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-default ${feed.source === 'ticketmaster' ? 'bg-vipteal/15 text-vipteal border-vipteal/30' : 'bg-white/5 text-paper/60 border-white/15'}`}>
              {feed.source === 'ticketmaster' ? 'Live Ticketmaster feed' : 'Local picks'}
            </span>
          )}
        </div>
        {!loading && !error && feed.note && (
          <p className="text-xs text-paper/50 mb-4">{feed.note}</p>
        )}
        {error && (
          <div role="alert" className="rounded-2xl border border-vibepink/40 bg-vibepink/10 p-5 text-sm">
            <p className="font-semibold text-paper">{error}</p>
            <button onClick={load} className="mt-3 rounded-xl bg-poster text-ink px-4 py-2 text-sm font-semibold cursor-pointer">Retry</button>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4" aria-busy={loading}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : shown.map((e) => (
              <EventCard key={e.id} event={e} user={user} rsvpd={rsvpIds.has(e.id)} onChanged={load} />
            ))}
        </div>
        {!loading && !error && !shown.length && (
          <div className="rounded-2xl border border-white/10 bg-inksoft p-8 text-center mt-2">
            <p className="font-display font-bold text-lg">Nothing on for those filters.</p>
            <p className="text-paper/60 text-sm mt-1">Try a different date or search — or ask the concierge for ideas.</p>
            <button onClick={clearAll} className="mt-4 rounded-xl bg-poster text-ink px-4 py-2 text-sm font-semibold cursor-pointer">Show all events</button>
          </div>
        )}
      </div>
      <ChatWidget onPick={setChatEvents} />
    </div>
  );
}
