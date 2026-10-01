import { useMemo, useState } from 'react';

// Poster-wall month grid. `density` = { 'YYYY-MM-DD': count } computed server-side.
// Presentation only: no filtering logic beyond emitting the picked day.
export default function EventCalendar({ density = {}, selected, onSelect }) {
  const [cursor, setCursor] = useState(() => {
    const base = selected ? new Date(selected + 'T12:00:00') : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const cells = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    return { y, m, first, days };
  }, [cursor]);
  const key = (d) => `${cells.y}-${String(cells.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const monthName = cursor.toLocaleString('en', { month: 'long', year: 'numeric' });

  return (
    <section aria-label="Event calendar" className="bg-inksoft border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold">{monthName}</h2>
        <div className="flex gap-2">
          <button aria-label="Previous month" className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10" onClick={() => setCursor(new Date(cells.y, cells.m - 1, 1))}>‹</button>
          <button aria-label="Next month" className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10" onClick={() => setCursor(new Date(cells.y, cells.m + 1, 1))}>›</button>
          {selected && <button className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs" onClick={() => onSelect(null)}>Clear</button>}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-paper/50 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: cells.first }).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: cells.days }).map((_, i) => {
          const day = i + 1;
          const k = key(day);
          const count = density[k] || 0;
          const active = selected === k;
          return (
            <button
              key={k}
              onClick={() => onSelect(active ? null : k)}
              title={count ? `${count} event${count > 1 ? 's' : ''} on ${k}` : k}
              className={`relative rounded-xl py-2 text-sm font-medium transition ${
                active ? 'bg-poster text-ink' : count ? 'bg-vibepink/20 text-paper hover:bg-vibepink/30 border border-vibepink/40' : 'bg-white/[0.03] text-paper/40 hover:bg-white/10'
              }`}
            >
              {day}
              {count > 0 && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 rounded-full ${active ? 'bg-ink' : 'bg-poster'}`} style={{ width: Math.min(6 + count * 4, 26) }} />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-paper/50">Dates glowing pink have events. Pick one to filter the feed.</p>
    </section>
  );
}
